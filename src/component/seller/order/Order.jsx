import React, { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import Button from '../../Button'
import { useNavigate } from "react-router-dom";
import BackButton from "../../element/BackButton";
import FullAddress from "./FullAddress";
import SelectProduct from "./SelectProduct";
import SelectOptions from "./SelectOptions";
import OrderPayment from "./OrderPayment";
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

const Order = ({ isDarkMode = false }) => {
  const navigate= useNavigate()
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [orderData, setOrderData] = useState({
    sellerId:"",
    brandId:"",
    selectedCity: "",
    cityDisplayName: "",
    maxDistance: 10, // Maximum distance in km for seller selection
    customerInfo: { 
      customerName: "",
      customerContact: "",
    },
    coordinates:"",
    fullAddress: {
      address: "",
      pincode: "",
    },
    productData: {
      selectedProduct: "",
      selectedProductPrice:0,
      selectedSize: "",
      selectedGSM: "",
      selectedColor: "",
      driveLink: "",
      prints: {
        frontPrint: {
          image: null,
          size: { width: 0, height: 0 },
          position: { x: 0, y: 0 },
          area: 0
        },
        backPrint: {
          image: null,
          size: { width: 0, height: 0 },
          position: { x: 0, y: 0 },
          area: 0
        },
        leftSidePrint: {
          image: null,
          size: { width: 0, height: 0 },
          position: { x: 0, y: 0 },
          area: 0
        },
        rightSidePrint: {
          image: null,
          size: { width: 0, height: 0 },
          position: { x: 0, y: 0 },
          area: 0
        },
        totalPrintSize: 0
      }
    },
    paymentAmount:"",
    transactionId:"",
    status:"pending"
  });
  
  // Load print data from Supabase when component mounts
  useEffect(() => {
    const loadPrintData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        
        const { data, error } = await supabase
          .from('prints')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (error) {
          console.error("Error loading print data:", error);
          return;
        }
        
        if (data) {
          // Calculate areas for each print
          const DPI = 10; // Same as in Print component
          const frontArea = data.front_image ? (data.front_size.width / DPI) * (data.front_size.height / DPI) : 0;
          const backArea = data.back_image ? (data.back_size.width / DPI) * (data.back_size.height / DPI) : 0;
          const leftArea = data.left_image ? (data.left_size.width / DPI) * (data.left_size.height / DPI) : 0;
          const rightArea = data.right_image ? (data.right_size.width / DPI) * (data.right_size.height / DPI) : 0;
          
          setOrderData(prevData => ({
            ...prevData,
            productData: {
              ...prevData.productData,
              prints: {
                frontPrint: {
                  image: data.front_image,
                  size: data.front_size || { width: 0, height: 0 },
                  position: data.front_position || { x: 0, y: 0 },
                  area: frontArea
                },
                backPrint: {
                  image: data.back_image,
                  size: data.back_size || { width: 0, height: 0 },
                  position: data.back_position || { x: 0, y: 0 },
                  area: backArea
                },
                leftSidePrint: {
                  image: data.left_image,
                  size: data.left_size || { width: 0, height: 0 },
                  position: data.left_position || { x: 0, y: 0 },
                  area: leftArea
                },
                rightSidePrint: {
                  image: data.right_image,
                  size: data.right_size || { width: 0, height: 0 },
                  position: data.right_position || { x: 0, y: 0 },
                  area: rightArea
                },
                totalPrintSize: data.total_print_size || 0
              }
            }
          }));
        }
      } catch (err) {
        console.error("Error loading print data:", err);
      }
    };
    
    loadPrintData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prevState) => {
      if (name in prevState.customerInfo) {
        return {
          ...prevState,
          customerInfo: {
            ...prevState.customerInfo,
            [name]: value,
          },
        };
      }
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  // Update print data from Print component
  const updatePrintData = (printData) => {
    setOrderData(prevData => ({
      ...prevData,
      productData: {
        ...prevData.productData,
        prints: printData
      }
    }));
  };

  const handleOrderSubmit = async () => {
    console.log("Submitting order with data:", orderData);
    
    // Validate that we have print data
    if (!orderData.printData || orderData.printData.length === 0) {
      console.error("No print data available for submission");
      alert("Please add at least one print design before submitting the order.");
      return;
    }
    
    // Check if any print data has invalid image URLs
    const invalidPrints = orderData.printData.filter(print => !print.image);
    if (invalidPrints.length > 0) {
      console.error("Some prints have invalid image URLs:", invalidPrints);
      alert("Some print designs have invalid images. Please check your designs.");
      return;
    }
    
    try {
      // First get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error getting user session:", sessionError);
        alert("Authentication error. Please log in again.");
        return;
      }
      
      if (!session || !session.user) {
        console.error("No user session found.");
        alert("Please log in before submitting an order.");
        return;
      }
      
      const currentUserId = session.user.id;
      console.log("Current user ID:", currentUserId);
      
      // Try to get a valid brandId from the brandsOnboardForm table for the current user
      const { data: brandData, error: brandError } = await supabase
        .from("brandsOnboardForm")
        .select("id")
        .eq("id", currentUserId)
        .single();
        
      if (brandError && brandError.code !== 'PGRST116') { // PGRST116 is 'not found'
        console.error("Error fetching brand data:", brandError);
      }
      
      // If the user has no brand registered, alert them
      if (!brandData || !brandData.id) {
        console.error("No brand found for user");
        
        // Alert with a clearer explanation
        alert(
          "Brand Registration Required\n\n" +
          "To complete your order, you need to register your brand with us first. " +
          "This is required for all sellers to ensure we have your brand details for printing. " +
          "You'll be redirected to a quick brand registration form. " +
          "After registering, you'll be able to complete your order."
        );
        
        setTimeout(() => {
          window.location.href = '/brand/register';
        }, 1500);
        return;
      }
      
      console.log("Found valid brand ID:", brandData.id);
    
    // Create a copy of the product data for submission
    const updatedProductData = {
      ...orderData.productData,
      printData: orderData.printData, // Include the full printData array
      prints: {
        frontPrint: {
          image: null,
          area: 0,
          size: { width: 0, height: 0 },
          position: { x: 0, y: 0 }
        },
        backPrint: {
          image: null,
          area: 0,
          size: { width: 0, height: 0 },
          position: { x: 0, y: 0 }
        },
        leftSidePrint: {
          image: null,
          area: 0,
          size: { width: 0, height: 0 },
          position: { x: 0, y: 0 }
        },
        rightSidePrint: {
          image: null,
          area: 0,
          size: { width: 0, height: 0 },
          position: { x: 0, y: 0 }
        },
        totalPrintSize: orderData.totalPrintArea || 0
      }
    };

    // Map the printData to the productData.prints structure
    if (orderData.printData && orderData.printData.length > 0) {
      orderData.printData.forEach(print => {
        // Convert width and height to inches
        const widthInches = print.width / 16;
        const heightInches = print.height / 16;
        // Calculate area in square inches
        const areaInSqInches = widthInches * heightInches;
        
        if (print.side === 'front') {
          updatedProductData.prints.frontPrint = {
            image: print.image,
            area: parseFloat(areaInSqInches.toFixed(2)),
            size: { 
              width: parseFloat(widthInches.toFixed(2)), 
              height: parseFloat(heightInches.toFixed(2)) 
            },
            position: { x: print.x || 0, y: print.y || 0 }
          };
        } else if (print.side === 'back') {
          updatedProductData.prints.backPrint = {
            image: print.image,
            area: parseFloat(areaInSqInches.toFixed(2)),
            size: { 
              width: parseFloat(widthInches.toFixed(2)), 
              height: parseFloat(heightInches.toFixed(2)) 
            },
            position: { x: print.x || 0, y: print.y || 0 }
          };
        } else if (print.side === 'left') {
          updatedProductData.prints.leftSidePrint = {
            image: print.image,
            area: parseFloat(areaInSqInches.toFixed(2)),
            size: { 
              width: parseFloat(widthInches.toFixed(2)), 
              height: parseFloat(heightInches.toFixed(2)) 
            },
            position: { x: print.x || 0, y: print.y || 0 }
          };
        } else if (print.side === 'right') {
          updatedProductData.prints.rightSidePrint = {
            image: print.image,
            area: parseFloat(areaInSqInches.toFixed(2)),
            size: { 
              width: parseFloat(widthInches.toFixed(2)), 
              height: parseFloat(heightInches.toFixed(2)) 
            },
            position: { x: print.x || 0, y: print.y || 0 }
          };
        }
      });
    }
    
    // Include captured designs if available
    if (orderData.capturedDesigns && orderData.capturedDesigns.length > 0) {
      console.log("Including captured designs in order submission:", orderData.capturedDesigns);
      updatedProductData.capturedDesigns = orderData.capturedDesigns;
    }

    console.log("Final product data for submission:", updatedProductData);

      // Always use the current user's ID for sellerId and the registered brand's ID
      const orderInsertData = {
        sellerId: currentUserId,
        brandId: brandData.id,
        selectedCity: orderData.selectedCity || 'Not specified',
        customerInfo: orderData.customerInfo || { name: 'Test Customer', email: 'test@example.com' },
        coordinates: orderData.coordinates || 'Not specified',
        fullAddress: orderData.fullAddress || { address: 'Test Address' },
        productData: updatedProductData,
        paymentAmount: orderData.paymentAmount || '1',
        transactionId: orderData.transactionId || `tx_${Date.now()}`,
        status: orderData.status || 'complete'
      };
      
      console.log("Order data prepared for insertion:", orderInsertData);

      // Insert the order data
      const { error: orderError } = await supabase.from("orders").insert([orderInsertData]);

    if (orderError) {
      console.error("Order submission failed:", orderError);
        setOrderData(prev => ({
          ...prev,
          error: "Order submission failed. See details below.",
          errorDetails: orderError
        }));
        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        setOrderData(prev => ({
          ...prev,
          error: null,
          errorDetails: null
        }));
      alert("Order submitted successfully");
      navigate('/')
      }
    } catch (error) {
      console.error("Error during order submission:", error);
      setOrderData(prev => ({
        ...prev,
        error: `Order submission error: ${error.message}`,
        errorDetails: error
      }));
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const stepInc = () => {
    if (step < 5) {  // Updated to account for the new step
      // Save current state to localStorage for recovery
      try {
        localStorage.setItem('orderState', JSON.stringify(orderData));
        console.log('Saved order state to localStorage:', orderData);
      } catch (error) {
        console.error('Error saving order state:', error);
      }
      
      setStep(step + 1);
    }
  };

  const stepDec = () => {
    if (step > 1) {
      // Save current state to localStorage for recovery
      try {
        localStorage.setItem('orderState', JSON.stringify(orderData));
        console.log('Saved order state to localStorage:', orderData);
      } catch (error) {
        console.error('Error saving order state:', error);
      }
      
      setStep(step - 1);
    }
  };
  
  // Recover saved state from localStorage on component mount
  useEffect(() => {
    try {
      const savedOrderState = localStorage.getItem('orderState');
      
      if (savedOrderState) {
        const parsedState = JSON.parse(savedOrderState);
        
        // Only update if we have valid saved state
        if (parsedState && typeof parsedState === 'object') {
          console.log('Recovered saved order state:', parsedState);
          setOrderData(prevState => ({
            ...prevState,
            ...parsedState,
            // Ensure these properties are always present
            customerInfo: {
              ...(prevState.customerInfo || {}),
              ...(parsedState.customerInfo || {})
            },
            fullAddress: {
              ...(prevState.fullAddress || {}),
              ...(parsedState.fullAddress || {})
            },
            productData: {
              ...(prevState.productData || {}),
              ...(parsedState.productData || {})
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error recovering saved order state:', error);
    }
  }, []);

  return (
    <div className={`container mx-auto px-4 py-8 min-h-screen ${isDarkMode ? 'bg-dark-1' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg ${isDarkMode ? 'bg-dark-2' : 'bg-white'}`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create Order</h1>
          
          {/* Error message display */}
          {orderData.error && (
            <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-700'}`}>
              <p className="font-bold">Error submitting order:</p>
              <p className="mt-1">{orderData.error}</p>
              {orderData.errorDetails && (
                <details className="mt-2">
                  <summary className="cursor-pointer">Technical Details</summary>
                  <pre className={`mt-2 p-2 overflow-x-auto rounded ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'}`} style={{ fontSize: '0.8rem' }}>
                    {JSON.stringify(orderData.errorDetails, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          {/* Step indicators */}
          <div className="flex justify-between items-center mt-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= i 
                      ? isDarkMode
                        ? 'bg-secondary text-black' 
                        : 'bg-blue-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i}
                </div>
                {i < 5 && (
                  <div
                    className={`h-1 w-12 sm:w-20 ${
                      step > i 
                        ? isDarkMode
                          ? 'bg-secondary' 
                          : 'bg-blue-600'
                        : isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Step labels */}
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>City</span>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Address</span>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Product</span>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Options</span>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment</span>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <ChooseCity
              orderData={orderData}
              setOrderData={setOrderData}
              stepInc={stepInc}
              isDarkMode={isDarkMode}
            />
          )}
          {step === 2 && (
            <FullAddress
              orderData={orderData}
              setOrderData={setOrderData}
              handleChange={handleChange}
              stepInc={stepInc}
              stepDec={stepDec}
              isDarkMode={isDarkMode}
            />
          )}
          {step === 3 && (
            <SelectProduct
              orderData={orderData}
              setOrderData={setOrderData}
              handleChange={handleChange}
              stepInc={stepInc}
              stepDec={stepDec}
              isDarkMode={isDarkMode}
            />
          )}
          {step === 4 && (
            <SelectOptions
              orderData={orderData}
              setOrderData={setOrderData}
              handleChange={handleChange}
              stepInc={stepInc}
              stepDec={stepDec}
              isDarkMode={isDarkMode}
            />
          )}
          {step === 5 && (
            <OrderPayment
              orderData={orderData}
              setOrderData={setOrderData}
              handleChange={handleChange}
              handleOrderSubmit={handleOrderSubmit}
              stepDec={stepDec}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ChooseCity = ({ stepInc, setOrderData, orderData, isDarkMode }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCitySelection = (city) => {
    // Normalize city to lowercase for consistent matching
    const normalizedCity = city.toLowerCase().trim();
    setOrderData((prevState) => ({
      ...prevState,
      selectedCity: normalizedCity,
      cityDisplayName: city, // Keep original city name for display
    }));
    stepInc();
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        // Fetch cities from businessOnboardForm
        const { data: cityData, error } = await supabase
          .from('businessOnboardForm')
          .select('city');

        if (error) throw error;

        if (cityData && cityData.length > 0) {
          // Process cities to lowercase and remove duplicates
          const processedCities = cityData
            .map(item => item.city ? item.city.toLowerCase().trim() : null)
            .filter(city => city) // Remove null/empty values
            .reduce((unique, city) => {
              // Add city to unique array only if it's not already included
              if (!unique.includes(city)) {
                unique.push(city);
              }
              return unique;
            }, [])
            .sort(); // Sort alphabetically for better UX

          setCities(processedCities);
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Failed to load cities. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Choose Your City
      </h2>
      <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-dark-3' : 'bg-gray-100'}`}>
        <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Please select your city for the best printing service in your area.
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid ${isDarkMode ? 'border-white border-t-transparent' : 'border-blue-600 border-t-transparent'}`} />
        </div>
      ) : error ? (
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900 bg-opacity-20 text-red-300' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => handleCitySelection(city)}
              className={`p-4 rounded-lg transition-colors ${
                orderData.selectedCity === city 
                  ? isDarkMode 
                    ? 'bg-secondary bg-opacity-30 border-secondary' 
                    : 'bg-blue-100 border-blue-600'
                  : isDarkMode 
                    ? 'bg-dark-3 hover:bg-dark-4' 
                    : 'bg-white hover:bg-gray-50 border-gray-200'
              } border flex items-center`}
            >
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {city.charAt(0).toUpperCase() + city.slice(1)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      
      <div className="flex justify-end mt-8">
        <button
          onClick={stepInc}
          disabled={!orderData.selectedCity}
          className={`px-6 py-2 rounded-lg ${
            !orderData.selectedCity
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
};

export default Order;