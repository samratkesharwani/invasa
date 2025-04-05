import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../../utils/supabase';
import QRCode from "react-qr-code";
import Payment from '../../../component/Payment';
import ImageUpload from '../../../component/element/ImageUpload';

function OrderPayment({ handleOrderSubmit, setOrderData, orderData, handleChange, stepDec, isDarkMode = false }) {
  const [printingPricePerSqInch, setPrintingPricePerSqInch] = useState(0.75); // Default price is 0.75 per square inch
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPrintPrice, setTotalPrintPrice] = useState(0);
  const [shippingCost, setShippingCost] = useState(150); // Default shipping cost
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [printImages, setPrintImages] = useState([]);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  // Memoize product price calculation
  const productPrice = useMemo(() => {
    // Use price from inventory if available
    if (orderData.productData?.price !== undefined) {
      return Number(orderData.productData.price);
    }
    // Fallback to selectedProductPrice
    return Number(orderData.productData?.selectedProductPrice) || 0;
  }, [orderData.productData]);

  // Get safe print data - memoized for performance
  const safePrintData = useMemo(() => {
    if (!orderData.printData || !Array.isArray(orderData.printData)) return [];
    
    return orderData.printData.map(print => ({
      image: print.image || '',
      area: typeof print.area === 'number' ? print.area : 0,
      position: print.position || 'Front',
      width: typeof print.width === 'number' ? print.width : 0,
      height: typeof print.height === 'number' ? print.height : 0,
      x: typeof print.x === 'number' ? print.x : 0,
      y: typeof print.y === 'number' ? print.y : 0,
      rotation: typeof print.rotation === 'number' ? print.rotation : 0,
      scale: typeof print.scale === 'number' ? print.scale : 1
    }));
  }, [orderData.printData]);

  // Calculate print price based on total print area - converted to useCallback
  const calculatePrintPrice = useCallback(() => {
    if (!orderData || !orderData.printData || orderData.printData.length === 0) {
      return 0;
    }
    
    // If we have a total print area, use that for calculation
    if (orderData.totalPrintArea && orderData.totalPrintArea > 0) {
      return orderData.totalPrintArea * printingPricePerSqInch;
    }
    
    // Fallback: calculate based on individual print areas
    return orderData.printData.reduce((total, print) => {
      const area = print.area || 0;
      return total + (area * printingPricePerSqInch);
    }, 0);
  }, [orderData, printingPricePerSqInch]);

  // Extract numeric price value from string - converted to pure function
  const extractPriceValue = (priceString) => {
    if (!priceString) return null;
    
    // Try to extract a number from the string
    const match = priceString.match(/[+-]?([0-9]*[.])?[0-9]+/);
    return match ? parseFloat(match[0]) : null;
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

  // Update total amount and print price when relevant data changes
  useEffect(() => {
    // Calculate print price first
    const printPrice = calculatePrintPrice();
    setTotalPrintPrice(printPrice);
    
    // Then calculate and set total amount
    const newTotalAmount = productPrice + printPrice + shippingCost;
    setTotalAmount(newTotalAmount);
  }, [calculatePrintPrice, productPrice, shippingCost]);

  // Get print details summary
  const getPrintDetailsSummary = useCallback(() => {
    if (!orderData || !orderData.printData || orderData.printData.length === 0) {
      return "No prints added";
    }
    
    const printCount = orderData.printData.length;
    const totalArea = orderData.totalPrintArea || 0;
    
    return `${printCount} print${printCount > 1 ? 's' : ''} (${totalArea.toFixed(1)} sq in total)`;
  }, [orderData]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Number(amount).toFixed(2)}`;
  };

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

  // Update the processedPrints mapping
  useEffect(() => {
    if (orderData.printData && orderData.printData.length > 0) {
      try {
        const processedPrints = orderData.printData.map(print => ({
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
        }));

        if (setOrderData) {
          setOrderData(prevData => ({
            ...prevData,
            processedPrints,
            safePrintData
          }));
        }
      } catch (error) {
        console.error("Error processing print data:", error);
      }
    }
  }, [orderData.printData, safePrintData, setOrderData]);

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
    }
  };

  // Load Razorpay script - converted to promise-based function
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle direct payment
  const handleDirectPayment = async () => {
    if (!isValid) {
      alert("Please fix the validation errors before proceeding with payment");
      return;
    }

    setIsLoadingPayment(true);

    try {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

      // Create and store the order data
      const safeOrderData = {
        ...orderData,
        paymentAmount: totalAmount,
        printPrice: totalPrintPrice,
        productPrice,
        shippingCost,
        printingPricePerSqInch,
        printData: safePrintData
      };
      
      if (setOrderData) {
        setOrderData(safeOrderData);
      }

      // Create order in Razorpay
      const response = await fetch('https://backendforinvasa.vercel.app/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: totalAmount }),
      });

      if (!response.ok) {
        throw new Error('Payment server error: ' + (await response.text()));
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
          try {
          // Update inventory after successful payment
          await updateInventory();
          
          if (handleOrderSubmit) {
            await handleOrderSubmit();
          }
            alert('Payment Successful!');
          } catch (error) {
            console.error('Error after payment:', error);
            alert('Payment was successful, but there was an error updating our records. Our team will contact you.');
          }
        },
        theme: {
          color: '#0BB489',
        },
        modal: {
          ondismiss: function() {
            setIsLoadingPayment(false);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Payment failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoadingPayment(false);
    }
  };

  return (
    <div className={`${isDarkMode ? 'm-4 pb-5 rounded-lg bg-dark-2' : 'pb-5 rounded-lg bg-white'}`}>
      <div className="flex items-center mb-6">
        <button 
          onClick={stepDec} 
          className={`mr-4 p-2 rounded-full ${isDarkMode ? 'bg-dark-3 hover:bg-dark-4' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Payment Details
        </h2>
      </div>
      
      {validationErrors.length > 0 && (
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-red-900 bg-opacity-20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Please fix the following issues:</h3>
          <ul className={`list-disc list-inside text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className={`mb-8 rounded-lg p-6 ${isDarkMode ? 'bg-dark-3' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order Summary</h3>
        
        <div className="space-y-4">
          {/* Product Details */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-dark-4' : 'bg-white border border-gray-200'}`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Product</h4>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {orderData.productData?.selectedProduct || 'No product selected'} 
                {orderData.productData?.selectedSize ? ` - ${orderData.productData.selectedSize}` : ''}
                {orderData.productData?.selectedColor ? ` (${orderData.productData.selectedColor})` : ''}
                {orderData.productData?.quantity ? ` x${orderData.productData.quantity}` : ''}
              </span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(productPrice)}
              </span>
            </div>
          </div>
          
          {/* Print Details */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-dark-4' : 'bg-white border border-gray-200'}`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Print Designs</h4>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {getPrintDetailsSummary()}
              </span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(totalPrintPrice)}
              </span>
            </div>
            
            {/* Print details breakdown */}
            {orderData.printData && orderData.printData.length > 0 && (
              <div className="mt-2 pl-4 border-l-2 border-gray-700">
                {orderData.printData.map((print, index) => (
                  <div key={index} className="flex justify-between text-sm mt-1">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {print.position || 'Position'} ({print.area ? print.area.toFixed(1) : '0'} sq in)
                    </span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {formatCurrency(print.area * printingPricePerSqInch)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Shipping */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-dark-4' : 'bg-white border border-gray-200'}`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Shipping</h4>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Standard Delivery</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(shippingCost)}
              </span>
            </div>
          </div>
          
          {/* Total */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-dark-4 border border-gray-700' : 'bg-white border-2 border-gray-300'}`}>
            <div className="flex justify-between">
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total</span>
              <span className={`font-bold ${isDarkMode ? 'text-secondary' : 'text-blue-600'}`}>
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Method */}
      <div className={`mb-8 rounded-lg p-6 ${isDarkMode ? 'bg-dark-3' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Method</h3>
        
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-dark-4' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center mb-4">
            <input
              type="radio"
              id="online-payment"
              name="paymentMethod"
              value="online"
              checked={true}
              readOnly
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="online-payment" className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Online Payment
            </label>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="mb-4 sm:mb-0">
              <p className="text-white font-medium">Total Amount</p>
              <p className="text-white text-2xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
            
            <button
              onClick={handleDirectPayment}
              disabled={!isValid || isLoadingPayment}
              className={`px-6 py-3 rounded-lg font-medium ${
                !isValid || isLoadingPayment
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  : 'bg-white text-indigo-700 hover:bg-gray-100'
              } transition-colors duration-200 flex items-center`}
            >
              {isLoadingPayment ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          onClick={stepDec}
          className={`px-6 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default OrderPayment;