import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
          <span className="text-white">{formatCurrency(productPrice)}</span>
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
        {safePrintData.length > 0 && (
          <div className="mt-6 border-t border-gray-700 pt-4">
            <h4 className="text-white font-medium mb-4">Print Designs</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safePrintData.map((print, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="relative pb-2">
                    <img
                      src={print.image}
                      alt={`Print ${index + 1}`}
                      className="w-full h-48 object-contain rounded-lg mb-2"
                      loading="lazy"
                    />
                    <div className="absolute top-1 right-1 bg-gray-900 text-xs text-white px-2 py-1 rounded-full">
                      {print.position || 'Front'}
                    </div>
                  </div>
                  <div className="text-white text-xs space-y-1">
                    <div className="grid grid-cols-2 gap-1">
                      <p>Area:</p>
                      <p>{print.area.toFixed(2)} sq in</p>
                      
                      <p>Size:</p>
                      <p>{print.width.toFixed(0)}×{print.height.toFixed(0)}</p>
                      
                      <p>Position:</p>
                      <p>X: {print.x.toFixed(0)}, Y: {print.y.toFixed(0)}</p>
                      
                      <p>Rotation:</p>
                      <p>{print.rotation.toFixed(0)}°</p>
                      
                      <p>Scale:</p>
                      <p>{print.scale.toFixed(2)}×</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Direct Payment Button */}
      <div className="mt-6 mb-10">
        <button
          className='bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-700 disabled:border-gray-700 disabled:text-gray-400'
          onClick={handleDirectPayment}
          disabled={!isValid || isLoadingPayment}
        >
          {isLoadingPayment ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
  );
}

export default OrderPayment;