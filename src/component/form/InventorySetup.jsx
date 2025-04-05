import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const InventorySetup = ({ nextStep, prevStep, isDarkMode = false }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Product selection
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productPrice, setProductPrice] = useState('');
  
  // Predefined products
  const availableProducts = [
    { id: 'tshirt', name: 'T-shirt' },
    { id: 'oversize-tshirt', name: 'Oversize T-shirt' },
    { id: 'hoodie', name: 'Hoodie' },
    { id: 'oversize-hoodie', name: 'Oversize Hoodie' },
    { id: 'sweatshirt', name: 'Sweatshirt' }
  ];
  
  // Colors and sizes
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedGsm, setSelectedGsm] = useState([]);
  const [quantities, setQuantities] = useState({});
  
  // Input values
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [gsmInput, setGsmInput] = useState('');
  
  // Predefined colors and sizes from the image
  const availableColors = [
    'White', 'Black', 'Navy', 'Red', 'Blue',
    'Gray', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange'
  ];
  
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const availableGsm = ['150', '180', '200', '220', '240', '280'];

  // Fetch user session
  useEffect(() => {
    const fetchSession = async () => {
      setIsPageLoading(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error("Authentication error");
        }
        setUserId(session.user.id);
      } catch (error) {
        console.error("Error fetching session:", error);
        setError("Authentication error. Please log in again.");
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchSession();
  }, []);

  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedColors(prev => {
      if (prev.includes(color)) {
        return prev.filter(c => c !== color);
      }
      return [...prev, color];
    });
  };

  // Handle adding a new color
  const handleAddColor = () => {
    if (colorInput.trim()) {
      handleColorSelect(colorInput.trim());
      setColorInput('');
    }
  };

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      }
      return [...prev, size];
    });
  };

  // Handle adding a new size
  const handleAddSize = () => {
    if (sizeInput.trim()) {
      handleSizeSelect(sizeInput.trim());
      setSizeInput('');
    }
  };

  // Handle GSM selection
  const handleGsmSelect = (gsm) => {
    setSelectedGsm(prev => {
      if (prev.includes(gsm)) {
        return prev.filter(g => g !== gsm);
      }
      return [...prev, gsm];
    });
  };

  // Handle adding a new GSM
  const handleAddGsm = () => {
    if (gsmInput.trim()) {
      handleGsmSelect(gsmInput.trim());
      setGsmInput('');
    }
  };

  // Handle quantity change
  const handleQuantityChange = (color, gsm, size, value) => {
    setQuantities(prev => ({
      ...prev,
      [`${color}-${gsm}-${size}`]: parseInt(value) || 0
    }));
  };

  // Handle product selection
  const handleProductSelect = (e) => {
    setSelectedProduct(e.target.value);
  };

  // Handle price change
  const handlePriceChange = (e) => {
    setProductPrice(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }
    
    if (!productPrice || isNaN(parseFloat(productPrice)) || parseFloat(productPrice) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    if (selectedColors.length === 0) {
      setError('Please add at least one color');
      return;
    }
    
    if (selectedSizes.length === 0) {
      setError('Please add at least one size');
      return;
    }
    
    if (selectedGsm.length === 0) {
      setError('Please add at least one GSM value');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Prepare inventory data
      const inventoryData = {
        brand_id: userId,
        product_id: selectedProduct,
        price: parseFloat(productPrice),
        data: selectedColors.map(color => ({
          color,
          ...selectedSizes.reduce((acc, size) => ({
            ...acc,
            [size]: quantities[`${color}-${selectedGsm[0]}-${size}`] || 0
          }), {}),
          gsm: selectedGsm[0]
        }))
      };

      // Insert into database
      const { error: insertError } = await supabase
        .from('inventory')
        .insert(inventoryData);

      if (insertError) throw insertError;

      setSuccess('Inventory added successfully');
      // Reset form
      setSelectedProduct('');
      setProductPrice('');
      setSelectedColors([]);
      setSelectedSizes([]);
      setSelectedGsm([]);
      setQuantities({});
      
    } catch (error) {
      console.error('Error adding inventory:', error);
      setError('Failed to add inventory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-2' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg`}>Loading inventory setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-dark-2 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className={`mr-4 p-2 rounded-full hover:bg-opacity-10 ${isDarkMode ? 'hover:bg-gray-300' : 'hover:bg-gray-700'}`}
          >
            <ArrowBackIcon className={isDarkMode ? 'text-white' : 'text-gray-800'} />
          </button>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Inventory Setup</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-100 text-red-700 border border-red-400">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-md bg-green-100 text-green-700 border border-green-400">
            <p>{success}</p>
          </div>
        )}

        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-dark-3' : 'bg-white'} shadow-sm`}>
          <h3 className="text-xl font-semibold mb-4">Product Information</h3>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">Select Product</label>
            <select 
              value={selectedProduct} 
              onChange={handleProductSelect} 
              className={`w-full px-4 py-2 rounded-md border ${
                isDarkMode 
                  ? 'bg-dark-4 border-dark-3 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">-- Select a product --</option>
              {availableProducts.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Product Price (₹)</label>
            <input 
              type="number" 
              value={productPrice} 
              onChange={handlePriceChange} 
              min="0" 
              step="0.01" 
              placeholder="Enter price in rupees" 
              className={`w-full px-4 py-2 rounded-md border ${
                isDarkMode 
                  ? 'bg-dark-4 border-dark-3 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-dark-3' : 'bg-white'} shadow-sm`}>
          <h3 className="text-xl font-semibold mb-4">Colors</h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {availableColors.map(color => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`px-3 py-2 rounded-md text-sm ${
                  selectedColors.includes(color)
                    ? 'bg-secondary text-white'
                    : isDarkMode
                      ? 'bg-dark-4 text-white hover:bg-dark-5'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {color}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="Add custom color"
              className={`flex-1 px-4 py-2 rounded-md border ${
                isDarkMode 
                  ? 'bg-dark-4 border-dark-3 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              onClick={handleAddColor}
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-[#0BB489]"
            >
              Add
            </button>
          </div>
        </div>

        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-dark-3' : 'bg-white'} shadow-sm`}>
          <h3 className="text-xl font-semibold mb-4">Sizes</h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {availableSizes.map(size => (
              <button
                key={size}
                onClick={() => handleSizeSelect(size)}
                className={`px-3 py-2 rounded-md text-sm ${
                  selectedSizes.includes(size)
                    ? 'bg-secondary text-white'
                    : isDarkMode
                      ? 'bg-dark-4 text-white hover:bg-dark-5'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              placeholder="Add custom size"
              className={`flex-1 px-4 py-2 rounded-md border ${
                isDarkMode 
                  ? 'bg-dark-4 border-dark-3 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              onClick={handleAddSize}
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-[#0BB489]"
            >
              Add
            </button>
          </div>
        </div>

        <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-dark-3' : 'bg-white'} shadow-sm`}>
          <h3 className="text-xl font-semibold mb-4">GSM</h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {availableGsm.map(gsm => (
              <button
                key={gsm}
                onClick={() => handleGsmSelect(gsm)}
                className={`px-3 py-2 rounded-md text-sm ${
                  selectedGsm.includes(gsm)
                    ? 'bg-secondary text-white'
                    : isDarkMode
                      ? 'bg-dark-4 text-white hover:bg-dark-5'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {gsm}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={gsmInput}
              onChange={(e) => setGsmInput(e.target.value)}
              placeholder="Add custom GSM"
              className={`flex-1 px-4 py-2 rounded-md border ${
                isDarkMode 
                  ? 'bg-dark-4 border-dark-3 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              onClick={handleAddGsm}
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-[#0BB489]"
            >
              Add
            </button>
          </div>
        </div>

        {selectedColors.length > 0 && selectedSizes.length > 0 && selectedGsm.length > 0 && (
          <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-dark-3' : 'bg-white'} shadow-sm`}>
            <h3 className="text-xl font-semibold mb-4">Inventory Quantities</h3>
            
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <thead>
                  <tr className={isDarkMode ? 'border-b border-dark-4' : 'border-b border-gray-300'}>
                    <th className="px-4 py-2 text-left">Color</th>
                    {selectedSizes.map(size => (
                      <th key={size} className="px-4 py-2 text-center">{size}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedColors.map(color => (
                    <tr key={color} className={isDarkMode ? 'border-b border-dark-4' : 'border-b border-gray-200'}>
                      <td className="px-4 py-2">{color}</td>
                      {selectedSizes.map(size => (
                        <td key={`${color}-${size}`} className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            value={quantities[`${color}-${selectedGsm[0]}-${size}`] || ''}
                            onChange={(e) => handleQuantityChange(color, selectedGsm[0], size, e.target.value)}
                            className={`w-full px-3 py-1 rounded border text-center ${
                              isDarkMode 
                                ? 'bg-dark-4 border-dark-3 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-6 py-3 bg-secondary text-white rounded-md flex items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#0BB489]'}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Inventory...
              </>
            ) : 'Save Inventory'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventorySetup;