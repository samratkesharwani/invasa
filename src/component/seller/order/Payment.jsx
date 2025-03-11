import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import BackButton from '../../../utils/BackButton';
import PaymentSummary from './PaymentSummary';

function Payment({ orderData, setOrderData, stepDec, stepInc, handleChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderSummary, setOrderSummary] = useState({});
  
  // Constants for pricing
  const PRINT_COST_PER_SQUARE_INCH = 0.15; // $0.15 per square inch

  useEffect(() => {
    // Calculate the total amount when component mounts or orderData changes
    calculateTotal();
  }, [orderData]);

  const calculateTotal = () => {
    try {
      if (!orderData || !orderData.productData) {
        setError("Order data is missing. Please go back and select a product.");
        return;
      }

      // Extract product details
      const { selectedProduct, selectedProductPrice, selectedSize, selectedColor, quantity, price } = orderData.productData;
      
      if (!selectedProduct || !selectedSize || !selectedColor || !quantity) {
        setError("Some product details are missing. Please go back and complete your selection.");
        return;
      }

      // Use price from inventory if available, otherwise fall back to selectedProductPrice
      const basePrice = price !== undefined ? Number(price) : Number(selectedProductPrice) || 0;
      
      // Calculate product price
      const productPrice = calculateProduct(basePrice, selectedSize, quantity);
      
      // Calculate print price based on total print area
      const printPrice = calculatePrintPriceByArea(orderData.printData || [], orderData.totalPrintArea);
      
      // Calculate total
      const total = productPrice + printPrice;
      
      // Set the total amount
      setTotalAmount(total);
      
      // Create order summary
      setOrderSummary({
        product: {
          name: selectedProduct,
          size: selectedSize,
          color: selectedColor,
          quantity: quantity,
          basePrice: basePrice,
          price: productPrice
        },
        print: {
          count: orderData.printData?.length || 0,
          totalArea: orderData.totalPrintArea || 0,
          price: printPrice
        },
        total: total
      });
      
      // Clear any previous errors
      setError(null);
      
    } catch (error) {
      console.error("Error calculating total:", error);
      setError("Error calculating total. Please try again.");
    }
  };

  // Calculate product price based on size and quantity
  const calculateProduct = (basePrice, size, quantity) => {
    // Make sure basePrice is a number
    const price = Number(basePrice) || 0;
    
    // Size multiplier - larger sizes cost more
    let sizeMultiplier = 1;
    
    // Only apply size multiplier if size is a valid string
    if (typeof size === 'string') {
      if (size.match(/^XL$/i)) {
        sizeMultiplier = 1.2;
      } else if (size.match(/^XXL$/i)) {
        sizeMultiplier = 1.4;
      } else if (size.match(/^XXXL$/i)) {
        sizeMultiplier = 1.6;
      }
    }
    
    return price * sizeMultiplier * (quantity || 1);
  };

  // Calculate print price based on total print area
  const calculatePrintPriceByArea = (printData, totalPrintArea) => {
    if (!Array.isArray(printData) || printData.length === 0) {
      return 0;
    }
    
    // If we have a total print area, use that for calculation
    if (totalPrintArea && totalPrintArea > 0) {
      return totalPrintArea * PRINT_COST_PER_SQUARE_INCH;
    }
    
    // Fallback: calculate based on individual print areas
    return printData.reduce((total, print) => {
      const area = print.area || 0;
      return total + (area * PRINT_COST_PER_SQUARE_INCH);
    }, 0);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session || !session.user) {
        setError("Authentication error. Please log in again.");
        setLoading(false);
        return;
      }
      
      // Create order object
      const order = {
        user_id: session.user.id,
        product_name: orderData.productData.selectedProduct,
        size: orderData.productData.selectedSize,
        color: orderData.productData.selectedColor,
        quantity: orderData.productData.quantity,
        product_price: orderData.productData.price || orderData.productData.selectedProductPrice,
        print_data: orderData.printData,
        total_print_area: orderData.totalPrintArea || 0,
        total_amount: totalAmount,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      // Insert order into database
      const { data, error: orderError } = await supabase
        .from('orders')
        .insert([order])
        .select();
        
      if (orderError) {
        throw orderError;
      }
      
      // Update inventory (reduce stock)
      await updateInventory();
      
      // Move to success step
      stepInc();
      
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async () => {
    try {
      const { selectedSize, selectedColor, quantity, inventory_id } = orderData.productData;
      
      if (!inventory_id || !selectedSize || !selectedColor || !quantity) {
        throw new Error("Missing inventory data");
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
        throw new Error("Color not found in inventory");
      }
      
      // Update the quantity
      const currentStock = updatedData[colorIndex][selectedSize] || 0;
      updatedData[colorIndex][selectedSize] = Math.max(0, currentStock - quantity);
      
      // Update inventory in database
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ data: updatedData })
        .eq('id', inventory_id);
        
      if (updateError) {
        throw updateError;
      }
      
    } catch (error) {
      console.error("Error updating inventory:", error);
      // Don't throw error here, just log it
      // We don't want to prevent order placement if inventory update fails
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Get individual print locations with areas
  const getPrintLocations = () => {
    if (!orderData || !orderData.printData) return [];
    
    return orderData.printData.map(print => {
      const side = print.side.charAt(0).toUpperCase() + print.side.slice(1);
      const area = print.area ? print.area.toFixed(1) : '0.0';
      return { side, area };
    });
  };

  return (
    <div className="m-4 pb-5 rounded-lg dark:bg-dark-2">
      <div className="container flex items-center justify-evenly w-full">
        <h1 className="text-white text-lg text-center mt-10 mb-10 w-full">
          Payment
        </h1>
      </div>
      
      {error && (
        <div className="bg-gray-900 dark:bg-dark-1 border border-red-500 text-red-400 px-4 py-3 rounded relative mb-6 mx-10" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto bg-dark-3 p-6 rounded-lg">
        <h2 className="text-white text-xl mb-6">Order Summary</h2>
        
        {/* Product Details */}
        <div className="mb-6 border-b border-gray-700 pb-4">
          <h3 className="text-white text-lg mb-2">Product</h3>
          <div className="flex justify-between text-gray-300">
            <span>
              {orderData.productData?.selectedProduct || 'Product'} - {orderData.productData?.selectedSize || 'Size'}, {orderData.productData?.selectedColor || 'Color'} (x{orderData.productData?.quantity || 0})
            </span>
            <span>${orderSummary.product?.price?.toFixed(2) || '0.00'}</span>
          </div>
          {orderSummary.product?.basePrice > 0 && (
            <div className="text-xs text-gray-400 italic mt-1">
              Base price: ${orderSummary.product?.basePrice.toFixed(2)} {orderData.productData?.selectedSize !== 'M' && orderData.productData?.selectedSize !== 'S' ? `(${orderData.productData?.selectedSize} size has additional cost)` : ''}
            </div>
          )}
        </div>
        
        {/* Print Details */}
        <div className="mb-6 border-b border-gray-700 pb-4">
          <h3 className="text-white text-lg mb-2">Print Design</h3>
          <div className="flex justify-between text-gray-300 mb-2">
            <span>
              {orderSummary.print?.count || 0} Print Design{orderSummary.print?.count !== 1 ? 's' : ''}
              {orderSummary.print?.totalArea > 0 ? ` (${orderSummary.print.totalArea.toFixed(1)} sq in total)` : ''}
            </span>
            <span>${orderSummary.print?.price?.toFixed(2) || '0.00'}</span>
          </div>
          
          {/* Individual Print Locations */}
          {getPrintLocations().length > 0 && (
            <div className="pl-4 text-sm">
              {getPrintLocations().map((print, index) => (
                <div key={index} className="flex justify-between mb-1">
                  <span className="text-gray-400">{print.side}:</span>
                  <span className="text-gray-300">{print.area} sq in</span>
                </div>
              ))}
              
              {/* Print Cost Explanation */}
              <div className="mt-2 text-xs text-gray-400 italic">
                Printing cost: ₹{PRINT_COST_PER_SQUARE_INCH.toFixed(2)} per square inch
              </div>
            </div>
          )}
        </div>
        
        {/* Total */}
        <div className="mb-6">
          <div className="flex justify-between text-white text-xl">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Payment Method */}
        <div className="mb-6">
          <h3 className="text-white text-lg mb-2">Payment Method</h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center">
              <input
                type="radio"
                id="cash"
                name="paymentMethod"
                value="cash"
                checked
                className="mr-2"
                readOnly
              />
              <label htmlFor="cash" className="text-white">Cash on Delivery</label>
            </div>
          </div>
        </div>
        
        {/* Place Order Button */}
        <div className="flex justify-center">
          <button
            onClick={handlePlaceOrder}
            disabled={loading || !orderData.printData || orderData.printData.length === 0}
            className={`${
              loading || !orderData.printData || orderData.printData.length === 0
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-secondary hover:bg-[#0BB489]'
            } text-white font-medium py-3 px-6 rounded-lg w-full max-w-xs transition-colors duration-200`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Processing...
              </span>
            ) : !orderData.printData || orderData.printData.length === 0 ? (
              'Add Print Design to Continue'
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </div>
      
      <div className="flex justify-between mt-10 mx-10">
        <BackButton onClick={stepDec} />
      </div>
    </div>
  );
}

export default Payment;
