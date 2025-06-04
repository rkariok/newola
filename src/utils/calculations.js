// Save this as: utils/calculations.js

export const calculateMaxPiecesPerSlab = (pieceW, pieceH, slabW, slabH, includeKerf, kerfWidth) => {
  const kerf = includeKerf ? kerfWidth : 0;
  let maxPieces = 0;

  const fit1W = Math.floor((slabW + kerf) / (pieceW + kerf));
  const fit1H = Math.floor((slabH + kerf) / (pieceH + kerf));
  const option1 = fit1W * fit1H;

  const fit2W = Math.floor((slabW + kerf) / (pieceH + kerf));
  const fit2H = Math.floor((slabH + kerf) / (pieceW + kerf));
  const option2 = fit2W * fit2H;

  maxPieces = Math.max(option1, option2);

  for (let rows1 = 0; rows1 <= Math.floor((slabH + kerf) / (pieceH + kerf)); rows1++) {
    const usedHeight1 = Math.max(0, rows1 * (pieceH + kerf) - kerf);
    const remainingHeight = slabH - usedHeight1;
    
    const pieces1 = rows1 * Math.floor((slabW + kerf) / (pieceW + kerf));
    
    if (remainingHeight >= pieceW) {
      const rows2 = Math.floor((remainingHeight + kerf) / (pieceW + kerf));
      const pieces2 = rows2 * Math.floor((slabW + kerf) / (pieceH + kerf));
      maxPieces = Math.max(maxPieces, pieces1 + pieces2);
    } else {
      maxPieces = Math.max(maxPieces, pieces1);
    }
  }

  for (let rows2 = 0; rows2 <= Math.floor((slabH + kerf) / (pieceW + kerf)); rows2++) {
    const usedHeight2 = Math.max(0, rows2 * (pieceW + kerf) - kerf);
    const remainingHeight = slabH - usedHeight2;
    
    const pieces2 = rows2 * Math.floor((slabW + kerf) / (pieceH + kerf));
    
    if (remainingHeight >= pieceH) {
      const rows1 = Math.floor((remainingHeight + kerf) / (pieceH + kerf));
      const pieces1 = rows1 * Math.floor((slabW + kerf) / (pieceW + kerf));
      maxPieces = Math.max(maxPieces, pieces1 + pieces2);
    } else {
      maxPieces = Math.max(maxPieces, pieces2);
    }
  }

  return maxPieces;
};

export const calculateProductResults = (product, stoneOptions, settings) => {
  // Find stone by matching ALL the fields (brand, type, color)
  const stone = stoneOptions.find(s => {
    // First try to match by the composite identifier (if it exists)
    const stoneIdentifier = `${s.Brand} ${s.Type} - ${s.Color}`;
    if (product.stone === stoneIdentifier) {
      return true;
    }
    
    // Otherwise match by individual fields
    return s.Brand === product.brand && 
           s.Type === product.type && 
           s.Color === product.color;
  });
  
  if (!stone) {
    console.log('No stone found for:', product);
    return { ...product, result: null };
  }

  const slabCost = parseFloat(stone["Slab Cost"]);
  const fabCost = parseFloat(stone["Fab Cost"]);
  const markup = parseFloat(stone["Mark Up"]);
  const w = parseFloat(product.width);
  const d = parseFloat(product.depth);
  const quantity = parseInt(product.quantity);

  if (!w || !d || isNaN(slabCost) || isNaN(fabCost) || isNaN(markup)) {
    console.log('Invalid values for calculation:', { w, d, slabCost, fabCost, markup });
    return { ...product, result: null };
  }

  // Get slab dimensions - either from product selection or from stone data
  let slabWidth, slabHeight;
  
  if (product.slabSize) {
    // Parse from "126" x 63"" format
    const sizeParts = product.slabSize.match(/(\d+)"\s*x\s*(\d+)"/);
    if (sizeParts) {
      slabWidth = parseFloat(sizeParts[1]);
      slabHeight = parseFloat(sizeParts[2]);
    } else {
      slabWidth = parseFloat(stone["Slab Width"]);
      slabHeight = parseFloat(stone["Slab Height"]);
    }
  } else {
    slabWidth = parseFloat(stone["Slab Width"]);
    slabHeight = parseFloat(stone["Slab Height"]);
  }

  const pieces = Array(quantity).fill().map((_, i) => ({
    id: i + 1,
    width: w,
    depth: d,
    name: `${product.brand || ''} ${product.type || ''} - ${product.color || ''} #${i + 1}`
  }));

  // Always calculate with kerf consideration (kerf can be 0)
  const includeKerf = settings.kerfWidth > 0;
  const maxPiecesPerSlab = calculateMaxPiecesPerSlab(
    w, d, slabWidth, slabHeight, 
    includeKerf, settings.kerfWidth
  );
  
  const area = w * d;
  const usableAreaSqft = (area / 144) * quantity;
  const totalSlabsNeeded = Math.ceil(quantity / maxPiecesPerSlab);
  const totalSlabArea = totalSlabsNeeded * slabWidth * slabHeight;
  const totalUsedArea = pieces.reduce((sum, p) => sum + p.width * p.depth, 0);
  const efficiency = totalSlabArea > 0 ? (totalUsedArea / totalSlabArea) * 100 : 0;
  
  // Calculate costs WITHOUT markup first
  const materialCost = (slabCost * totalSlabsNeeded) * (1 + settings.breakageBuffer/100);
  const fabricationCost = settings.includeFabrication !== false ? (usableAreaSqft * fabCost) : 0;
  
  // Add installation cost if enabled
  const installationCost = settings.includeInstallation ? (usableAreaSqft * 15) : 0; // $15 per sqft for installation
  
  // Raw cost is the sum of material, fabrication, and installation costs (no markup yet)
  const rawCost = materialCost + fabricationCost + installationCost;
  
  // Final price applies markup to the entire raw cost
  const finalPrice = rawCost * markup;

  return {
    ...product,
    result: {
      usableAreaSqft,
      totalSlabsNeeded,
      efficiency,
      materialCost,      // This is the base material cost (no markup)
      fabricationCost,   // This is the base fabrication cost (no markup)
      installationCost,  // This is the base installation cost (no markup)
      rawCost,          // This is material + fabrication + installation (no markup)
      finalPrice,       // This is the final price with markup applied to everything
      topsPerSlab: maxPiecesPerSlab,
      slabWidth,        // Include slab dimensions in result
      slabHeight,
      stoneDetails: {   // Include all stone details for display
        brand: stone.Brand,
        type: stone.Type,
        color: stone.Color,
        finish: stone.Finish,
        thickness: stone.Thickness
      }
    }
  };
};
