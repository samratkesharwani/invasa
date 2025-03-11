import React from 'react';
import { supabase } from '../utils/supabase';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentComponent = ({ amount, handleOrderSubmit, orderDetails, disabled }) => {
  // Safely parse the processedPrints if it's a JSON string
  let parsedPrints = [];
  try {
    if (orderDetails && orderDetails.processedPrints && typeof orderDetails.processedPrints === 'string') {
      parsedPrints = JSON.parse(orderDetails.processedPrints);
    }
  } catch (error) {
    console.error("Error parsing processedPrints:", error);
  }

  // Function to update inventory after successful payment
  const updateInventory = async () => {
    try {
      if (!orderDetails || !orderDetails.productData) {
        console.error("Missing product data for inventory update");
        return;
      }

      const { selectedProduct, selectedSize, selectedColor, quantity, inventory_id } = orderDetails.productData;
      
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

  const handlePayment = async () => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // Log the order details for debugging
      console.log("Payment initiated with amount:", amount);
      
      const response = await fetch('https://backendforinvasa.vercel.app/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amount }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const order = await response.json();

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Replace with your actual Razorpay key id
        amount: order.amount,
        currency: 'INR',
        name: 'Invasa Link',
        description: 'Print on demand order transaction',
        order_id: order.id,
        handler: async function (response) {
          alert('Payment Successful!')
          
          // Update inventory after successful payment
          await updateInventory();
          
          await handleOrderSubmit()  // Call the handleSubmit function passed as a prop
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
    <div>
      <button
        className='bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5'
        onClick={handlePayment}
        disabled={disabled}
      >
        Pay Now
      </button>
    </div>
  );
};

export default PaymentComponent;
