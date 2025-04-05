import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Import your images here if needed
import { supabase } from '../../../utils/supabase';
import { useNavigate } from 'react-router-dom';

// Calculate distance function for reuse across components
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

function SelectProduct({ setOrderData, orderData, handleChange, stepDec, stepInc, isDarkMode = false }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null); // For debugging purposes

  // Hardcoded product images - this ensures we always have images for each product type
  const productImages = useMemo(() => ({
    'T-shirt': '/images/t-shirt.jpg',
    'Oversize T-shirt': '/images/oversize-t-shirt.jpg',
    'Hoodie': '/images/hoodie.jpg',
    'Oversize Hoodie': '/images/oversize-hoodie.jpg',
    'Sweatshirt': '/images/sweatshirt.jpg',
    // Fallbacks with alternative naming
    't-shirt': '/images/t-shirt.jpg',
    'oversize t-shirt': '/images/oversize-t-shirt.jpg',
    'hoodie': '/images/hoodie.jpg',
    'oversize hoodie': '/images/oversize-hoodie.jpg',
    'sweatshirt': '/images/sweatshirt.jpg',
  }), []);

  // Fallback images if the main ones fail to load
  const fallbackImages = useMemo(() => [
    '/assets/t-shirt.png',
    '/assets/tshirt.png',
    '/assets/hoodie.png',
    '/assets/sweatshirt.png',
    '/images/placeholder.jpg'
  ], []);

  useEffect(() => {
    const fetchInventoryProducts = async () => {
      setLoading(true);
      try {
        // Check if we have available sellers from the previous step
        if (!orderData.availableSellers || orderData.availableSellers.length === 0) {
          setError("No seller information found. Please go back and complete the address step.");
          setLoading(false);
          return;
        }

        // Get the first available seller (closest one due to sorting)
        const seller = orderData.availableSellers[0];
        console.log("Selected seller:", seller);
        
        if (!seller) {
          setError("Seller information not found.");
          setLoading(false);
          return;
        }
        
        // Verify the seller is from the selected city
        const selectedCity = orderData.selectedCity ? orderData.selectedCity.toLowerCase().trim() : '';
        const sellerCity = seller.city ? seller.city.toLowerCase().trim() : '';
        const displayCity = orderData.cityDisplayName || orderData.selectedCity;
        
        console.log(`Verifying seller city match: Selected city "${selectedCity}", Seller city "${sellerCity}"`);
        
        if (sellerCity !== selectedCity) {
          console.error(`City mismatch: Seller ID ${seller.id} is from ${sellerCity}, not ${selectedCity}`);
          setError(`Error: Seller is not from ${displayCity}. Please go back and try again.`);
          setLoading(false);
          return;
        }
        
        // Verify the seller is within the maximum distance
        const MAX_DISTANCE_KM = orderData.maxDistance || 10;
        if (seller.distance > MAX_DISTANCE_KM) {
          console.error(`Distance exceeds maximum: Seller distance is ${seller.distance.toFixed(2)}km, max allowed is ${MAX_DISTANCE_KM}km`);
          setError(`Error: No sellers available within ${MAX_DISTANCE_KM}km of your location. Please go back and try a different address.`);
          setLoading(false);
          return;
        }
        
        setSellerInfo(seller);
        
        // Log the seller ID we're searching for
        console.log("Searching for inventory with brand_id:", seller.id);
        
        // Fetch inventory using brand_id with explicit logging
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .eq('brand_id', seller.id);

        // Log the raw response
        console.log("Supabase inventory query response:", { data: inventoryData, error: inventoryError });
        
        if (inventoryError) {
          console.error("Error fetching inventory:", inventoryError);
          setError('Failed to load inventory. Please try again.');
          setLoading(false);
          return;
        }
        
        // Check if we have inventory data
        let productsList = [];
        
        if (!inventoryData || inventoryData.length === 0) {
          console.log("No inventory data found. Using hardcoded products for testing.");
          
          // Use hardcoded products as fallback for testing
          productsList = [
            {
              id: '1',
              product_name: 'T-shirt',
              price: 180,
              data: [
                { color: 'White', L: 5, M: 5, XL: 5, XXL: 3 },
                { color: 'Black', L: 1, M: 3, XL: 5, XXL: 5 }
              ]
            },
            {
              id: '2',
              product_name: 'Oversize T-shirt',
              price: 200,
              data: [
                { color: 'Purple', M: 0 }
              ]
            },
            {
              id: '3',
              product_name: 'Hoodie',
              price: 450,
              data: [
                { color: 'Blue', L: 0 }
              ]
            },
            {
              id: '4',
              product_name: 'Sweatshirt',
              price: 350,
              data: [
                { color: 'Blue', S: 0 }
              ]
            }
          ];
        } else {
          productsList = inventoryData;
        }
        
        console.log("Using products list:", productsList);
        
        // Process inventory data to create product list
        const availableProducts = [];
        
        productsList.forEach(item => {
          console.log("Processing inventory item:", item);
          
          try {
            // Ensure data is parsed if it's a string
            let parsedData = item.data;
            if (typeof item.data === 'string') {
              parsedData = JSON.parse(item.data);
            }
            
            if (!Array.isArray(parsedData)) {
              console.log("Item data is not an array:", parsedData);
              return;
            }
            
            let hasStock = false;
            let totalStock = 0;
            
            parsedData.forEach(colorRow => {
              if (colorRow && typeof colorRow === 'object') {
                Object.keys(colorRow).forEach(key => {
                  if (key !== 'color' && key !== 'price' && colorRow[key] > 0) {
                    hasStock = true;
                    totalStock += parseInt(colorRow[key], 10);
                  }
                });
              }
            });
            
            const productName = item.product_name || "Unknown Product";
            console.log(`Processing product: ${productName} with stock: ${totalStock}`);
            
            availableProducts.push({
              id: item.id,
              name: productName,
              base_price: item.price || 0,
              price: item.price || 0,
              image_url: productImages[productName] || 
                         productImages[productName.toLowerCase()] || 
                         `/images/${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
              inventory_id: item.id,
              inventory_data: parsedData,
              seller_id: seller.id,
              inStock: hasStock,
              totalStock: totalStock
            });
          } catch (err) {
            console.error("Error processing inventory item:", err);
          }
        });
        
        console.log("Final processed products:", availableProducts);
        setProducts(availableProducts);

        // Update order data with seller information
        setOrderData(prev => ({
          ...prev,
          sellerId: seller.id
        }));
      } catch (error) {
        console.error('Error fetching inventory products:', error);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventoryProducts();
  }, [orderData.availableSellers, setOrderData]);

  // Handle product selection - memoized for stable reference
  const handleProductSelection = useCallback((product) => {
    setOrderData((prevState) => ({
      ...prevState,
      productData: {
        ...prevState.productData,
        selectedProduct: product.name,
        selectedProductPrice: Number(product.base_price),
        price: Number(product.price),
        inventory_id: product.inventory_id,
        inventory_data: product.inventory_data,
        seller_id: product.seller_id,
        // Reset other selections when product changes
        selectedSize: '',
        selectedGSM: '',
        selectedColor: '',
        quantity: 1, // Default to 1 instead of 0
      },
    }));
    
    console.log("Selected product:", product);
    stepInc(); // Move to next step after selecting a product
  }, [setOrderData, stepInc]);

  // Format currency for display
  const formatCurrency = (amount) => {
    return `₹${Number(amount).toFixed(2)}`;
  };

  return (
    <div className="mx-auto">
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
          Select Product
        </h2>
      </div>
      
      {error && (
        <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-red-900 bg-opacity-20 border border-red-800 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {error}
        </div>
      )}
      
      {sellerInfo && (
        <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-dark-3' : 'bg-blue-50 border border-blue-200'}`}>
          <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-blue-700'}`}>Selected Seller</h3>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{sellerInfo.businessName}</span> 
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}> ({sellerInfo.distance.toFixed(1)} km away)</span>
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid ${isDarkMode ? 'border-white border-t-transparent' : 'border-blue-600 border-t-transparent'}`} />
        </div>
      ) : products.length === 0 ? (
        <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-dark-3' : 'bg-gray-50'}`}>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No products available from this seller.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <div 
              key={product.id}
              onClick={() => handleProductSelection(product)}
              className={`rounded-lg overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                orderData.productData?.selectedProduct === product.name 
                  ? isDarkMode 
                    ? 'ring-2 ring-secondary' 
                    : 'ring-2 ring-blue-500'
                  : isDarkMode 
                    ? 'bg-dark-3' 
                    : 'bg-white border border-gray-200'
              }`}
            >
              <div className="relative pb-[70%]">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="absolute w-full h-full object-cover object-center"
                  onError={(e) => {
                    // Try fallback images in sequence
                    for (let i = 0; i < fallbackImages.length; i++) {
                      if (e.target.src !== fallbackImages[i]) {
                        e.target.src = fallbackImages[i];
                        return;
                      }
                    }
                    // If all fallbacks fail, show a colored placeholder
                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18bd2525b36%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18bd2525b36%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%23373940%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22108.5390625%22%20y%3D%22119.1%22%3E%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                  }}
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {product.totalStock > 0 ? `${product.totalStock} in stock` : 'Out of stock'}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <p className={`font-bold ${isDarkMode ? 'text-secondary' : 'text-blue-600'}`}>
                    {formatCurrency(product.price)}
                  </p>
                  <button 
                    className={`px-3 py-1 rounded-full text-sm ${
                      orderData.productData?.selectedProduct === product.name 
                        ? isDarkMode 
                          ? 'bg-secondary text-black' 
                          : 'bg-blue-600 text-white' 
                        : isDarkMode 
                          ? 'bg-dark-4 text-white' 
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {orderData.productData?.selectedProduct === product.name ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between mt-8">
        <button
          onClick={stepDec}
          className={`px-6 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Back
        </button>
        <button
          onClick={stepInc}
          disabled={!orderData.productData?.selectedProduct}
          className={`px-6 py-2 rounded-lg ${
            !orderData.productData?.selectedProduct
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
}

export default SelectProduct;