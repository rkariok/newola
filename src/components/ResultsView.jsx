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
        if (stoneIdentifier === stoneType) {
          return true;
        }
        // Check first product in results
        const firstProduct = allResults.find(p => p.stone === stoneType);
        if (firstProduct) {
          return s.Brand === firstProduct.brand && 
                 s.Type === firstProduct.type && 
                 s.Color === firstProduct.color;
        }
        return false;
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
                  // Match by composite identifier
                  const stoneIdentifier = `${s.Brand} ${s.Type} - ${s.Color}`;
                  if (stoneIdentifier === stoneType) {
                    return true;
                  }
                  // Check first product in results  
                  const firstProduct = allResults.find(p => p.stone === stoneType);
                  if (firstProduct) {
                    return s.Brand === firstProduct.brand && 
                           s.Type === firstProduct.type && 
                           s.Color === firstProduct.color;
                  }
                  return false;
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
                );
              })
            ) : (
              // Show individual product layouts (standard mode)
              allResults.map((product, productIndex) => {
                if (!product.result) return null;
                
                const stone = stoneOptions.find(s => {
                  // Match by composite identifier
                  const stoneIdentifier = `${s.Brand} ${s.Type} - ${s.Color}`;
                  if (stoneIdentifier === product.stone) {
                    return true;
                  }
                  // Match by individual fields
                  return s.Brand === product.brand && 
                         s.Type === product.type && 
                         s.Color === product.color;
                });
                const slabWidth = parseFloat(stone?.["Slab Width"]) || 126;
                const slabHeight = parseFloat(stone?.["Slab Height"]) || 63;
                
                const pieces = Array(parseInt(product.quantity) || 1).fill().map((_, i) => ({
                  id: i + 1,
                  width: parseFloat(product.width) || 0,
                  depth: parseFloat(product.depth) || 0,
                  name: `${product.stone} #${i + 1}`
                }));
                
                return (
                  <Card key={productIndex} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-teal-600" />
                      Layout Visualization: {product.customName || `Type ${productIndex + 1}`}
                    </h3>
                    
                    <div className="bg-gray-50 rounded-xl p-8">
                      <SlabLayoutVisualization 
                        pieces={pieces}
                        slabWidth={slabWidth}
                        slabHeight={slabHeight}
                        maxPiecesPerSlab={product.result.topsPerSlab}
                        includeKerf={settings.kerfWidth > 0}
                        kerfWidth={settings.kerfWidth}
                        showMaxLayout={false}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Layout Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Piece Size:</span>
                            <span className="font-medium">{product.width}" × {product.depth}"</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Slab Size:</span>
                            <span className="font-medium">{slabWidth}" × {slabHeight}"</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Kerf Width:</span>
                            <span className="font-medium">{settings.kerfWidth > 0 ? `${settings.kerfWidth}"` : 'No Kerf'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-teal-50 to-white rounded-lg p-4 border border-teal-200">
                        <h4 className="text-sm font-semibold text-teal-700 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Optimization Results
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-teal-600">Max Pieces/Slab:</span>
                            <span className="font-bold text-teal-700">{product.result.topsPerSlab}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-teal-600">Total Quantity:</span>
                            <span className="font-bold text-teal-700">{product.quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-teal-600">Efficiency:</span>
                            <span className={`font-bold ${
                              product.result.efficiency > 80 ? 'text-green-600' : 
                              product.result.efficiency > 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>{product.result.efficiency?.toFixed(1) || '0'}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-teal-600">Slabs Needed:</span>
                            <span className="font-bold text-teal-700">{product.result.totalSlabsNeeded}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Results Cards - WITH IMPROVED SPACING */}
        <div className="space-y-4 mb-8">
          {allResults.map((p, i) => {
            const stone = stoneOptions.find(s => {
              // Match by composite identifier
              const stoneIdentifier = `${s.Brand} ${s.Type} - ${s.Color}`;
              if (stoneIdentifier === p.stone) {
                return true;
              }
              // Match by individual fields
              return s.Brand === p.brand && 
                     s.Type === p.type && 
                     s.Color === p.color;
            });
            const markup = parseFloat(stone?.["Mark Up"]) || 1;
            
            return (
              <Card key={i} className="p-8 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-6">
                  {/* Type Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {p.customName || `Type ${i + 1}`}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {p.brand} {p.type} - {p.color}
                        {p.finish && ` (${p.finish})`}
                        {p.thickness && ` - ${p.thickness}`}
                      </p>
                    </div>
                    {p.result?.multiProductOptimized && (
                      <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        ✨ Multi-Optimized
                      </div>
                    )}
                  </div>
                  
                  {/* Type Details Grid - Better spacing */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Size</p>
                      <p className="font-semibold text-gray-900">{p.width}×{p.depth}"</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Qty</p>
                      <p className="font-semibold text-gray-900">{p.quantity}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Edge</p>
                      <p className="font-semibold text-gray-900">{p.edgeDetail}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Area</p>
                      <p className="font-semibold text-gray-900">{p.result?.usableAreaSqft?.toFixed(1)} ft²</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Per Slab</p>
                      <p className="font-semibold text-purple-600">{p.result?.topsPerSlab || '-'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Slabs</p>
                      <p className="font-semibold text-blue-600">{p.result?.totalSlabsNeeded?.toFixed(1) || '-'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Efficiency</p>
                      <p className={`font-bold ${
                        (p.result?.efficiency || 0) > 80 ? 'text-green-600' : 
                        (p.result?.efficiency || 0) > 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {p.result?.efficiency?.toFixed(0) || '0'}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                      <p className="font-bold text-green-600 text-xl">${p.result?.finalPrice?.toFixed(0) || '0'}</p>
                    </div>
                  </div>
                  
                  {/* Cost Breakdown - New addition */}
                  <div className="flex justify-end gap-6 text-sm text-gray-600 pt-2 border-t border-gray-100">
                    <span>Material: <span className="font-semibold text-blue-600">${((p.result?.materialCost || 0) * markup)?.toFixed(0)}</span></span>
                    <span>Fabrication: <span className="font-semibold text-orange-600">${((p.result?.fabricationCost || 0) * markup)?.toFixed(0)}</span></span>
                    {p.result?.installationCost > 0 && (
                      <span>Installation: <span className="font-semibold text-green-600">${((p.result?.installationCost || 0) * markup)?.toFixed(0)}</span></span>
                    )}
                  </div>
                </div>
                
                {p.note && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">Note:</span> {p.note}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Total Summary */}
        <Card className="p-6 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-teal-100 text-sm uppercase tracking-wider">Grand Total</p>
              <p className="text-4xl font-bold">${totalPrice}</p>
            </div>
            <div className="text-right">
              <p className="text-teal-100 text-sm">
                Material: ${allResults.reduce((sum, p) => {
                  const stone = stoneOptions.find(s => {
                    const stoneIdentifier = `${s.Brand} ${s.Type} - ${s.Color}`;
                    return stoneIdentifier === p.stone || 
                           (s.Brand === p.brand && s.Type === p.type && s.Color === p.color);
                  });
                  const markup = parseFloat(stone?.["Mark Up"]) || 1;
                  return sum + ((p.result?.materialCost || 0) * markup);
                }, 0).toFixed(0)} • 
                Fabrication: ${allResults.reduce((sum, p) => {
                  const stone = stoneOptions.find(s => {
                    const stoneIdentifier = `${s.Brand} ${s.Type} - ${s.Color}`;
                    return stoneIdentifier === p.stone || 
                           (s.Brand === p.brand && s.Type === p.type && s.Color === p.color);
                  });
                  const markup = parseFloat(stone?.["Mark Up"]) || 1;
                  return sum + ((p.result?.fabricationCost || 0) * markup);
                }, 0).toFixed(0)}
                {settings.includeInstallation && (
                  <> • Installation: ${allResults.reduce((sum, p) => {
                    const stone = stoneOptions.find(s => {
                      const stoneIdentifier = `${s.Brand} ${s.Type} - ${s.Color}`;
                      return stoneIdentifier === p.stone || 
                             (s.Brand === p.brand && s.Type === p.type && s.Color === p.color);
                    });
                    const markup = parseFloat(stone?.["Mark Up"]) || 1;
                    return sum + ((p.result?.installationCost || 0) * markup);
                  }, 0).toFixed(0)}</>
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button
            onClick={onGeneratePDF}
            size="lg"
            variant="outline"
          >
            <FileText className="w-5 h-5" />
            Generate PDF
          </Button>
          <Button
            onClick={onSendEmail}
            disabled={sendingEmail || !userInfo.email}
            size="lg"
            variant="outline"
          >
            <Mail className="w-5 h-5" />
            {sendingEmail ? 'Sending...' : 'Email Quote'}
          </Button>
          <Button
            onClick={onBack}
            size="lg"
          >
            Back to Edit
          </Button>
        </div>

        {/* Email status message */}
        {emailStatus && (
          <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg text-center font-medium shadow-lg animate-pulse ${
            emailStatus.includes('✅') ? 'bg-green-100 text-green-800 border border-green-300' : 
            emailStatus.includes('❌') ? 'bg-red-100 text-red-800 border border-red-300' : 
            'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
            {emailStatus}
          </div>
        )}

        {/* Trust Markers */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Licensed & Insured
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              20+ Years Experience
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              AI-Optimized Layouts
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Accurate as of {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
