import React, { useState, useEffect } from 'react';

const ProductOptions = ({ 
  selectedProduct, 
  selectedSize, 
  selectedGSM, 
  selectedColor,
  availableSizes = [],
  availableColors = [],
  availableGSM = ['150', '180', '200', '220', '240', '280'],
  onSizeChange,
  onGSMChange,
  onColorChange,
  onQuantityChange,
  onPriceChange,
  initialPrice = 0
}) => {
  // Define the allowed values (fallback if not provided)
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const allGsmValues = ['150', '180', '200', '220', '240', '280'];
  const allColors = [
    'White', 'Black', 'Navy', 'Red', 'Blue', 
    'Gray', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange'
  ];

  // Use available options if provided, otherwise use all options
  const sizes = availableSizes.length > 0 ? availableSizes : allSizes;
  const colors = availableColors.length > 0 ? availableColors : allColors;
  const gsmValues = availableGSM.length > 0 ? availableGSM : allGsmValues;

  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(initialPrice.toString());

  // Update price when initialPrice changes
  useEffect(() => {
    setPrice(initialPrice.toString());
  }, [initialPrice]);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    onQuantityChange && onQuantityChange(value);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPrice(value);
    onPriceChange && onPriceChange(value);
  };

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">{selectedProduct || 'Product Options'}</h2>
      
      {/* Size Selection */}
      <div className="mb-6">
        <h3 className="text-lg mb-2">Size</h3>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map(size => (
            <button
              key={size}
              type="button"
              onClick={() => onSizeChange && onSizeChange(size)}
              className={`border rounded-md py-2 px-4 text-center ${
                selectedSize === size 
                  ? 'bg-secondary border-secondary text-white' 
                  : 'border-gray-600 text-white hover:border-gray-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      
      {/* GSM Selection */}
      <div className="mb-6">
        <h3 className="text-lg mb-2">GSM</h3>
        <div className="grid grid-cols-3 gap-2">
          {gsmValues.map(gsm => (
            <button
              key={gsm}
              type="button"
              onClick={() => onGSMChange && onGSMChange(gsm)}
              className={`border rounded-md py-2 px-4 text-center ${
                selectedGSM === gsm 
                  ? 'bg-secondary border-secondary text-white' 
                  : 'border-gray-600 text-white hover:border-gray-400'
              }`}
            >
              {gsm}
            </button>
          ))}
        </div>
      </div>
      
      {/* Color Selection */}
      <div className="mb-6">
        <h3 className="text-lg mb-2">Color</h3>
        <div className="grid grid-cols-3 gap-2">
          {colors.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => onColorChange && onColorChange(color)}
              className={`border rounded-md py-2 px-4 text-center ${
                selectedColor === color 
                  ? 'bg-secondary border-secondary text-white' 
                  : 'border-gray-600 text-white hover:border-gray-400'
              }`}
              style={color.toLowerCase() === 'white' ? { color: '#333' } : {}}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      
      {/* Price and Quantity */}
      <div className="mb-4">
        <h3 className="text-lg mb-2">Price per piece</h3>
        <input
          type="number"
          value={price}
          onChange={handlePriceChange}
          placeholder="Price"
          className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white"
        />
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg mb-2">Quantity</h3>
        <input
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          placeholder="Quantity (e.g., 50, 100, 200)"
          className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white"
        />
      </div>
    </div>
  );
};

export default ProductOptions; 