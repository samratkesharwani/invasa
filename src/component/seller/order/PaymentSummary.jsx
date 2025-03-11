import React, { useState, useEffect } from 'react';

const PaymentSummary = ({ orderData }) => {
  const [subtotal, setSubtotal] = useState(0);
  const [printingCost, setPrintingCost] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Constants for pricing
  const BASE_PRODUCT_PRICES = {
    'T-Shirt': 15.99,
    'Hoodie': 29.99,
    'Sweatshirt': 24.99,
    // Add other products as needed
  };
  
  const PRINT_COST_PER_SQUARE_INCH = 0.15; // $0.15 per square inch
  const BASE_SHIPPING_COST = 4.99;
  
  // Calculate costs whenever order data changes
  useEffect(() => {
    if (!orderData) return;
    
    // Calculate product base cost
    const productName = orderData.productData?.selectedProduct || '';
    
    // Use price from inventory if available
    let basePrice = 0;
    if (orderData.productData?.price !== undefined) {
      basePrice = Number(orderData.productData.price);
    } else if (orderData.productData?.selectedProductPrice) {
      basePrice = Number(orderData.productData.selectedProductPrice);
    } else {
      // Find the matching product price from defaults
      Object.keys(BASE_PRODUCT_PRICES).forEach(key => {
        if (productName.toLowerCase().includes(key.toLowerCase())) {
          basePrice = BASE_PRODUCT_PRICES[key];
        }
      });
    }
    
    // Calculate quantity cost
    const quantity = orderData.productData?.quantity || 1;
    
    // Size multiplier - larger sizes cost more
    let sizeMultiplier = 1;
    const size = orderData.productData?.selectedSize;
    
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
    
    const productSubtotal = basePrice * sizeMultiplier * quantity;
    setSubtotal(productSubtotal);
    
    // Calculate printing cost based on total print area
    const totalPrintArea = orderData.totalPrintArea || 0;
    const calculatedPrintingCost = totalPrintArea * PRINT_COST_PER_SQUARE_INCH * quantity;
    setPrintingCost(calculatedPrintingCost);
    
    // Calculate shipping (simplified for this example)
    const calculatedShippingCost = BASE_SHIPPING_COST + (quantity > 1 ? (quantity - 1) * 1.5 : 0);
    setShippingCost(calculatedShippingCost);
    
    // Calculate total
    setTotal(productSubtotal + calculatedPrintingCost + calculatedShippingCost);
  }, [orderData]);
  
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
    
    return `${printCount} print${printCount > 1 ? 's' : ''} (${totalArea} sq in total)`;
  };
  
  // Get individual print locations
  const getPrintLocations = () => {
    if (!orderData || !orderData.printData) return [];
    
    return orderData.printData.map(print => {
      const side = print.side.charAt(0).toUpperCase() + print.side.slice(1);
      const area = print.area.toFixed(1);
      return { side, area };
    });
  };
  
  return (
    <div className="bg-dark-3 p-4 rounded-lg">
      <h3 className="text-white mb-4">Order Summary</h3>
      
      {/* Product Information */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">Product:</span>
          <span className="text-white font-medium">
            {orderData?.productData?.selectedProduct || 'No product selected'}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">Color:</span>
          <span className="text-white">
            {orderData?.productData?.selectedColor || 'No color selected'}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">Size:</span>
          <span className="text-white">
            {orderData?.productData?.selectedSize || 'No size selected'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Quantity:</span>
          <span className="text-white">
            {orderData?.productData?.quantity || 1}
          </span>
        </div>
        {orderData?.productData?.price !== undefined && (
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-400">Base Price:</span>
            <span className="text-gray-300">
              {formatCurrency(Number(orderData.productData.price))}
            </span>
          </div>
        )}
      </div>
      
      {/* Print Information */}
      <div className="mb-4 border-t border-gray-700 pt-3">
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">Print Details:</span>
          <span className="text-white">{getPrintDetailsSummary()}</span>
        </div>
        
        {/* Individual Print Locations */}
        {getPrintLocations().length > 0 && (
          <div className="mt-2 pl-4">
            {getPrintLocations().map((print, index) => (
              <div key={index} className="flex justify-between mb-1 text-sm">
                <span className="text-gray-400">{print.side}:</span>
                <span className="text-gray-300">{print.area} sq in</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Print Cost Explanation */}
        {orderData?.totalPrintArea > 0 && (
          <div className="mt-2 text-xs text-gray-400 italic">
            Printing cost: ₹{PRINT_COST_PER_SQUARE_INCH.toFixed(2)} per square inch
          </div>
        )}
      </div>
      
      {/* Cost Breakdown */}
      <div className="border-t border-gray-700 pt-3">
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">Subtotal:</span>
          <span className="text-white">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">Printing:</span>
          <span className="text-white">{formatCurrency(printingCost)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">Shipping:</span>
          <span className="text-white">{formatCurrency(shippingCost)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-700 mt-2">
          <span className="text-white font-medium">Total:</span>
          <span className="text-secondary font-bold text-lg">{formatCurrency(total)}</span>
        </div>
      </div>
      
      {/* Checkout Button */}
      <button 
        className="w-full bg-secondary hover:bg-[#0BB489] text-white py-2 rounded mt-4 transition-colors duration-200"
        disabled={!orderData || !orderData.printData || orderData.printData.length === 0}
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default PaymentSummary; 