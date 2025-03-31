import React, { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import Button from '../../Button'
import { useNavigate } from "react-router-dom";
import BackButton from "../../element/BackButton";
import FullAddress from "./FullAddress";
import SelectProduct from "./SelectProduct";
import SelectOptions from "./SelectOptions";
import OrderPayment from "./OrderPayment";

const Order = () => {
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

    const { error: orderError } = await supabase.from("orders").insert([
      {
        sellerId: orderData.sellerId,
        brandId: orderData.brandId,
        selectedCity: orderData.selectedCity,
        customerInfo: orderData.customerInfo,
        coordinates: orderData.coordinates,
        fullAddress: orderData.fullAddress,
        productData: updatedProductData, // Use the updated productData with prints and captured designs
        paymentAmount: orderData.paymentAmount,
        transactionId: orderData.transactionId,
        status: orderData.status
      }
    ]);
    

    if (orderError) {
      console.error("Order submission failed:", orderError);
      alert(`Order submission failed: ${orderError.message}`);
    } else {
      alert("Order submitted successfully");
      navigate('/')
    }
  };

  const stepInc = () => {
    setStep(step + 1);
    console.log(step);
  }

  const stepDec = () => {
    setStep(step - 1);
    console.log(step);
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {step === 1 && <ChooseCity setOrderData={setOrderData} orderData={orderData} handleChange={handleChange} stepDec={stepDec} stepInc={stepInc} />}
      {step === 2 && <FullAddress setOrderData={setOrderData} orderData={orderData} handleChange={handleChange} stepDec={stepDec} stepInc={stepInc} />}
      {step === 3 && <SelectProduct setOrderData={setOrderData} orderData={orderData} handleChange={handleChange} stepDec={stepDec} stepInc={stepInc} />}
      {step === 4 && <SelectOptions setOrderData={setOrderData} orderData={orderData} handleChange={handleChange} updatePrintData={updatePrintData} stepDec={stepDec} step={step} setStep={setStep} stepInc={stepInc} />}
      {step === 5 && <OrderPayment handleOrderSubmit={handleOrderSubmit} setOrderData={setOrderData} orderData={orderData} handleChange={handleChange} stepDec={stepDec} step={step} setStep={setStep} stepInc={stepInc} />}
    </div>
  );
};

const ChooseCity = ({ stepInc, setOrderData, orderData }) => {
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
    <div className="container grid place-items-center">
      <div className="flex items-center justify-evenly w-full">
        <BackButton />
        <h1 className="text-white text-lg text-center mt-10 mb-10 w-full">
          Select the city
        </h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : cities.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-400">No cities available from approved sellers</p>
        </div>
      ) : (
        /* City selection buttons */
        <div className="flex flex-wrap items-center justify-center">
          {cities.map((city, index) => (
            <button
              key={index}
              onClick={() => handleCitySelection(city)}
              className="w-[100px] h-[100px] bg-dark-3 p-5 rounded-lg m-4 text-center text-sm text-white hover:bg-[#1F2A37]"
            >
              {/* Display with first letter capitalized */}
              {city.charAt(0).toUpperCase() + city.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Order;