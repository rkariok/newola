// Save this as: utils/calculations.js

export const calculateMaxPiecesPerSlab = (pieceW, pieceH, slabW, slabH, includeKerf, kerfWidth) => {
  const kerf = includeKerf ? kerfWidth : 0;
  
  // Try both slab orientations and return the maximum
  const maxPieces1 = calculateMaxPiecesForOrientation(pieceW, pieceH, slabW, slabH, kerf);
  const maxPieces2 = calculateMaxPiecesForOrientation(pieceW, pieceH, slabH, slabW, kerf);
  
  return Math.max(maxPieces1, maxPieces2);
};

const calculateMaxPiecesForOrientation = (pieceW, pieceH, slabW, slabH, kerf) => {
  let maxPieces = 0;

  // Option 1: All pieces in original orientation (vertical)
  const fit1W = Math.floor((slabW + kerf) / (pieceW + kerf));
  const fit1H = Math.floor((slabH + kerf) / (pieceH + kerf));
  const option1 = fit1W * fit1H;
  maxPieces = Math.max(maxPieces, option1);

  // Option 2: All pieces rotated 90 degrees (horizontal)
  const fit2W = Math.floor((slabW + kerf) / (pieceH + kerf));
  const fit2H = Math.floor((slabH + kerf) / (pieceW + kerf));
  const option2 = fit2W * fit2H;
  maxPieces = Math.max(maxPieces, option2);

  // Option 3: Mixed arrangements - try ALL possible combinations of vertical rows
  // This is the key fix - we need to try every possible number of vertical rows
  const maxVerticalRows = Math.floor((slabH + kerf) / (pieceH + kerf));
  
  for (let verticalRows = 0; verticalRows <= maxVerticalRows; verticalRows++) {
    // Calculate vertical pieces
    const verticalHeight = verticalRows > 0 ? verticalRows * pieceH + (verticalRows - 1) * kerf : 0;
    const verticalCols = Math.floor((slabW + kerf) / (pieceW + kerf));
    const verticalPieces = verticalRows * verticalCols;
    
    // Calculate remaining height
    const remainingHeight = slabH - verticalHeight;
    
    // Try to fit horizontal pieces in remaining space
    let horizontalPieces = 0;
    if (remainingHeight >= pieceW) {
      // Need at least pieceW height to fit a rotated piece
      const horizontalRows = Math.floor((remainingHeight + kerf) / (pieceW + kerf));
      const horizontalCols = Math.floor((slabW + kerf) / (pieceH + kerf));
      horizontalPieces = horizontalRows * horizontalCols;
    }
    
    const totalPieces = verticalPieces + horizontalPieces;
    maxPieces = Math.max(maxPieces, totalPieces);
  }

  // Option 4: Mixed arrangements - try ALL possible combinations of horizontal rows
  // This ensures we don't miss arrangements like 1 horizontal row + many vertical pieces
  const maxHorizontalRows = Math.floor((slabH + kerf) / (pieceW + kerf));
  
  for (let horizontalRows = 0; horizontalRows <= maxHorizontalRows; horizontalRows++) {
    // Calculate horizontal pieces
    const horizontalHeight = horizontalRows > 0 ? horizontalRows * pieceW + (horizontalRows - 1) * kerf : 0;
    const horizontalCols = Math.floor((slabW + kerf) / (pieceH + kerf));
    const horizontalPieces = horizontalRows * horizontalCols;
    
    // Calculate remaining height
    const remainingHeight = slabH - horizontalHeight;
    
    // Try to fit vertical pieces in remaining space
    let verticalPieces = 0;
    if (remainingHeight >= pieceH) {
      // Need at least pieceH height to fit a vertical piece
      const verticalRows = Math.floor((remainingHeight + kerf) / (pieceH + kerf));
      const verticalCols = Math.floor((slabW + kerf) / (pieceW + kerf));
      verticalPieces = verticalRows * verticalCols;
    }
    
    const totalPieces = horizontalPieces + verticalPieces;
    maxPieces = Math.max(maxPieces, totalPieces);
  }

  // Option 5: Try column-based arrangements (vertical columns first)
  const maxVerticalCols = Math.floor((slabW + kerf) / (pieceW + kerf));
  
  for (let verticalCols = 0; verticalCols <= maxVerticalCols; verticalCols++) {
    // Calculate vertical pieces
    const verticalWidth = verticalCols > 0 ? verticalCols * pieceW + (verticalCols - 1) * kerf : 0;
    const verticalRows = Math.floor((slabH + kerf) / (pieceH + kerf));
    const verticalPieces = verticalCols * verticalRows;
    
    // Calculate remaining width
    const remainingWidth = slabW - verticalWidth;
    
    // Try to fit horizontal pieces in remaining space
    let horizontalPieces = 0;
    if (remainingWidth >= pieceH) {
      // Need at least pieceH width to fit a rotated piece
      const horizontalCols = Math.floor((remainingWidth + kerf) / (pieceH + kerf));
      const horizontalRows = Math.floor((slabH + kerf) / (pieceW + kerf));
      horizontalPieces = horizontalCols * horizontalRows;
    }
    
    const totalPieces = verticalPieces + horizontalPieces;
    maxPieces = Math.max(maxPieces, totalPieces);
  }

  // Option 6: Try column-based arrangements (horizontal columns first)
  const maxHorizontalCols = Math.floor((slabW + kerf) / (pieceH + kerf));
  
  for (let horizontalCols = 0; horizontalCols <= maxHorizontalCols; horizontalCols++) {
    // Calculate horizontal pieces
    const horizontalWidth = horizontalCols > 0 ? horizontalCols * pieceH + (horizontalCols - 1) * kerf : 0;
    const horizontalRows = Math.floor((slabH + kerf) / (pieceW + kerf));
    const horizontalPieces = horizontalCols * horizontalRows;
    
    // Calculate remaining width
    const remainingWidth = slabW - horizontalWidth;
    
    // Try to fit vertical pieces in remaining space
    let verticalPieces = 0;
    if (remainingWidth >= pieceW) {
      // Need at least pieceW width to fit a vertical piece
      const verticalCols = Math.floor((remainingWidth + kerf) / (pieceW + kerf));
      const verticalRows = Math.floor((slabH + kerf) / (pieceH + kerf));
      verticalPieces = verticalCols * verticalRows;
    }
    
    const totalPieces = horizontalPieces + verticalPieces;
    maxPieces = Math.max(maxPieces, totalPieces);
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
    console.log('No stone found for product:', {
      stone: product.stone,
      brand: product.brand,
      type: product.type,
      color: product.color
    });
    console.log('Available stones:', stoneOptions.map(s => ({
      Brand: s.Brand,
      Type: s.Type,
      Color: s.Color
    })));
    return { ...product, result: null };
  }

  console.log('Found stone:', stone);

  // Parse currency values by removing $ and commas
  const parseCurrency = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    // Remove $, commas, and any spaces
    const cleaned = value.toString().replace(/[$,\s]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const slabCost = parseCurrency(stone["Slab Cost"]);
  const fabCost = parseCurrency(stone["Fab Cost"]);
  const markup = parseFloat(stone["Mark Up"]) || 1;
  const w = parseFloat(product.width);
  const d = parseFloat(product.depth);
  const quantity = parseInt(product.quantity) || 1;

  console.log('Calculation values:', { 
    slabCost, 
    fabCost, 
    markup, 
    w, 
    d, 
    quantity,
    rawSlabCost: stone["Slab Cost"],
    rawFabCost: stone["Fab Cost"]
  });

  if (!w || !d || w <= 0 || d <= 0) {
    console.log('Invalid dimensions:', { w, d });
    return { ...product, result: null };
  }
  
  if (slabCost <= 0) {
    console.log('Invalid or missing slab cost for stone:', stone);
    return { 
      ...product, 
      result: {
        error: 'Missing slab cost in database',
        usableAreaSqft: (w * d * quantity) / 144,
        totalSlabsNeeded: 0,
        efficiency: 0,
        materialCost: 0,
        fabricationCost: 0,
        installationCost: 0,
        rawCost: 0,
        finalPrice: 0,
        topsPerSlab: 0
      }
    };
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
  const materialBufferValue = settings.materialBuffer !== undefined ? settings.materialBuffer : 10;
  const materialCost = (slabCost * totalSlabsNeeded) * (1 + materialBufferValue/100);
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
