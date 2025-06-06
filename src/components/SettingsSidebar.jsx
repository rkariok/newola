// Save this as: src/components/SettingsSidebar.jsx
import { Card } from './ui/Card';
import { Toggle } from './ui/Toggle';
import { CheckCircle } from './icons/Icons';

export const SettingsSidebar = ({ settings, onChange }) => {
  const updateSetting = (key, value) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <Card className="p-6 sticky top-24">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>
      
      <div className="space-y-6">
        <Toggle 
          label="Include Fabrication" 
          checked={settings.includeFabrication !== false} 
          onChange={() => updateSetting('includeFabrication', settings.includeFabrication === false ? true : false)} 
        />
        
        <Toggle 
          label="Include Installation" 
          checked={settings.includeInstallation || false} 
          onChange={() => updateSetting('includeInstallation', !settings.includeInstallation)} 
        />
        
        <Toggle 
          label="Visual Preview" 
          checked={settings.showVisualLayouts} 
          onChange={() => updateSetting('showVisualLayouts', !settings.showVisualLayouts)} 
        />
        
        <div className="border-t pt-6">
          <Toggle 
            label="Multi-Type Optimization" 
            checked={settings.multiProductOptimization} 
            onChange={() => updateSetting('multiProductOptimization', !settings.multiProductOptimization)} 
          />
          <p className="text-xs text-gray-500 mt-2">
            Combine multiple types with the same stone on single slabs to reduce waste
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kerf Width
          </label>
          <select
            value={settings.kerfWidth}
            onChange={(e) => updateSetting('kerfWidth', parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value={0}>No Kerf</option>
            <option value={0.125}>1/8" (0.125) - Standard</option>
            <option value={0.1875}>3/16" (0.1875) - Thick</option>
            <option value={0.25}>1/4" (0.25) - Heavy Duty</option>
            <option value={0.09375}>3/32" (0.094) - Thin</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Material Buffer
          </label>
          <select
            value={settings.materialBuffer !== undefined ? settings.materialBuffer : (settings.breakageBuffer || 10)}
            onChange={(e) => updateSetting('materialBuffer', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value={0}>No buffer</option>
            <option value={3}>3%</option>
            <option value={5}>5%</option>
            <option value={7}>7%</option>
            <option value={10}>10%</option>
          </select>
        </div>
      </div>

      {/* Trust Markers in Sidebar */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="space-y-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>AI-Powered Optimization</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Instant Accurate Quotes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>20+ Years Industry Experience</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
