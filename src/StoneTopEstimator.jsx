// Save this as: src/StoneTopEstimator.jsx
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProgressSteps } from './components/ProgressSteps';
import { ContactForm, BulkProductImport } from './components/ContactForm';
import { ProductCard } from './components/ProductCard';
import { ResultsView } from './components/ResultsView';
import { SavedQuotesView } from './components/SavedQuotesView';
import { SettingsSidebar } from './components/SettingsSidebar';
import { Button } from './components/ui/Button';
import { Plus, Calculator } from './components/icons/Icons';
import { calculateProductResults } from './utils/calculations';
import { generateQuotePDF } from './utils/pdfGenerator';
import { sendQuoteEmail } from './utils/emailService';
import { analyzeDrawingWithAI, handleClaudeMultiplePiecesExtraction } from './utils/aiDrawingAnalysis';
import { optimizeMultiTypeLayout, applyMultiTypeOptimization } from './utils/multiTypeOptimization';

export default function StoneTopEstimator() {
  // State management
  const [stoneOptions, setStoneOptions] = useState([]);
  const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" });
  const [products, setProducts] = useState([
    { 
      stone: '', 
      brand: '',
      type: '',
      color: '',
      finish: '',
      width: '', 
      depth: '', 
      quantity: 1, 
      edgeDetail: 'Eased', 
      result: null, 
      id: Date.now(),
      customName: '',
      priority: 'normal',
      note: ''
    }
  ]);
  const [allResults, setAllResults] = useState([]);
  const [optimizationData, setOptimizationData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showSavedQuotes, setShowSavedQuotes] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [savedQuotes, setSavedQuotes] = useState([]);
  
  // Settings - Updated to remove includeKerf and add includeInstallation
  const [settings, setSettings] = useState({
    kerfWidth: 0.125,
    includeFabrication: true,
    includeInstallation: false,
    breakageBuffer: 10,
    showVisualLayouts: true,
    multiProductOptimization: false
  });

  // Load saved quotes and stone data on mount - UPDATED URL
  useEffect(() => {
    const saved = localStorage.getItem('aicSavedQuotes');
    if (saved) {
      setSavedQuotes(JSON.parse(saved));
    }

    // Updated to use new Google Sheet URL
    fetch("https://opensheet.elk.sh/1ByFPjBqXBOp0bWLVAgTPMgrrDOSTpwwmvKkpAuUSiiY/Sheet1")
      .then((res) => res.json())
      .then((data) => {
        console.log("Loaded stone data:", data); // Debug log
        setStoneOptions(data);
        // Don't set default stone, let user select
      })
      .catch((error) => {
        console.error("Failed to load stone data:", error);
        setStoneOptions([]);
      });
  }, []);

  // Product management
  const updateProduct = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      { 
        stone: '', 
        brand: '',
        type: '',
        color: '',
        finish: '',
        width: '', 
        depth: '', 
        quantity: 1, 
        edgeDetail: 'Eased', 
        result: null, 
        id: Date.now(),
        customName: '',
        priority: 'normal',
        note: ''
      }
    ]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  // NEW: Handle bulk products from AI parsing
  const handleBulkProductAdd = (parsedProducts) => {
    console.log('Adding bulk products:', parsedProducts);
    
    // Remove the initial empty product if it's still empty
    const filteredExisting = products.filter(p => 
      p.width || p.depth || p.customName || p.note
    );
    
    // Add new products
    setProducts([...filteredExisting, ...parsedProducts]);
  };

  // Drawing upload handler
  const handleDrawingUpload = async (e, index) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setLoadingAI(true);
    
    try {
      const claudeData = await analyzeDrawingWithAI(selectedFile);
      const { newProducts, alertMessage } = handleClaudeMultiplePiecesExtraction(
        claudeData, 
        index, 
        products, 
        stoneOptions,
        (stone) => `${stone.Brand} ${stone.Type} - ${stone.Color}` // Pass stone formatter
      );
      
      setProducts(newProducts);
      alert(alertMessage);
    } catch (error) {
      console.error("File processing error:", error);
      alert("❌ Failed to analyze drawing: " + error.message);
    } finally {
      setLoadingAI(false);
    }
  };

  // Calculate all products - Updated to always include kerf consideration
  const calculateAll = () => {
    let results;
    let optimizationResults = null;
    
    // Settings now always includes kerf (includeKerf removed, kerfWidth may be 0)
    const updatedSettings = {
      ...settings,
      includeKerf: settings.kerfWidth > 0
    };
    
    if (settings.multiProductOptimization) {
      // Use multi-type optimization
      optimizationResults = optimizeMultiTypeLayout(products, stoneOptions, updatedSettings);
      results = applyMultiTypeOptimization(products, optimizationResults, stoneOptions, updatedSettings);
      setOptimizationData(optimizationResults);
    } else {
      // Use standard calculation
      results = products.map((product) => 
        calculateProductResults(product, stoneOptions, updatedSettings)
      );
      setOptimizationData(null);
    }
    
    setAllResults(results);
    setShowResults(true);
  };

  // Quote management
  const saveQuote = () => {
    const quoteName = prompt('Enter a name for this quote:');
    if (!quoteName) return;

    const quoteData = {
      id: Date.now(),
      name: quoteName,
      date: new Date().toISOString(),
      userInfo,
      products: products.map(p => ({...p, result: null})),
      settings
    };

    const newSavedQuotes = [...savedQuotes, quoteData];
    setSavedQuotes(newSavedQuotes);
    localStorage.setItem('aicSavedQuotes', JSON.stringify(newSavedQuotes));
    alert('Quote saved successfully!');
  };

  const loadQuote = (quote) => {
    setUserInfo(quote.userInfo);
    setProducts(quote.products);
    setSettings(quote.settings);
    setShowSavedQuotes(false);
    alert('Quote loaded successfully!');
  };

  const deleteQuote = (quoteId) => {
    if (confirm('Are you sure you want to delete this quote?')) {
      const newSavedQuotes = savedQuotes.filter(q => q.id !== quoteId);
      setSavedQuotes(newSavedQuotes);
      localStorage.setItem('aicSavedQuotes', JSON.stringify(newSavedQuotes));
    }
  };

  // PDF and Email handlers
  const handleGeneratePDF = () => {
    generateQuotePDF(allResults, userInfo, stoneOptions, settings, optimizationData);
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setEmailStatus('Sending email...');
    
    const result = await sendQuoteEmail(userInfo, allResults, stoneOptions);
    
    if (result.success) {
      setEmailStatus('✅ Email sent successfully!');
    } else {
      setEmailStatus('❌ Failed to send email');
    }
    
    setSendingEmail(false);
    setTimeout(() => setEmailStatus(''), 5000);
  };

  // Conditional rendering
  if (showSavedQuotes) {
    return (
      <SavedQuotesView 
        savedQuotes={savedQuotes}
        onLoad={loadQuote}
        onDelete={deleteQuote}
        onBack={() => setShowSavedQuotes(false)}
      />
    );
  }

  if (showResults) {
    return (
      <ResultsView 
        allResults={allResults}
        optimizationData={optimizationData}
        stoneOptions={stoneOptions}
        userInfo={userInfo}
        settings={settings}
        onBack={() => setShowResults(false)}
        onGeneratePDF={handleGeneratePDF}
        onSendEmail={handleSendEmail}
        sendingEmail={sendingEmail}
        emailStatus={emailStatus}
      />
    );
  }

  // Main form view
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        savedQuotes={savedQuotes}
        onSaveQuote={saveQuote}
        onShowSavedQuotes={() => setShowSavedQuotes(true)}
      />
      
      <ProgressSteps currentStep={2} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          <aside>
            <SettingsSidebar 
              settings={settings}
              onChange={setSettings}
            />
          </aside>
          
          <main className="space-y-6">
            {/* Contact Information */}
            <ContactForm 
              userInfo={userInfo}
              onChange={setUserInfo}
            />
            
            {/* NEW: Separate Bulk Import Section */}
            <BulkProductImport 
              stoneOptions={stoneOptions}
              onProductsParsed={handleBulkProductAdd}
            />
            
            {products.map((product, index) => (
              <ProductCard 
                key={product.id}
                product={product}
                index={index}
                stoneOptions={stoneOptions}
                onUpdate={updateProduct}
                onRemove={removeProduct}
                onUpload={handleDrawingUpload}
                loadingAI={loadingAI}
                canRemove={products.length > 1}
              />
            ))}
            
            <button
              onClick={addProduct}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-all flex items-center justify-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Add Another Type
            </button>
          </main>
        </div>
      </div>

      {/* Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {products.length} type{products.length !== 1 ? 's' : ''} added
            </p>
            <div className="flex gap-3">
              <Button
                onClick={addProduct}
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                Add Type
              </Button>
              <Button
                onClick={calculateAll}
                size="lg"
                className="shadow-lg"
              >
                <Calculator className="w-5 h-5" />
                Calculate Quote
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed action bar */}
      <div className="h-24"></div>
    </div>
  );
}
