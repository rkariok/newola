// Save this as: components/ContactForm.jsx
import { useState } from 'react';
import { Card } from './ui/Card';
import { AlertCircle, Sparkles } from './icons/Icons';
import { parseProductText } from '../utils/aiDrawingAnalysis';

export const ContactForm = ({ userInfo, onChange }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-teal-600" />
        Contact Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={userInfo.name}
            onChange={(e) => onChange({ ...userInfo, name: e.target.value })}
            placeholder="John Smith"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={userInfo.email}
            onChange={(e) => onChange({ ...userInfo, email: e.target.value })}
            placeholder="email@example.com"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={userInfo.phone}
            onChange={(e) => onChange({ ...userInfo, phone: e.target.value })}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>
    </Card>
  );
};

// NEW: Separate component for bulk import with updated icon
export const BulkProductImport = ({ stoneOptions, onProductsParsed }) => {
  const [bulkInput, setBulkInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState('');

  const handleQuickParse = async () => {
    if (!bulkInput.trim() || parsing) return;
    
    setParsing(true);
    setParseMessage('');
    
    try {
      // Call Claude API for text parsing
      const stoneNames = stoneOptions.map(s => `${s.Brand} ${s.Type} - ${s.Color}`);
      const result = await parseProductText(bulkInput, stoneNames);
      
      if (result.products && result.products.length > 0) {
        // Convert to your product format
        const newProducts = result.products.map((p, index) => {
          // Try to find matching stone or use first one
          let selectedStone = stoneOptions[0] ? 
            `${stoneOptions[0].Brand} ${stoneOptions[0].Type} - ${stoneOptions[0].Color}` : '';
          
          // If AI found a stone type, try to match it
          if (p.stoneType && stoneOptions.length > 0) {
            const match = stoneOptions.find(stone => {
              const stoneIdentifier = `${stone.Brand} ${stone.Type} - ${stone.Color}`;
              return stoneIdentifier.toLowerCase().includes(p.stoneType.toLowerCase()) ||
                     stone.Type.toLowerCase().includes(p.stoneType.toLowerCase()) ||
                     stone.Color.toLowerCase().includes(p.stoneType.toLowerCase());
            });
            if (match) {
              selectedStone = `${match.Brand} ${match.Type} - ${match.Color}`;
            }
          }
          
          return {
            stone: selectedStone,
            width: p.width.toString(),
            depth: p.depth.toString(),
            quantity: p.quantity,
            edgeDetail: 'Eased',
            result: null,
            id: Date.now() + index,
            customName: p.name,
            priority: 'normal',
            note: p.features || '',
            aiParsed: true,
            confidence: p.confidence
          };
        });
        
        // Send to parent component
        onProductsParsed(newProducts);
        
        // Clear input and show success
        setBulkInput('');
        setParseMessage(`✅ Added ${newProducts.length} type${newProducts.length !== 1 ? 's' : ''}`);
        
        // Clear message after 4 seconds
        setTimeout(() => setParseMessage(''), 4000);
      } else {
        setParseMessage('❌ No types found in the text');
        setTimeout(() => setParseMessage(''), 5000);
      }
    } catch (error) {
      console.error('Parse error:', error);
      setParseMessage(`❌ ${error.message}`);
      setTimeout(() => setParseMessage(''), 5000);
    } finally {
      setParsing(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-teal-600" />
        Quick Type Import (Optional)
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste product list for AI parsing
          <span className="text-xs text-gray-500 ml-2">
            - Automatically extracts dimensions, quantities, and stone types
          </span>
        </label>
        <textarea
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          onBlur={handleQuickParse}
          disabled={parsing}
          placeholder="QTY: 26) 2 Bay Suite Large Vanity Countertops (2'D x 6'W with 2&quot; backsplash)
·  (QTY: 26) Small Vanity Countertops (2'D x 4'-1&quot;W)
One (1) Calacatta Laza Oro Kitchen Island (3'D x 8'W)
FOSSIL GRAY – 2CM Quartz Polished (30x72)"
          rows={2}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
        />
        
        {/* Status messages */}
        {parsing && (
          <p className="text-sm text-teal-600 mt-2 flex items-center gap-2">
            <div className="animate-spin w-3 h-3 border border-teal-600 border-t-transparent rounded-full"></div>
            <Sparkles className="w-4 h-4 animate-pulse" />
            Claude AI is parsing your list...
          </p>
        )}
        
        {parseMessage && (
          <p className={`text-sm mt-2 ${
            parseMessage.includes('✅') ? 'text-green-600' : 'text-red-600'
          }`}>
            {parseMessage}
          </p>
        )}
        
        {bulkInput.trim() && !parsing && !parseMessage && (
          <button
            onClick={handleQuickParse}
            className="mt-2 px-3 py-1 text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4" />
            Parse with AI
          </button>
        )}
      </div>
    </Card>
  );
};