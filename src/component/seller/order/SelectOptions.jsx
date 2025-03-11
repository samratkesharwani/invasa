import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import PrintDesign from './PrintDesign';

// Simple BackButton component
const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="p-2 bg-gray-700 hover:bg-gray-600 border-gray-700 border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white"
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
  handleOptionChange 
}) => {
  // Auto-select first size and color if available and none selected
  useEffect(() => {
    if (availableSizes && availableSizes.length > 0 && !selectedSize) {
      handleOptionChange('selectedSize', availableSizes[0]);
    }
    
    if (availableColors && availableColors.length > 0 && !selectedColor) {
      handleOptionChange('selectedColor', availableColors[0]);
    }
  }, [availableSizes, availableColors, selectedSize, selectedColor]);
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-dark-3 p-6 rounded-lg">
      <h3 className="text-white text-lg mb-4">Product Options for {selectedProduct || 'Product'}</h3>
      
      {/* Size Selection */}
      <div className="mb-6">
        <label className="block text-white mb-2 font-medium">Size</label>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <button
              key={size}
              className={`px-4 py-2 rounded-md ${
                selectedSize === size 
                  ? 'bg-secondary text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
        <label className="block text-white mb-2 font-medium">Color</label>
        <div className="flex flex-wrap gap-2">
          {availableColors.map((color) => (
            <button
              key={color}
              className={`px-4 py-2 rounded-md ${
                selectedColor === color 
                  ? 'bg-secondary text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
        <label className="block text-white mb-2 font-medium">Quantity</label>
        <div className="flex items-center">
          <button
            className="bg-gray-700 text-white px-4 py-2 rounded-l hover:bg-gray-600"
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
            className="bg-gray-800 text-white text-center w-16 py-2 border-0"
          />
          <button
            className="bg-gray-700 text-white px-4 py-2 rounded-r hover:bg-gray-600"
            onClick={() => handleOptionChange('quantity', (quantity || 0) + 1)}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

function SelectOptions({ setOrderData, orderData, handleChange, stepDec, stepInc }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [printData, setPrintData] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);

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
  }, []);

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
        
        // Initialize with default values if not set
        if (!orderData.productData.quantity) {
          handleOptionChange('quantity', 1);
        }
        
        // Try to fetch real print data from user's previous uploads if needed
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

  // Validate if the selected options are available in inventory
  const validateStockAvailability = () => {
    const { selectedSize, selectedColor, quantity } = orderData.productData || {};
    
    if (!selectedSize || !selectedColor || !quantity || quantity <= 0) {
      return { valid: false, message: "Please select size, color and quantity." };
    }
    
    // Find the color row in inventory data
    const inventoryData = orderData.productData?.inventory_data || [];
    const colorRow = inventoryData.find(
      item => item && item.color === selectedColor
    );
    
    if (!colorRow) {
      return { valid: false, message: `${selectedColor} is not available.` };
    }
    
    // Check if the size is available directly
    const availableQuantity = colorRow[selectedSize];
    
    if (!availableQuantity || availableQuantity <= 0) {
      return { 
        valid: false, 
        message: `${selectedSize} size in ${selectedColor} is out of stock.` 
      };
    }
    
    if (quantity > availableQuantity) {
      return { 
        valid: false, 
        message: `Only ${availableQuantity} items available in ${selectedSize} size in ${selectedColor}.` 
      };
    }
    
    return { valid: true };
  };

  const handleNextClick = () => {
    // Validate that at least one print is selected
    if (!orderData.printData || orderData.printData.length === 0) {
      setError("Please add at least one print design.");
      return;
    }
    
    // Validate stock availability
    const stockValidation = validateStockAvailability();
    if (!stockValidation.valid) {
      setError(stockValidation.message);
      return;
    }
    
    // If all validations pass, proceed to next step
    stepInc();
    console.log(orderData)
  };

  return (
    <>
      <div className="m-4 pb-5 rounded-lg dark:bg-dark-2">
        <div className="container flex items-center justify-evenly w-full">
          <h1 className="text-white text-lg text-center mt-10 mb-10 w-full">
            Select Options
          </h1>
        </div>
        
        {error && (
          <div className="bg-gray-900 dark:bg-dark-1 border border-red-500 text-red-400 px-4 py-3 rounded relative mb-6 mx-10" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="text-white text-center flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mr-3"></div>
            <span>Loading options...</span>
          </div>
        ) : (
          <div className="grid place-items-center gap-8">
            {/* Product Options Component */}
            <ProductOptions
              availableSizes={availableSizes}
              availableColors={availableColors}
              selectedProduct={orderData.productData?.selectedProduct}
              selectedSize={orderData.productData?.selectedSize}
              selectedColor={orderData.productData?.selectedColor}
              quantity={orderData.productData?.quantity || 1}
              handleOptionChange={handleOptionChange}
            />
            
            {/* Print Design Component */}
            <div className="w-full max-w-4xl mx-auto mt-4">
              <h2 className="text-white text-lg mb-4">Design Your Print</h2>
              <PrintDesign
                setOrderData={setOrderData}
                orderData={orderData}
                printData={printData}
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-10 mx-10">
          <BackButton onClick={stepDec} />
          <button
            onClick={handleNextClick}
            className="p-2 w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489]"
            disabled={loading}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default SelectOptions;
