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
  const [colorFilter, setColorFilter] = useState('');
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  
  // Extract unique values for dropdowns
  const brands = [...new Set(stoneOptions.map(s => s.Brand))].filter(Boolean);
  const types = [...new Set(stoneOptions.map(s => s.Type))].filter(Boolean);
  const finishes = [...new Set(stoneOptions.map(s => s.Finish))].filter(Boolean);
  
  // Get colors based on selected brand and type
  const getAvailableColors = () => {
    return [...new Set(stoneOptions
      .filter(s => 
        (!product.brand || s.Brand === product.brand) &&
        (!product.type || s.Type === product.type)
      )
      .map(s => s.Color)
    )].filter(Boolean);
  };
  
  const availableColors = getAvailableColors();
  
  // Filter colors based on user input
  const filteredColors = availableColors.filter(color =>
    color.toLowerCase().startsWith(colorFilter.toLowerCase())
  );

  const updateField = (field, value) => {
    onUpdate(index, field, value);
    
    // Update the stone identifier when brand, type, or color changes
    if (field === 'brand' || field === 'type' || field === 'color') {
      const newBrand = field === 'brand' ? value : (product.brand || '');
      const newType = field === 'type' ? value : (product.type || '');
      const newColor = field === 'color' ? value : (product.color || '');
      
      // Find matching stone
      const matchingStone = stoneOptions.find(s => 
        s.Brand === newBrand && 
        s.Type === newType && 
        s.Color === newColor
      );
      
      if (matchingStone) {
        const stoneIdentifier = `${matchingStone.Brand} ${matchingStone.Type} - ${matchingStone.Color}`;
        onUpdate(index, 'stone', stoneIdentifier);
        onUpdate(index, 'finish', matchingStone.Finish); // Auto-set finish
      }
    }
  };

  // Initialize brand, type, color from stone identifier if it exists
  useEffect(() => {
    if (product.stone && !product.brand) {
      const matchingStone = stoneOptions.find(s => {
        const identifier = `${s.Brand} ${s.Type} - ${s.Color}`;
        return identifier === product.stone;
      });
      
      if (matchingStone) {
        onUpdate(index, 'brand', matchingStone.Brand);
        onUpdate(index, 'type', matchingStone.Type);
        onUpdate(index, 'color', matchingStone.Color);
        onUpdate(index, 'finish', matchingStone.Finish);
      }
    }
  }, [product.stone, stoneOptions]);

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
      
      {/* First Row - Brand, Stone Type, Color, Finish */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand
          </label>
          <select
            value={product.brand || ''}
            onChange={(e) => updateField('brand', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select Brand...</option>
            {brands.map((brand, i) => (
              <option key={i} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stone Type
          </label>
          <select
            value={product.type || ''}
            onChange={(e) => updateField('type', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select Type...</option>
            {types.map((type, i) => (
              <option key={i} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <input
            type="text"
            value={product.color || colorFilter}
            onChange={(e) => {
              setColorFilter(e.target.value);
              updateField('color', e.target.value);
            }}
            onFocus={() => setShowColorDropdown(true)}
            onBlur={() => setTimeout(() => setShowColorDropdown(false), 200)}
            placeholder="Type to filter colors..."
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          {showColorDropdown && filteredColors.length > 0 && (
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Finish
          </label>
          <select
            value={product.finish || ''}
            onChange={(e) => updateField('finish', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select Finish...</option>
            {finishes.map((finish, i) => (
              <option key={i} value={finish}>{finish}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Second Row - Piece D, Piece L, Quantity, Edge Detail */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Piece D (inches)
          </label>
          <input
            type="number"
            value={product.depth}
            onChange={(e) => updateField('depth', e.target.value)}
            placeholder="24"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Edge Detail
          </label>
          <select
            value={product.edgeDetail}
            onChange={(e) => updateField('edgeDetail', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="Eased">Eased</option>
            <option value="1.5 mitered">1.5" Mitered</option>
            <option value="Bullnose">Bullnose</option>
            <option value="Ogee">Ogee</option>
            <option value="Beveled">Beveled</option>
          </select>
        </div>
      </div>
      
      {/* Third Row - Custom Name, Notes, Upload Drawing */}
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
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Drawing
          </label>
          <label className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
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
