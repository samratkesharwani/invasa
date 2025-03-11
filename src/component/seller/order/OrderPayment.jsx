import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import QRCode from "react-qr-code";
import Payment from '../../../component/Payment';
import ImageUpload from '../../../components/ImageUpload';

function OrderPayment({ handleOrderSubmit, setOrderData, orderData, handleChange }) {
  const [printingPricePerSqInch, setPrintingPricePerSqInch] = useState(0.75); // Default price is 0.75 per square inch
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPrintPrice, setTotalPrintPrice] = useState(0);
  const [shippingCost, setShippingCost] = useState(150); // Default shipping cost
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [printImages, setPrintImages] = useState([]);

  // Calculate print price based on total print area
  const calculatePrintPrice = () => {
    if (!orderData || !orderData.printData || orderData.printData.length === 0) {
      return 0;
    }
    
    // If we have a total print area, use that for calculation
    if (orderData.totalPrintArea && orderData.totalPrintArea > 0) {
      const printPrice = orderData.totalPrintArea * printingPricePerSqInch;
      return printPrice;
    }
    
    // Fallback: calculate based on individual print areas
    return orderData.printData.reduce((total, print) => {
      const area = print.area || 0;
      return total + (area * printingPricePerSqInch);
    }, 0);
  };

  // Calculate total amount
  const calculateAmount = () => {
    // Get product price first
    const productPrice = getProductPrice();
    
    // Calculate print price
    const printPrice = calculatePrintPrice();
    
    // Update total print price state
    setTotalPrintPrice(printPrice);
    
    // Then calculate total amount using all components
    const total = productPrice + printPrice + shippingCost;
    return total;
  };

  // Fetch pricing from seller settings
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        if (!orderData.sellerId) return;
        
        // Fetch the printingPrice from businessOnboardForm
        const { data: sellerData, error: sellerError } = await supabase
          .from('businessOnboardForm')
          .select('printingPrice')
          .eq('id', orderData.sellerId)
          .single();

        if (sellerError) {
          console.log("Error fetching seller data:", sellerError);
          return; // Use default price if there's an error
        }
        
        // Extract the numeric value from the printingPrice string
        if (sellerData && sellerData.printingPrice) {
          const numericPrice = extractPriceValue(sellerData.printingPrice);
          if (numericPrice !== null) {
            console.log("Extracted price per square inch:", numericPrice);
            setPrintingPricePerSqInch(numericPrice);
          }
        }
      } catch (err) {
        console.log("Error in fetchPricing:", err);
      }
    };

    fetchPricing();
  }, [orderData.sellerId]);

  // Extract numeric price value from string (e.g., "0.75 paise")
  const extractPriceValue = (priceString) => {
    if (!priceString) return null;
    
    // Try to extract a number from the string
    const match = priceString.match(/[+-]?([0-9]*[.])?[0-9]+/);
    if (match) {
      return parseFloat(match[0]);
    }
    return null;
  };

  // Get product price display
  const getProductPrice = () => {
    // Use price from inventory if available
    if (orderData.productData?.price !== undefined) {
      return Number(orderData.productData.price);
    }
    // Fallback to selectedProductPrice
    return Number(orderData.productData?.selectedProductPrice) || 0;
  };

  // Update total amount and print price when relevant data changes
  useEffect(() => {
    // Calculate print price first
    const printPrice = calculatePrintPrice();
    setTotalPrintPrice(printPrice);
    
    // Then calculate and set total amount
    const newTotalAmount = calculateAmount();
    setTotalAmount(newTotalAmount);
  }, [orderData, printingPricePerSqInch, shippingCost, orderData.totalPrintArea, orderData.printData]);

  // Add a useEffect to log changes in print price calculation
  useEffect(() => {
    console.log('Print Price Calculation:', {
      printingPricePerSqInch,
      totalPrintArea: orderData.totalPrintArea,
      printData: orderData.printData,
      calculatedPrice: calculatePrintPrice(),
      totalPrintPrice
    });
  }, [printingPricePerSqInch, orderData.totalPrintArea, orderData.printData, totalPrintPrice]);

  // Validate order data
  useEffect(() => {
    const errors = [];
    
    // Check product data
    if (!orderData.productData) {
      errors.push("Product information is missing");
    } else {
      if (!orderData.productData.selectedProduct) {
        errors.push("Please select a product");
      }
      if (!orderData.productData.selectedSize) {
        errors.push("Please select a size");
      }
      if (!orderData.productData.selectedColor) {
        errors.push("Please select a color");
      }
      if (!orderData.productData.quantity || orderData.productData.quantity < 1) {
        errors.push("Please specify a valid quantity");
      }
    }
    
    // Check print data
    if (!orderData.printData || orderData.printData.length === 0) {
      errors.push("Please add at least one print design");
    } else {
      // Check if each print has valid data
      orderData.printData.forEach((print, index) => {
        if (!print.image) {
          errors.push(`Print design ${index + 1} is missing an image`);
        }
        if (!print.area || print.area <= 0) {
          errors.push(`Print design ${index + 1} has an invalid print area`);
        }
      });
    }
    
    // Check if total amount is valid
    if (totalAmount <= 0) {
      errors.push("Total amount must be greater than zero");
    }
    
    setValidationErrors(errors);
    setIsValid(errors.length === 0);
    
  }, [orderData, totalAmount]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Get print details summary
  const getPrintDetailsSummary = () => {
    if (!orderData || !orderData.printData || orderData.printData.length === 0) {
      return "No prints added";
    }
    
    const printCount = orderData.printData.length;
    const totalArea = orderData.totalPrintArea || 0;
    const calculatedPrice = calculatePrintPrice();
    
    console.log('Print Details:', {
      printCount,
      totalArea,
      pricePerSqInch: printingPricePerSqInch,
      calculatedPrice
    });
    
    return `${printCount} print${printCount > 1 ? 's' : ''} (${totalArea.toFixed(1)} sq in total)`;
  };

  // Validate print price calculation
  const validatePrintPrice = () => {
    const calculatedPrice = calculatePrintPrice();
    if (calculatedPrice !== totalPrintPrice) {
      console.warn('Print price mismatch:', {
        calculated: calculatedPrice,
        current: totalPrintPrice
      });
      setTotalPrintPrice(calculatedPrice);
    }
  };

  // Add validation to the useEffect
  useEffect(() => {
    validatePrintPrice();
  }, [orderData.printData, orderData.totalPrintArea, printingPricePerSqInch]);

  // Handle order submission for payment
  const handlePaymentOrderSubmit = async () => {
    // Validate again before submission
    if (!isValid) {
      alert("Please fix the validation errors before proceeding with payment");
      return;
    }
    
    try {
      // Create a safe version of the order data with all objects stringified
      const safeOrderData = {
        ...orderData,
        paymentAmount: totalAmount,
        printPrice: totalPrintPrice,
        productPrice: getProductPrice(),
        shippingCost: shippingCost,
        printingPricePerSqInch: printingPricePerSqInch,
        // Use the safe print data we've already processed
        printData: safePrintData,
        // Ensure processedPrints is properly formatted
        processedPrints: orderData.processedPrints || []
      };
      
      // Store order details in orderData before submitting
      if (setOrderData) {
        setOrderData(safeOrderData);
      }
      
      // Call the parent's handleOrderSubmit function
      if (handleOrderSubmit) {
        await handleOrderSubmit();
      }
    } catch (error) {
      console.error("Error in handlePaymentOrderSubmit:", error);
      alert("An error occurred while processing your order. Please try again.");
    }
  };

  // Add this function to handle image upload completion
  const handleImageUpload = (imageUrl) => {
    setPrintImages(prev => [...prev, {
      imageUrl,
      area: orderData.totalPrintArea || 0,
      position: 'Front', // You might want to make this dynamic
    }]);

    // Update order data with the new print image
    if (setOrderData) {
      setOrderData({
        ...orderData,
        printImages: [...printImages, {
          imageUrl,
          area: orderData.totalPrintArea || 0,
          position: 'Front',
        }],
      });
    }
  };

  // Update the processedPrints mapping
  useEffect(() => {
    if (orderData.printData && orderData.printData.length > 0) {
      try {
        const processedPrints = orderData.printData.map(print => {
          // Ensure all properties are primitive values, not objects
          return {
            imageUrl: String(print.image || ''),
            area: typeof print.area === 'number' ? Number(print.area) : 0,
            position: String(print.position || 'Front'),
            designDetails: {
              width: typeof print.width === 'number' ? String(print.width) : '0',
              height: typeof print.height === 'number' ? String(print.height) : '0',
              x: typeof print.x === 'number' ? String(print.x) : '0',
              y: typeof print.y === 'number' ? String(print.y) : '0',
              rotation: typeof print.rotation === 'number' ? String(print.rotation) : '0',
              scale: typeof print.scale === 'number' ? String(print.scale) : '1'
            }
          };
        });

        if (setOrderData) {
          setOrderData(prevData => ({
            ...prevData,
            processedPrints: processedPrints,
            // Also store the safe print data
            safePrintData: getSafePrintData()
          }));
        }
      } catch (error) {
        console.error("Error processing print data:", error);
      }
    }
  }, [orderData.printData]);

  // Add a debug function to safely stringify objects
  const safeStringify = (obj) => {
    try {
      if (obj === null || obj === undefined) return 'null';
      if (typeof obj === 'string') return obj;
      if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
      if (typeof obj === 'object') {
        // Handle special cases
        if (obj.x !== undefined && obj.y !== undefined) {
          return `X: ${obj.x}, Y: ${obj.y}`;
        }
        return JSON.stringify(obj);
      }
      return String(obj);
    } catch (e) {
      return 'Error stringifying object';
    }
  };

  // Process print data to ensure all values are safe for rendering
  const getSafePrintData = () => {
    if (!orderData.printData || !Array.isArray(orderData.printData)) return [];
    
    return orderData.printData.map(print => {
      // Create a new object with safe values
      return {
        image: print.image || '',
        area: typeof print.area === 'number' ? print.area : 0,
        position: print.position || 'Front',
        width: typeof print.width === 'number' ? print.width : 0,
        height: typeof print.height === 'number' ? print.height : 0,
        x: typeof print.x === 'number' ? print.x : 0,
        y: typeof print.y === 'number' ? print.y : 0,
        rotation: typeof print.rotation === 'number' ? print.rotation : 0,
        scale: typeof print.scale === 'number' ? print.scale : 1
      };
    });
  };

  // Get safe print data
  const safePrintData = getSafePrintData();

  // Add debug logging for print data
  useEffect(() => {
    if (orderData.printData && orderData.printData.length > 0) {
      try {
        // Log the first print object to see its structure
        const firstPrint = orderData.printData[0];
        console.log('Print data structure:', {
          keys: Object.keys(firstPrint),
          types: Object.entries(firstPrint).reduce((acc, [key, value]) => {
            acc[key] = typeof value;
            return acc;
          }, {})
        });
        
        // Check for nested objects that might cause rendering issues
        Object.entries(firstPrint).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            console.log(`Found nested object in print.${key}:`, value);
          }
        });
      } catch (error) {
        console.error("Error in debug logging:", error);
      }
    }
  }, [orderData.printData]);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Function to update inventory after successful payment
  const updateInventory = async () => {
    try {
      if (!orderData || !orderData.productData) {
        console.error("Missing product data for inventory update");
        return;
      }

      const { selectedProduct, selectedSize, selectedColor, quantity, inventory_id } = orderData.productData;
      
      if (!inventory_id || !selectedSize || !selectedColor || !quantity) {
        console.error("Missing required inventory data");
        return;
      }
      
      // Get current inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', inventory_id)
        .single();
        
      if (inventoryError) {
        throw inventoryError;
      }
      
      // Find the color row
      const updatedData = [...inventoryData.data];
      const colorIndex = updatedData.findIndex(item => item.color === selectedColor);
      
      if (colorIndex === -1) {
        throw new Error(`Color ${selectedColor} not found in inventory`);
      }
      
      // Update the quantity
      const currentStock = updatedData[colorIndex][selectedSize] || 0;
      const newStock = Math.max(0, currentStock - quantity);
      updatedData[colorIndex][selectedSize] = newStock;
      
      console.log(`Updating inventory: ${selectedProduct} ${selectedColor} ${selectedSize} from ${currentStock} to ${newStock}`);
      
      // Update inventory in database
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ data: updatedData })
        .eq('id', inventory_id);
        
      if (updateError) {
        throw updateError;
      }
      
      console.log("Inventory updated successfully");
      
    } catch (error) {
      console.error("Error updating inventory:", error);
      // Don't throw error here, just log it
      // We don't want to prevent order completion if inventory update fails
    }
  };

  // Handle direct payment
  const handleDirectPayment = async () => {
    if (!isValid) {
      alert("Please fix the validation errors before proceeding with payment");
      return;
    }

    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // Create a safe version of the order data
      const safeOrderData = {
        ...orderData,
        paymentAmount: totalAmount,
        printPrice: totalPrintPrice,
        productPrice: getProductPrice(),
        shippingCost: shippingCost,
        printingPricePerSqInch: printingPricePerSqInch,
        printData: safePrintData
      };
      
      // Store order details in orderData before submitting
      if (setOrderData) {
        setOrderData(safeOrderData);
      }

      const response = await fetch('https://backendforinvasa.vercel.app/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: calculateAmount() }), // Use actual amount instead of 1 rupee
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const order = await response.json();

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'Invasa Link',
        description: 'Print on demand order transaction',
        order_id: order.id,
        handler: async function (response) {
          alert('Payment Successful!')
          
          // Update inventory after successful payment
          await updateInventory();
          
          if (handleOrderSubmit) {
            await handleOrderSubmit();
          }
          console.log(response);
        },
        theme: {
          color: '#F37254',
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      alert('Oops! Something went wrong.\nPayment Failed');
      console.error('Payment Error:', error);
    }
  };

  return (
    <div className='grid place-items-center'>
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-4 w-full md:w-1/2 lg:w-1/2 bg-red-900 border border-red-500 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Please fix the following issues:</h4>
          <ul className="list-disc pl-5">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-red-200 mb-1">{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mb-4 dark:bg-dark-2 p-4 rounded-lg sm:w-full md:w-1/2 lg:w-1/2 mt-4">
        <h3 className="text-white text-lg mb-4 text-center">Order Summary</h3>
        
        {/* Print Details */}
        <div className="mb-4 border-b border-gray-700 pb-2">
          <div className="flex justify-between items-center p-2">
            <span className="text-white">Print Details:</span>
            <span className="text-white">{getPrintDetailsSummary()}</span>
          </div>
          <div className="flex justify-between items-center p-2">
            <span className="text-white">Printing Price:</span>
            <span className="text-white">{formatCurrency(totalPrintPrice)}</span>
          </div>
          <div className="text-xs text-gray-400 italic pl-2 pb-2">
            Price: {formatCurrency(printingPricePerSqInch)} per square inch × {orderData.totalPrintArea?.toFixed(1) || 0} sq in
          </div>
        </div>
        
        {/* Product and Shipping */}
        <div className="flex justify-between items-center p-2">
          <span className="text-white">Product Price:</span>
          <span className="text-white">{formatCurrency(getProductPrice())}</span>
        </div>
        <div className="flex justify-between items-center p-2 mb-2">
            <span className="text-white">Shipping Charges:</span>
          <span className="text-white">{formatCurrency(shippingCost)}</span>
          </div>
        
        {/* Total */}
          <div className="border-t border-gray-300 my-4"></div>
        <div className="flex justify-between items-center font-bold p-2">
            <span className="text-white">Total Amount:</span>
          <span className="text-white">{formatCurrency(totalAmount)}</span>
        </div>
        
        {/* Order Details */}
        <div className="mt-6 border-t border-gray-700 pt-4">
          <h4 className="text-white font-medium mb-2">Order Details</h4>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">Product:</div>
              <div className="text-white">{orderData.productData?.selectedProduct || 'Not selected'}</div>
              
              <div className="text-gray-400">Size:</div>
              <div className="text-white">{orderData.productData?.selectedSize || 'Not selected'}</div>
              
              <div className="text-gray-400">Color:</div>
              <div className="text-white">{orderData.productData?.selectedColor || 'Not selected'}</div>
              
              <div className="text-gray-400">Quantity:</div>
              <div className="text-white">{orderData.productData?.quantity || 0}</div>
            </div>
          </div>
        </div>

        {/* Print Preview Section */}
        {orderData.printData && orderData.printData.length > 0 && (
          <div className="mt-6 border-t border-gray-700 pt-4">
            <h4 className="text-white font-medium mb-4">Print Designs</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safePrintData.map((print, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <img
                    src={print.image}
                    alt={`Print ${index + 1}`}
                    className="w-full h-48 object-contain rounded-lg mb-2"
                  />
                  <div className="text-white space-y-1">
                    <p>Area: {typeof print.area === 'number' ? `${print.area.toFixed(2)} sq inches` : 'N/A'}</p>
                    <p>Position: {print.position || 'Front'}</p>
                    <p>Size: {typeof print.width === 'number' && typeof print.height === 'number' ? 
                      `${print.width}x${print.height}` : 'N/A'}</p>
                    <p>Coordinates: {typeof print.x === 'number' && typeof print.y === 'number' ? 
                      `X: ${print.x.toFixed(0)}, Y: ${print.y.toFixed(0)}` : 'N/A'}</p>
                    <p>Rotation: {typeof print.rotation === 'number' ? `${print.rotation}°` : 'N/A'}</p>
                    <p>Scale: {typeof print.scale === 'number' ? `${print.scale.toFixed(2)}x` : 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Direct Payment Button */}
      <div className="mt-6">
        <button
          className='bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5'
          onClick={handleDirectPayment}
          disabled={!isValid}
        >
          Pay Now
        </button>
      </div>

      {/* Comment out the Payment component for now */}
      {/* 
      <Payment 
        amount={totalAmount} 
        handleOrderSubmit={handlePaymentOrderSubmit}
        orderDetails={{
          product: String(orderData.productData?.selectedProduct || ''),
          size: String(orderData.productData?.selectedSize || ''),
          color: String(orderData.productData?.selectedColor || ''),
          quantity: String(orderData.productData?.quantity || '0'),
          price: String(getProductPrice()),
          printDetails: getPrintDetailsSummary(),
          printPrice: String(totalPrintPrice),
          shippingCost: String(shippingCost),
          printingPricePerSqInch: String(printingPricePerSqInch),
          processedPrints: '[]'
        }}
        disabled={!isValid}
      />
      */}
    </div>
  );
}

export default OrderPayment;