// Save this as: src/components/SlabLayoutVisualization.jsx
import { useState, useEffect } from 'react';
import { Package } from './icons/Icons';

export const SlabLayoutVisualization = ({ pieces, slabWidth, slabHeight, maxPiecesPerSlab, includeKerf, kerfWidth, showMaxLayout = false }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1500);
    return () => clearTimeout(timer);
  }, [pieces]);
  
  if (!pieces || pieces.length === 0) return null;

  const pieceWidth = pieces[0]?.width || 0;
  const pieceHeight = pieces[0]?.depth || 0;
  const kerf = includeKerf ? kerfWidth : 0;

  const generateOptimalLayout = () => {
    const targetPieces = showMaxLayout ? maxPiecesPerSlab : Math.min(pieces.length, maxPiecesPerSlab);
    
    // Function to calculate pieces for a specific orientation
    const calculateLayoutForOrientation = (slabW, slabH, isSlabRotated = false) => {
      const layouts = [];
      
      // Option 1: All pieces vertical
      const verticalCols = Math.floor((slabW + kerf) / (pieceWidth + kerf));
      const verticalRows = Math.floor((slabH + kerf) / (pieceHeight + kerf));
      const verticalTotal = verticalCols * verticalRows;
      
      if (verticalTotal > 0) {
        const layout = [];
        for (let row = 0; row < verticalRows && layout.length < targetPieces; row++) {
          for (let col = 0; col < verticalCols && layout.length < targetPieces; col++) {
            layout.push({
              x: col * (pieceWidth + kerf),
              y: row * (pieceHeight + kerf),
              width: pieceWidth,
              height: pieceHeight,
              rotated: false,
              id: layout.length + 1
            });
          }
        }
        layouts.push({ 
          layout, 
          count: layout.length,
          slabWidth: slabW,
          slabHeight: slabH,
          isSlabRotated 
        });
      }
      
      // Option 2: All pieces horizontal
      const horizontalCols = Math.floor((slabW + kerf) / (pieceHeight + kerf));
      const horizontalRows = Math.floor((slabH + kerf) / (pieceWidth + kerf));
      const horizontalTotal = horizontalCols * horizontalRows;
      
      if (horizontalTotal > 0) {
        const layout = [];
        for (let row = 0; row < horizontalRows && layout.length < targetPieces; row++) {
          for (let col = 0; col < horizontalCols && layout.length < targetPieces; col++) {
            layout.push({
              x: col * (pieceHeight + kerf),
              y: row * (pieceWidth + kerf),
              width: pieceHeight,
              height: pieceWidth,
              rotated: true,
              id: layout.length + 1
            });
          }
        }
        layouts.push({ 
          layout, 
          count: layout.length,
          slabWidth: slabW,
          slabHeight: slabH,
          isSlabRotated 
        });
      }
      
      // Option 3: Mixed - try all possible vertical rows
      const maxVerticalRows = Math.floor((slabH + kerf) / (pieceHeight + kerf));
      
      for (let vRows = 0; vRows <= maxVerticalRows; vRows++) {
        const layout = [];
        
        // Add vertical pieces
        const vCols = Math.floor((slabW + kerf) / (pieceWidth + kerf));
        for (let row = 0; row < vRows && layout.length < targetPieces; row++) {
          for (let col = 0; col < vCols && layout.length < targetPieces; col++) {
            layout.push({
              x: col * (pieceWidth + kerf),
              y: row * (pieceHeight + kerf),
              width: pieceWidth,
              height: pieceHeight,
              rotated: false,
              id: layout.length + 1
            });
          }
        }
        
        // Calculate remaining space and add horizontal pieces
        const usedHeight = vRows > 0 ? vRows * pieceHeight + (vRows - 1) * kerf : 0;
        const remainingHeight = slabH - usedHeight;
        
        if (remainingHeight >= pieceWidth) {
          const hRows = Math.floor((remainingHeight + kerf) / (pieceWidth + kerf));
          const hCols = Math.floor((slabW + kerf) / (pieceHeight + kerf));
          
          for (let row = 0; row < hRows && layout.length < targetPieces; row++) {
            for (let col = 0; col < hCols && layout.length < targetPieces; col++) {
              layout.push({
                x: col * (pieceHeight + kerf),
                y: usedHeight + (usedHeight > 0 ? kerf : 0) + row * (pieceWidth + kerf),
                width: pieceHeight,
                height: pieceWidth,
                rotated: true,
                id: layout.length + 1
              });
            }
          }
        }
        
        if (layout.length > 0) {
          layouts.push({ 
            layout, 
            count: layout.length,
            slabWidth: slabW,
            slabHeight: slabH,
            isSlabRotated 
          });
        }
      }
      
      // Option 4: Mixed - try all possible horizontal rows
      const maxHorizontalRows = Math.floor((slabH + kerf) / (pieceWidth + kerf));
      
      for (let hRows = 0; hRows <= maxHorizontalRows; hRows++) {
        const layout = [];
        
        // Add horizontal pieces
        const hCols = Math.floor((slabW + kerf) / (pieceHeight + kerf));
        for (let row = 0; row < hRows && layout.length < targetPieces; row++) {
          for (let col = 0; col < hCols && layout.length < targetPieces; col++) {
            layout.push({
              x: col * (pieceHeight + kerf),
              y: row * (pieceWidth + kerf),
              width: pieceHeight,
              height: pieceWidth,
              rotated: true,
              id: layout.length + 1
            });
          }
        }
        
        // Calculate remaining space and add vertical pieces
        const usedHeight = hRows > 0 ? hRows * pieceWidth + (hRows - 1) * kerf : 0;
        const remainingHeight = slabH - usedHeight;
        
        if (remainingHeight >= pieceHeight) {
          const vRows = Math.floor((remainingHeight + kerf) / (pieceHeight + kerf));
          const vCols = Math.floor((slabW + kerf) / (pieceWidth + kerf));
          
          for (let row = 0; row < vRows && layout.length < targetPieces; row++) {
            for (let col = 0; col < vCols && layout.length < targetPieces; col++) {
              layout.push({
                x: col * (pieceWidth + kerf),
                y: usedHeight + (usedHeight > 0 ? kerf : 0) + row * (pieceHeight + kerf),
                width: pieceWidth,
                height: pieceHeight,
                rotated: false,
                id: layout.length + 1
              });
            }
          }
        }
        
        if (layout.length > 0) {
          layouts.push({ 
            layout, 
            count: layout.length,
            slabWidth: slabW,
            slabHeight: slabH,
            isSlabRotated 
          });
        }
      }
      
      // Option 5: Column-based mixed arrangements (vertical columns first)
      const maxVerticalCols = Math.floor((slabW + kerf) / (pieceWidth + kerf));
      
      for (let vCols = 0; vCols <= maxVerticalCols; vCols++) {
        const layout = [];
        
        // Add vertical pieces
        const vRows = Math.floor((slabH + kerf) / (pieceHeight + kerf));
        for (let col = 0; col < vCols && layout.length < targetPieces; col++) {
          for (let row = 0; row < vRows && layout.length < targetPieces; row++) {
            layout.push({
              x: col * (pieceWidth + kerf),
              y: row * (pieceHeight + kerf),
              width: pieceWidth,
              height: pieceHeight,
              rotated: false,
              id: layout.length + 1
            });
          }
        }
        
        // Calculate remaining space and add horizontal pieces
        const usedWidth = vCols > 0 ? vCols * pieceWidth + (vCols - 1) * kerf : 0;
        const remainingWidth = slabW - usedWidth;
        
        if (remainingWidth >= pieceHeight) {
          const hCols = Math.floor((remainingWidth + kerf) / (pieceHeight + kerf));
          const hRows = Math.floor((slabH + kerf) / (pieceWidth + kerf));
          
          for (let col = 0; col < hCols && layout.length < targetPieces; col++) {
            for (let row = 0; row < hRows && layout.length < targetPieces; row++) {
              layout.push({
                x: usedWidth + (usedWidth > 0 ? kerf : 0) + col * (pieceHeight + kerf),
                y: row * (pieceWidth + kerf),
                width: pieceHeight,
                height: pieceWidth,
                rotated: true,
                id: layout.length + 1
              });
            }
          }
        }
        
        if (layout.length > 0) {
          layouts.push({ 
            layout, 
            count: layout.length,
            slabWidth: slabW,
            slabHeight: slabH,
            isSlabRotated 
          });
        }
      }
      
      return layouts;
    };
    
    // Try both slab orientations
    const layouts1 = calculateLayoutForOrientation(slabWidth, slabHeight, false);
    const layouts2 = calculateLayoutForOrientation(slabHeight, slabWidth, true);
    const allLayouts = [...layouts1, ...layouts2];
    
    // Find the best layout
    let bestLayout = allLayouts[0] || { layout: [], count: 0, slabWidth, slabHeight, isSlabRotated: false };
    
    // First, try to find a layout that exactly matches maxPiecesPerSlab
    for (const layoutOption of allLayouts) {
      if (layoutOption.count === maxPiecesPerSlab) {
        bestLayout = layoutOption;
        break;
      }
    }
    
    // If no exact match, use the layout with the most pieces (up to targetPieces)
    if (bestLayout.count !== maxPiecesPerSlab) {
      for (const layoutOption of allLayouts) {
        if (layoutOption.count > bestLayout.count && layoutOption.count <= targetPieces) {
          bestLayout = layoutOption;
        }
      }
    }
    
    return bestLayout;
  };

  const bestLayout = generateOptimalLayout();
  const layoutPieces = bestLayout.layout;
  const displaySlabWidth = bestLayout.slabWidth;
  const displaySlabHeight = bestLayout.slabHeight;
  
  const containerWidth = 500;
  const containerHeight = 300;
  const scaleX = containerWidth / displaySlabWidth;
  const scaleY = containerHeight / displaySlabHeight;
  const scale = Math.min(scaleX, scaleY) * 0.85;

  const scaledSlabWidth = displaySlabWidth * scale;
  const scaledSlabHeight = displaySlabHeight * scale;

  // Generate grid lines
  const gridLines = [];
  const gridSpacing = 12; // inches
  for (let x = gridSpacing; x < displaySlabWidth; x += gridSpacing) {
    gridLines.push({ x1: x * scale, y1: 0, x2: x * scale, y2: scaledSlabHeight });
  }
  for (let y = gridSpacing; y < displaySlabHeight; y += gridSpacing) {
    gridLines.push({ x1: 0, y1: y * scale, x2: scaledSlabWidth, y2: y * scale });
  }

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-center gap-2 text-sm text-gray-600">
        <Package className="w-4 h-4" />
        <span>Slab Dimensions: {displaySlabWidth}" × {displaySlabHeight}"</span>
        {bestLayout.isSlabRotated && (
          <span className="text-xs text-purple-600 font-medium">(Rotated for optimal fit)</span>
        )}
      </div>
      
      <div 
        className="relative mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-inner overflow-hidden"
        style={{ 
          width: `${scaledSlabWidth}px`, 
          height: `${scaledSlabHeight}px`
        }}
      >
        {/* Grid Background */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
          {gridLines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="2,4"
            />
          ))}
        </svg>
        
        {/* Slab Border */}
        <div className="absolute inset-0 border-2 border-slate-400 rounded-lg pointer-events-none" />
        
        {/* Pieces */}
        {layoutPieces.map((piece, index) => (
          <div
            key={piece.id}
            className={`absolute flex flex-col items-center justify-center text-xs font-medium rounded transition-all duration-300 ${
              isAnimating ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
            }`}
            style={{
              left: `${piece.x * scale}px`,
              top: `${piece.y * scale}px`,
              width: `${piece.width * scale - 2}px`,
              height: `${piece.height * scale - 2}px`,
              transitionDelay: `${index * 50}ms`,
              background: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)',
              border: '2px solid #059669',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div className="text-white font-bold text-sm">{piece.id}</div>
            <div className="text-emerald-100 text-[10px]">{piece.width}×{piece.height}"</div>
            {piece.rotated && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                R
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-br from-emerald-300 to-emerald-500 rounded border border-emerald-600"></div>
          <span>Standard Orientation</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gradient-to-br from-emerald-300 to-emerald-500 rounded border border-emerald-600 relative">
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <span>Rotated 90°</span>
        </div>
      </div>
      
      <div className="mt-2 text-center text-sm text-gray-600">
        {layoutPieces.length === maxPiecesPerSlab ? 
          `Showing optimal layout: ${layoutPieces.length} pieces` :
          pieces.length < maxPiecesPerSlab ? 
            `Showing ${layoutPieces.length} of ${pieces.length} pieces (max ${maxPiecesPerSlab} per slab)` :
            `Showing ${layoutPieces.length} pieces (expected ${maxPiecesPerSlab} per slab)`
        }
      </div>
    </div>
  );
};
