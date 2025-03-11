import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const InventorySetup = ({ nextStep, prevStep }) => {
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
      <div className="min-h-screen flex items-center justify-center bg-dark-2">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading inventory setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-dark-1 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Inventory Item</h2>
        
        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900 text-green-200 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-white mb-2">Select Product</label>
            <select
              value={selectedProduct}
              onChange={handleProductSelect}
              className="w-full bg-dark-2 text-white border border-gray-700 rounded-lg p-3"
            >
              <option value="">Select a product</option>
              {availableProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Price */}
          <div>
            <label className="block text-white mb-2">Product Price</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">₹</span>
              <input
                type="number"
                value={productPrice}
                onChange={handlePriceChange}
                className="w-full bg-dark-2 text-white border border-gray-700 rounded-lg p-3 pl-8"
                placeholder="Enter price"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-white mb-2">Add Colors</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter color name (e.g. Red, Blue, Black)"
                className="flex-grow bg-dark-2 text-white border border-gray-700 rounded-lg p-3"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddColor();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="bg-secondary text-white px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>
            {selectedColors.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedColors.map(color => (
                  <div key={color} className="bg-dark-2 text-white px-3 py-1 rounded-lg flex items-center">
                    {color}
                    <button
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Size Selection */}
          <div>
            <label className="block text-white mb-2">Add Sizes</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter size (e.g. S, M, L, XL)"
                className="flex-grow bg-dark-2 text-white border border-gray-700 rounded-lg p-3"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSize();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="bg-secondary text-white px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>
            {selectedSizes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedSizes.map(size => (
                  <div key={size} className="bg-dark-2 text-white px-3 py-1 rounded-lg flex items-center">
                    {size}
                    <button
                      type="button"
                      onClick={() => handleSizeSelect(size)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GSM Selection */}
          <div>
            <label className="block text-white mb-2">Add GSM</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter GSM (e.g. 180, 200, 220)"
                className="flex-grow bg-dark-2 text-white border border-gray-700 rounded-lg p-3"
                value={gsmInput}
                onChange={(e) => setGsmInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGsm();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddGsm}
                className="bg-secondary text-white px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>
            {selectedGsm.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedGsm.map(gsm => (
                  <div key={gsm} className="bg-dark-2 text-white px-3 py-1 rounded-lg flex items-center">
                    {gsm}
                    <button
                      type="button"
                      onClick={() => handleGsmSelect(gsm)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quantity Matrix */}
          {selectedColors.length > 0 && selectedSizes.length > 0 && selectedGsm.length > 0 && (
            <div>
              <label className="block text-white mb-2">Set Quantities</label>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Color</th>
                      <th className="text-left p-2">GSM</th>
                      {selectedSizes.map(size => (
                        <th key={size} className="p-2">{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedColors.map(color => (
                      selectedGsm.map(gsm => (
                        <tr key={`${color}-${gsm}`} className="border-t border-gray-700">
                          <td className="p-2">{color}</td>
                          <td className="p-2">{gsm}</td>
                          {selectedSizes.map(size => (
                            <td key={size} className="p-2">
                              <input
                                type="number"
                                min="0"
                                value={quantities[`${color}-${gsm}-${size}`] || ''}
                                onChange={(e) => handleQuantityChange(color, gsm, size, e.target.value)}
                                className="w-20 bg-dark-2 text-white border border-gray-700 rounded p-2"
                              />
                            </td>
                          ))}
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-dark-2 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-[#0BB489] disabled:bg-gray-600"
            >
              {isLoading ? 'Adding...' : 'Add Inventory Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventorySetup;