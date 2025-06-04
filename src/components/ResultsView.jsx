// Save this as: components/ResultsView.jsx
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { 
  Sparkles, DollarSign, Package, TrendingUp, BarChart3, 
  Info, CheckCircle, FileText, Mail 
} from './icons/Icons';
import { SlabLayoutVisualization } from './SlabLayoutVisualization';
import { MultiProductSlabVisualization } from './MultiProductSlabVisualization';

export const ResultsView = ({ 
  allResults, 
  stoneOptions, 
  userInfo, 
  settings,
  optimizationData,
  onBack, 
  onGeneratePDF, 
  onSendEmail,
  sendingEmail,
  emailStatus 
}) => {
  // Calculate totals based on optimization mode (same logic as PDF)
  let totalPrice, totalSlabs, avgEfficiency;
  
  if (settings?.multiProductOptimization && optimizationData) {
    // For multi-product optimization, use the actual optimized values
    totalSlabs = Object.values(optimizationData).reduce((sum, result) => {
      return sum + (result.totalSlabs || 0);
    }, 0);
    
    // Calculate total price based on optimized slabs
    totalPrice = 0;
    Object.entries(optimizationData).forEach(([stoneType, result]) => {
      if (result.error || !result.totalSlabs) return;
      
      const stone = stoneOptions.find(s => {
        const stoneIdentifier = `${s.Brand} ${s.Type} - ${s.Color}`;
        return stoneIdentifier === stoneType;
      });
      if (!stone) return;
      
      const slabCost = parseFloat(stone["Slab Cost"]) || 0;
      const markup = parseFloat(stone["Mark Up"]) || 1;
      const breakageBuffer = settings.breakageBuffer || 10;
      
      // Material cost for optimized slabs
      const materialCost = slabCost * result.totalSlabs * (1 + breakageBuffer / 100) * markup;
      
      // Add fabrication costs from all products with markup
      const fabricationCost = allResults
        .filter(p => p.stone === stoneType && p.result)
        .reduce((sum, p) => sum + ((p.result.fabricationCost || 0) * markup), 0);
      
      totalPrice += materialCost + fabricationCost;
    });
    
    totalPrice = totalPrice.toFixed(2);
    
    // Calculate average efficiency from optimization
    const allEfficiencies = Object.values(optimizationData)
      .filter(r => r.averageEfficiency)
      .map(r => r.averageEfficiency);
    
    avgEfficiency = allEfficiencies.length > 0 
      ? (allEfficiencies.reduce((sum, e) => sum + e, 0) / allEfficiencies.length).toFixed(1)
      : '0';
  } else {
    // Standard calculation
    totalPrice = allResults.reduce((sum, p) => sum + (p.result?.finalPrice || 0), 0).toFixed(2);
    totalSlabs = allResults.reduce((sum, p) => sum + (p.result?.totalSlabsNeeded || 0), 0);
    avgEfficiency = allResults.length > 0 ? 
      (allResults.reduce((sum, p) => sum + (p.result?.efficiency || 0), 0) / allResults.length).toFixed(1) : '0';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/AIC.jpg" alt="AIC Logo" className="w-12 h-12 rounded-xl shadow-sm" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                  AIC Surfaces
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">Premium Stone Fabrication</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Results Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6"
        >
          ← Back to Types
        </Button>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-teal-600" />
          Optimized Results
        </h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center bg-gradient-to-br from-teal-50 to-white border-teal-200">
            <DollarSign className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-teal-700">${totalPrice}</div>
            <div className="text-sm text-teal-600 font-medium mt-1">Total Price</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-blue-700">{totalSlabs}</div>
            <div className="text-sm text-blue-600 font-medium mt-1">Total Slabs Needed</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
            <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-emerald-700">{avgEfficiency}%</div>
            <div className="text-sm text-emerald-600 font-medium mt-1">Average Efficiency</div>
          </Card>
        </div>

        {/* Multi-Type Optimization Alert */}
        {settings?.multiProductOptimization && optimizationData && (
          <Card className="p-4 mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-purple-900">Multi-Type Optimization Applied</h3>
                <p className="text-sm text-purple-700 mt-1">
                  Types with the same stone have been optimized together to minimize waste and reduce total slabs needed.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Slab Layout Visualization */}
        {settings.showVisualLayouts && (
          <div className="space-y-6 mb-8">
            {settings?.multiProductOptimization && optimizationData ? (
              // Show multi-product optimized layouts
              Object.entries(optimizationData).map(([stoneType, optimizationResult]) => {
                if (optimizationResult.error || !optimizationResult.slabs) return null;
                
                const stone = stoneOptions.find(s => {
                  const stoneIdentifier = `${s.Brand} ${s.Type} - ${s.Color}`;
                  return stoneIdentifier === stoneType;
                });
                const slabWidth = parseFloat(stone?.["Slab Width"]) || 126;
                const slabHeight = parseFloat(stone?.["Slab Height"]) || 63;
                
                return (
                  <Card key={stoneType} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      Multi-Type Optimization: {stoneType}
                    </h3>
                    
                    <div className="space-y-6">
                      {optimizationResult.slabs.map((slab, slabIndex) => (
                        <div key={slabIndex} className="bg-gray-50 rounded-xl p-8">
                          <h4 className="text-center text-sm font-medium text-gray-700 mb-4">
                            Slab {slabIndex + 1} of {optimizationResult.slabs.length}
                          </h4>
                          <MultiProductSlabVisualization 
                            slabData={slab}
                            slabWidth={slabWidth}
                            slabHeight={slabHeight}
                            allProducts={allResults}
                            settings={settings}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-purple-600">Total Slabs</p>
                          <p className="text-2xl font-bold text-purple-900">{optimizationResult.totalSlabs}</p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-600">Average Efficiency</p>
                          <p className="text-2xl font-bold text-purple-900">{optimizationResult.averageEfficiency?.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-600">Types Combined</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {allResults.filter(p => p.stone === stoneType).length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>