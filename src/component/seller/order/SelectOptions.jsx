import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../utils/supabase';
import PrintDesign from './PrintDesign';

// Simple BackButton component
const BackButton = ({ onClick, isDarkMode = false }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium ${
      isDarkMode 
        ? 'bg-gray-700 hover:bg-gray-600 border-gray-700 text-white' 
        : 'bg-gray-200 hover:bg-gray-300 border-gray-300 text-gray-700'
    } border`}
  >
    Back
  </button>
);

// Simplified ProductOptions component like standard e-commerce
const ProductOptions = ({ 
  availableSizes, 
  availableColors, 
  selectedProduct,
  selectedSize,
  selectedColor,
  quantity,
  handleOptionChange,
  isDarkMode = false
}) => {
  // Auto-select first size and color if available and none selected
  useEffect(() => {
    if (availableSizes && availableSizes.length > 0 && !selectedSize) {
      handleOptionChange('selectedSize', availableSizes[0]);
    }
    
    if (availableColors && availableColors.length > 0 && !selectedColor) {
      handleOptionChange('selectedColor', availableColors[0]);
    }
  }, [availableSizes, availableColors, selectedSize, selectedColor, handleOptionChange]);
  
  return (
    <div className={`w-full max-w-4xl mx-auto p-6 rounded-lg ${isDarkMode ? 'bg-dark-3' : 'bg-white border border-gray-200'}`}>
      <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Product Options for {selectedProduct || 'Product'}
      </h3>
      
      {/* Size Selection */}
      <div className="mb-6">
        <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Size
        </label>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <button
              key={size}
              className={`px-4 py-2 rounded-md ${
                selectedSize === size 
                  ? isDarkMode
                    ? 'bg-secondary text-black' 
                    : 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'bg-dark-4 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleOptionChange('selectedSize', size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      
      {/* Color Selection */}
      <div className="mb-6">
        <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {availableColors.map((color) => (
            <button
              key={color}
              className={`px-4 py-2 rounded-md ${
                selectedColor === color 
                  ? isDarkMode
                    ? 'bg-secondary text-black' 
                    : 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'bg-dark-4 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleOptionChange('selectedColor', color)}
              style={{
                borderBottom: `3px solid ${color.toLowerCase()}`,
              }}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      
      {/* Quantity Selection */}
      <div className="mb-6">
        <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Quantity
        </label>
        <div className="flex items-center">
          <button
            className={`px-4 py-2 rounded-l ${
              isDarkMode 
                ? 'bg-dark-4 text-white hover:bg-gray-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => {
              if (quantity > 1) {
                handleOptionChange('quantity', quantity - 1);
              }
            }}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity || 1}
            onChange={(e) => handleOptionChange('quantity', parseInt(e.target.value) || 1)}
            className={`text-center w-16 py-2 border-y ${
              isDarkMode 
                ? 'bg-dark-4 border-gray-700 text-white' 
                : 'bg-gray-100 border-gray-200 text-gray-900'
            }`}
          />
          <button
            className={`px-4 py-2 rounded-r ${
              isDarkMode 
                ? 'bg-dark-4 text-white hover:bg-gray-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleOptionChange('quantity', (quantity || 0) + 1)}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

function SelectOptions({ setOrderData, orderData, handleChange, stepDec, stepInc, isDarkMode = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [printData, setPrintData] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);

  // Store the navigation action in a ref to prevent data loss during navigation
  const navigateRef = useRef({ action: null });

  // Initialize orderData structure if it doesn't exist
  useEffect(() => {
    if (!orderData.productData) {
      setOrderData(prevState => ({
        ...prevState,
        productData: {
          selectedProduct: '',
          selectedSize: '',
          selectedColor: '',
          quantity: 1
        }
      }));
    }
    
    if (!orderData.printData) {
      setOrderData(prevState => ({
        ...prevState,
        printData: []
      }));
    }
  }, [orderData, setOrderData]);

  // Handle navigation between steps
  const handleNavigate = (action) => {
    // Store the action to be performed after data is saved
    navigateRef.current.action = action;
    
    // Navigate after ensuring data is saved
    if (action === 'next') {
      handleNextClick();
    } else if (action === 'back') {
      // Just go back - we've already saved state
      stepDec();
    }
  };

  useEffect(() => {
    const fetchPrintData = async () => {
      setLoading(true);
      try {
        // Get user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session || !session.user) {
          console.error("No user session found.");
          setError("Authentication error. Please log in again.");
          setLoading(false);
          return;
        }
        
        // Check if a product is selected
        if (!orderData.productData || !orderData.productData.selectedProduct || !orderData.productData.inventory_data) {
          setError("Please select a product first.");
          setLoading(false);
          return;
        }
        
        console.log("Order data:", orderData);
        
        // Extract available options from inventory data
        const inventoryData = orderData.productData.inventory_data || [];
        console.log("Inventory data for options:", inventoryData);
        
        // Extract available colors
        const colors = [];
        inventoryData.forEach(item => {
          if (item && item.color && !colors.includes(item.color)) {
            colors.push(item.color);
          }
        });
        
        // Extract available sizes - using the direct size properties (L, S, XS, etc.)
        const sizes = new Set();
        
        inventoryData.forEach(colorData => {
          if (!colorData) return;
          
          // Check each property in the color data
          Object.keys(colorData).forEach(key => {
            // If it's not 'color' and has a positive value, it's a size
            if (key !== 'color' && colorData[key] > 0) {
              sizes.add(key);
            }
          });
        });
        
        setAvailableSizes(Array.from(sizes));
        setAvailableColors(colors);
        
        console.log("Available sizes:", Array.from(sizes));
        console.log("Available colors:", colors);
        
        // Initialize with default values if not set but preserve existing selections
        if (!orderData.productData.quantity) {
          handleOptionChange('quantity', 1);
        }
        
        // Try to fetch real print data from user's previous uploads if needed
        if (!orderData.printData || orderData.printData.length === 0) {
          try {
            const { data: prints, error: printsError } = await supabase
              .from('prints')
              .select('*')
              .eq('user_id', session.user.id);
              
            if (printsError) {
              console.error("Error fetching prints:", printsError);
              setPrintData([]);
            } else if (prints && prints.length > 0) {
              // Calculate area for each print
              const printsWithArea = prints.map(print => {
                const width = print.width || 0;
                const height = print.height || 0;
                const area = width * height;
                return { ...print, area };
              });
              
              setPrintData(printsWithArea);
            } else {
              setPrintData([]);
            }
          } catch (error) {
            console.error("Error in print fetch:", error);
            setPrintData([]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load options. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrintData();
  }, [orderData.productData?.selectedProduct, orderData.productData?.inventory_data]);

  const handleOptionChange = (option, value) => {
    setOrderData((prevState) => ({
      ...prevState,
      productData: {
        ...(prevState.productData || {}),
        [option]: value
      },
    }));
  };

  const validateStockAvailability = () => {
    // Check if the selected product, size, and color have stock
    if (!orderData.productData) return false;
    
    const { selectedProduct, selectedSize, selectedColor, quantity, inventory_data } = orderData.productData;
    if (!selectedProduct || !selectedSize || !selectedColor || !inventory_data) return false;
    
    // Find the color row in the inventory data
    const colorStock = inventory_data.find(item => item.color === selectedColor);
    if (!colorStock) return false;
    
    // Check if there's enough stock for the selected size
    return colorStock[selectedSize] >= quantity;
  };

  const handleNextClick = () => {
    // Validate product options
    if (!orderData.productData?.selectedProduct) {
      setError("Please select a product first.");
      return;
    }
    if (!orderData.productData?.selectedSize) {
      setError("Please select a size.");
      return;
    }
    if (!orderData.productData?.selectedColor) {
      setError("Please select a color.");
      return;
    }
    
    // Check stock availability
    if (!validateStockAvailability()) {
      setError("The selected product is out of stock in the chosen size and color. Please make another selection.");
      return;
    }
    
    // Check if there are any print designs
    if (!orderData.printData || orderData.printData.length === 0) {
      setError("Please create at least one print design before proceeding.");
      return;
    }
    
    // Move to the next step
    stepInc();
  };

  return (
    <div className="mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => handleNavigate('back')} 
          className={`mr-4 p-2 rounded-full ${isDarkMode ? 'bg-dark-3 hover:bg-dark-4' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Customize Options
        </h2>
      </div>
      
      {error && (
        <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-red-900 bg-opacity-20 border border-red-800 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid ${isDarkMode ? 'border-white border-t-transparent' : 'border-blue-600 border-t-transparent'}`} />
        </div>
      ) : (
        <>
          <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-dark-3' : 'bg-gray-100'}`}>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Customize your {orderData.productData?.selectedProduct || 'product'} before placing your order.
            </p>
          </div>
          
          <ProductOptions
            availableSizes={availableSizes}
            availableColors={availableColors}
            selectedProduct={orderData.productData?.selectedProduct}
            selectedSize={orderData.productData?.selectedSize}
            selectedColor={orderData.productData?.selectedColor}
            quantity={orderData.productData?.quantity || 1}
            handleOptionChange={handleOptionChange}
            isDarkMode={isDarkMode}
          />
          
          {/* Print Design Component */}
          <div className={`mt-8 overflow-hidden rounded-lg ${isDarkMode ? 'bg-dark-3' : 'bg-white border border-gray-200'}`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Design Your Print
              </h3>
            </div>
            <div className="p-4">
              <PrintDesign
                setOrderData={setOrderData}
                orderData={orderData}
                printData={printData}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
          
          <div className={`p-6 rounded-lg mt-6 ${isDarkMode ? 'bg-dark-3' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Print Summary
            </h3>
            
            <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your custom print design will be applied to the selected product.
            </p>
            
            {orderData.printData && orderData.printData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderData.printData.map((print, index) => (
                  <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-dark-4' : 'bg-gray-50 border border-gray-200'}`}>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {print.position || print.side}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Size: {print.width/16}x{print.height/16} inches (Area: {print.area} sq. in)
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-dark-4' : 'bg-gray-50 border border-gray-200'}`}>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  No print designs created. Please use the design tool above to create at least one print.
                </p>
              </div>
            )}
            
            {orderData.totalPrintArea && (
              <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-dark-4' : 'bg-gray-50 border border-gray-200'}`}>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Total Print Area: {orderData.totalPrintArea} square inches
                </p>
              </div>
            )}
          </div>
        </>
      )}
      
      <div className="flex justify-between mt-8">
        <button
          onClick={() => handleNavigate('back')}
          className={`px-6 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Back
        </button>
        <button
          onClick={() => handleNavigate('next')}
          disabled={loading || !validateStockAvailability() || !orderData.printData || orderData.printData.length === 0}
          className={`px-6 py-2 rounded-lg ${
            loading || !validateStockAvailability() || !orderData.printData || orderData.printData.length === 0
              ? isDarkMode 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isDarkMode 
                ? 'bg-secondary text-black hover:bg-green-600' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default SelectOptions;
