// Save this as: components/ProductCard.jsx
import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { X, Upload } from './icons/Icons';

export const ProductCard = ({ 
  product, 
  index, 
  stoneOptions, 
  onUpdate, 
  onRemove, 
  onUpload, 
  loadingAI,
  canRemove = true 
}) => {
  const [colorFilter, setColorFilter] = useState(product.color || '');
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  
  // Update colorFilter when product.color changes externally
  useEffect(() => {
    setColorFilter(product.color || '');
  }, [product.color]);
  
  // Get unique values based on current selections (smart filtering)
  const getFilteredOptions = () => {
    let filtered = [...stoneOptions];
    
    // Apply filters progressively - each filter only applies if the field has a value
    if (product.brand) {
      filtered = filtered.filter(s => s.Brand === product.brand);
    }
    
    if (product.type) {
      filtered = filtered.filter(s => s.Type === product.type);
    }
    
    if (product.color) {
      filtered = filtered.filter(s => s.Color === product.color);
    }
    
    if (product.finish) {
      filtered = filtered.filter(s => s.Finish === product.finish);
    }
    
    if (product.slabSize) {
      filtered = filtered.filter(s => {
        const size = `${s["Slab Width"]}" x ${s["Slab Height"]}"`;
        return size === product.slabSize;
      });
    }
    
    if (product.thickness) {
      filtered = filtered.filter(s => s.Thickness === product.thickness);
    }
    
    return filtered;
  };
  
  // Get available options for each field based on partial selections
  const getAvailableOptions = (field) => {
    let filtered = [...stoneOptions];
    
    // Apply all filters EXCEPT the field we're checking options for
    if (field !== 'brand' && product.brand) {
      filtered = filtered.filter(s => s.Brand === product.brand);
    }
    
    if (field !== 'type' && product.type) {
      filtered = filtered.filter(s => s.Type === product.type);
    }
    
    if (field !== 'color' && product.color) {
      filtered = filtered.filter(s => s.Color === product.color);
    }
    
    if (field !== 'finish' && product.finish) {
      filtered = filtered.filter(s => s.Finish === product.finish);
    }
    
    if (field !== 'slabSize' && product.slabSize) {
      filtered = filtered.filter(s => {
        const size = `${s["Slab Width"]}" x ${s["Slab Height"]}"`;
        return size === product.slabSize;
      });
    }
    
    if (field !== 'thickness' && product.thickness) {
      filtered = filtered.filter(s => s.Thickness === product.thickness);
    }
    
    return filtered;
  };
  
  const filteredStones = getFilteredOptions();
  
  // Extract unique values from available options for each field
  const brands = [...new Set(getAvailableOptions('brand').map(s => s.Brand))].filter(Boolean).sort();
  const types = [...new Set(getAvailableOptions('type').map(s => s.Type))].filter(Boolean).sort();
  const colors = [...new Set(getAvailableOptions('color').map(s => s.Color))].filter(Boolean).sort();
  const finishes = [...new Set(getAvailableOptions('finish').map(s => s.Finish))].filter(Boolean).sort();
  const slabSizes = [...new Set(getAvailableOptions('slabSize').map(s => `${s["Slab Width"]}" x ${s["Slab Height"]}"`))]
    .filter(Boolean).sort();
  const thicknesses = [...new Set(getAvailableOptions('thickness').map(s => s.Thickness))].filter(Boolean).sort();
  
  // Filter colors based on user input
  const filteredColors = colors.filter(color =>
    color.toLowerCase().startsWith(colorFilter.toLowerCase())
  );

  const updateField = (field, value) => {
    onUpdate(index, field, value);
    
    // Cascading reset logic - when a field changes, reset all fields after it
    if (field === 'brand') {
      // Reset all fields after brand
      onUpdate(index, 'type', '');
      onUpdate(index, 'color', '');
      onUpdate(index, 'finish', '');
      onUpdate(index, 'slabSize', '');
      onUpdate(index, 'thickness', '');
      onUpdate(index, 'stone', '');
      setColorFilter('');
    } else if (field === 'type') {
      // Reset all fields after type
      onUpdate(index, 'color', '');
      onUpdate(index, 'finish', '');
      onUpdate(index, 'slabSize', '');
      onUpdate(index, 'thickness', '');
      onUpdate(index, 'stone', '');
      setColorFilter('');
    } else if (field === 'color') {
      // Reset all fields after color
      onUpdate(index, 'finish', '');
      onUpdate(index, 'slabSize', '');
      onUpdate(index, 'thickness', '');
      onUpdate(index, 'stone', '');
    } else if (field === 'finish') {
      // Reset all fields after finish
      onUpdate(index, 'slabSize', '');
      onUpdate(index, 'thickness', '');
    } else if (field === 'slabSize') {
      // Reset thickness after slab size
      onUpdate(index, 'thickness', '');
    }
    
    // After updating, check if there's only one matching stone
    setTimeout(() => {
      // Get current selections
      const currentBrand = field === 'brand' ? value : product.brand;
      const currentType = field === 'type' ? value : (field === 'brand' ? '' : product.type);
      const currentColor = field === 'color' ? value : (['brand', 'type'].includes(field) ? '' : product.color);
      const currentFinish = field === 'finish' ? value : (['brand', 'type', 'color'].includes(field) ? '' : product.finish);
      const currentSlabSize = field === 'slabSize' ? value : (['brand', 'type', 'color', 'finish'].includes(field) ? '' : product.slabSize);
      const currentThickness = field === 'thickness' ? value : (['brand', 'type', 'color', 'finish', 'slabSize'].includes(field) ? '' : product.thickness);
      
      // Find all stones that match current selections
      let matchingStones = stoneOptions.filter(s => {
        const sizeMatch = !currentSlabSize || `${s["Slab Width"]}" x ${s["Slab Height"]}"` === currentSlabSize;
        
        return (!currentBrand || s.Brand === currentBrand) &&
               (!currentType || s.Type === currentType) &&
               (!currentColor || s.Color === currentColor) &&
               (!currentFinish || s.Finish === currentFinish) &&
               sizeMatch &&
               (!currentThickness || s.Thickness === currentThickness);
      });
      
      // If there's exactly one matching stone, auto-fill all remaining fields
      if (matchingStones.length === 1) {
        const stone = matchingStones[0];
        
        // Auto-fill empty fields
        if (!currentType && stone.Type) {
          onUpdate(index, 'type', stone.Type);
        }
        if (!currentColor && stone.Color) {
          onUpdate(index, 'color', stone.Color);
          setColorFilter(stone.Color);
        }
        if (!currentFinish && stone.Finish) {
          onUpdate(index, 'finish', stone.Finish);
        }
        if (!currentSlabSize) {
          const size = `${stone["Slab Width"]}" x ${stone["Slab Height"]}"`;
          onUpdate(index, 'slabSize', size);
        }
        if (!currentThickness && stone.Thickness) {
          onUpdate(index, 'thickness', stone.Thickness);
        }
        
        // Set stone identifier
        const stoneIdentifier = `${stone.Brand} ${stone.Type} - ${stone.Color}`;
        onUpdate(index, 'stone', stoneIdentifier);
      } else if (currentBrand && currentType && currentColor) {
        // Only create stone identifier if brand, type, and color are all selected
        const matchingStone = stoneOptions.find(s => 
          s.Brand === currentBrand && 
          s.Type === currentType && 
          s.Color === currentColor
        );
        
        if (matchingStone) {
          const stoneIdentifier = `${matchingStone.Brand} ${matchingStone.Type} - ${matchingStone.Color}`;
          onUpdate(index, 'stone', stoneIdentifier);
        }
      }
    }, 0);
  };

  // Clear invalid selections when options change
  useEffect(() => {
    // Check if current brand is still available
    if (product.brand && !brands.includes(product.brand)) {
      onUpdate(index, 'brand', '');
    }
    // Check if current type is still available
    if (product.type && !types.includes(product.type)) {
      onUpdate(index, 'type', '');
    }
    // Check if current color is still available
    if (product.color && !colors.includes(product.color)) {
      onUpdate(index, 'color', '');
      setColorFilter('');
    }
    // Check if current finish is still available
    if (product.finish && !finishes.includes(product.finish)) {
      onUpdate(index, 'finish', '');
    }
    // Check if current slab size is still available
    if (product.slabSize && !slabSizes.includes(product.slabSize)) {
      onUpdate(index, 'slabSize', '');
    }
    // Check if current thickness is still available
    if (product.thickness && !thicknesses.includes(product.thickness)) {
      onUpdate(index, 'thickness', '');
    }
  }, [brands, types, colors, finishes, slabSizes, thicknesses]);

  return (
    <Card className={`p-6 ${product.aiParsed ? 'ring-1 ring-purple-200 bg-purple-50/30' : ''}`}>
      {/* AI Parsed Indicator */}
      {product.aiParsed && (
        <div className="mb-3 px-3 py-2 bg-purple-100 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-700 font-medium flex items-center gap-1">
              🤖 AI Parsed Type
              {product.confidence && (
                <span className={`text-xs px-2 py-1 rounded ${
                  product.confidence === 'high' ? 'bg-green-100 text-green-700' :
                  product.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {product.confidence} confidence
                </span>
              )}
            </span>
            <button 
              onClick={() => updateField('aiParsed', false)}
              className="text-purple-500 hover:text-purple-700 text-xs"
            >
              dismiss
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {product.customName || `Type ${index + 1}`}
        </h3>
        {canRemove && (
          <Button
            onClick={() => onRemove(index)}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Stone Selection Section */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Stone Details {filteredStones.length > 0 && (
            <span className="text-xs font-normal text-gray-500 ml-2">
              ({filteredStones.length} matching options)
            </span>
          )}
        </h4>
        
        {/* First Row - Brand, Stone Type, Color */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand {brands.length === 0 && <span className="text-red-500">*</span>}
            </label>
            <select
              value={product.brand || ''}
              onChange={(e) => updateField('brand', e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                brands.length === 0 ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">All Brands</option>
              {brands.map((brand, i) => (
                <option key={i} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stone Type {types.length === 0 && <span className="text-red-500">*</span>}
            </label>
            <select
              value={product.type || ''}
              onChange={(e) => updateField('type', e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                types.length === 0 ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">All Types</option>
              {types.map((type, i) => (
                <option key={i} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color {colors.length === 0 && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={colorFilter}
              onChange={(e) => {
                setColorFilter(e.target.value);
                // Only update the product color if it's an exact match
                if (colors.includes(e.target.value)) {
                  updateField('color', e.target.value);
                } else if (e.target.value === '') {
                  // Clear the color field if input is empty
                  updateField('color', '');
                }
              }}
              onFocus={() => setShowColorDropdown(true)}
              onBlur={() => {
                setTimeout(() => {
                  setShowColorDropdown(false);
                  // If the current filter doesn't match any color, clear it
                  if (!colors.includes(colorFilter) && colorFilter !== '') {
                    setColorFilter(product.color || '');
                  }
                }, 200);
              }}
              placeholder="Type to filter colors..."
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                colors.length === 0 ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {showColorDropdown && colorFilter && filteredColors.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredColors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      updateField('color', color);
                      setColorFilter(color);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors"
                  >
                    {color}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Second Row - Finish, Slab Size, Thickness */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Finish {finishes.length === 0 && <span className="text-red-500">*</span>}
            </label>
            <select
              value={product.finish || ''}
              onChange={(e) => updateField('finish', e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                finishes.length === 0 ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">All Finishes</option>
              {finishes.map((finish, i) => (
                <option key={i} value={finish}>{finish}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slab Size {slabSizes.length === 0 && <span className="text-red-500">*</span>}
            </label>
            <select
              value={product.slabSize || ''}
              onChange={(e) => updateField('slabSize', e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                slabSizes.length === 0 ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">All Sizes</option>
              {slabSizes.map((size, i) => (
                <option key={i} value={size}>{size}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thickness {thicknesses.length === 0 && <span className="text-red-500">*</span>}
            </label>
            <select
              value={product.thickness || ''}
              onChange={(e) => updateField('thickness', e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                thicknesses.length === 0 ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">All Thicknesses</option>
              {thicknesses.map((thickness, i) => (
                <option key={i} value={thickness}>{thickness}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* No matches warning */}
        {filteredStones.length === 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              No stones match your current selection. Please adjust your filters.
            </p>
          </div>
        )}
      </div>
      
      {/* Piece Details Section */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          Piece Details
        </h4>
        
        {/* Third Row - Piece D, Piece L, Quantity, Edge Detail */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Piece D (inches)
            </label>
            <input
              type="number"
              value={product.depth}
              onChange={(e) => updateField('depth', e.target.value)}
              placeholder="24"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Piece L (inches)
            </label>
            <input
              type="number"
              value={product.width}
              onChange={(e) => updateField('width', e.target.value)}
              placeholder="36"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={product.quantity}
              onChange={(e) => updateField('quantity', e.target.value)}
              min="1"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edge Detail
            </label>
            <select
              value={product.edgeDetail}
              onChange={(e) => updateField('edgeDetail', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="Eased">Eased</option>
              <option value="1.5 mitered">1.5" Mitered</option>
              <option value="Bullnose">Bullnose</option>
              <option value="Ogee">Ogee</option>
              <option value="Beveled">Beveled</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Additional Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Name
          </label>
          <input
            type="text"
            value={product.customName}
            onChange={(e) => updateField('customName', e.target.value)}
            placeholder="Kitchen Island"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <input
            type="text"
            value={product.note}
            onChange={(e) => updateField('note', e.target.value)}
            placeholder="Special instructions..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Drawing
          </label>
          <label className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            {loadingAI ? 'Analyzing...' : 'Choose File'}
            <input
              type="file"
              accept="image/*,.pdf,.dwg,.dxf"
              onChange={(e) => onUpload(e, index)}
              disabled={loadingAI}
              className="hidden"
            />
          </label>
        </div>
      </div>
      
      {loadingAI && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <div className="text-blue-800 font-medium">🤖 Claude AI is analyzing your drawing...</div>
              <div className="text-blue-600 text-sm">Extracting dimensions and identifying all pieces</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
