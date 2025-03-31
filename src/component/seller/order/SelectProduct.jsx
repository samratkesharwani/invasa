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

function SelectProduct({ setOrderData, orderData, handleChange, stepDec, stepInc }) {
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

  // Format currency - pure function
  const formatCurrency = (amount) => {
    return `₹${Number(amount).toFixed(2)}`;
  };

  // Handle image loading errors by trying fallback images
  const handleImageError = useCallback((e, index) => {
    // Try the next fallback image
    if (index < fallbackImages.length) {
      e.target.src = fallbackImages[index];
      e.target.onerror = (e) => handleImageError(e, index + 1);
    } else {
      // If all fallbacks fail, use a data URI for a simple placeholder
      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23cccccc'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' alignment-baseline='middle' fill='%23666666'%3ENo Image%3C/text%3E%3C/svg%3E";
      e.target.onerror = null;
    }
  }, [fallbackImages]);

  // CSS styles as constants
  const styles = useMemo(() => ({
    imgStyle: 'w-full h-32 object-contain',
    divImgStyle: 'w-[200px] rounded-lg bg-dark-3 p-5 m-2 hover:opacity-85 transition-opacity duration-200 relative',
    bImg: 'text-sm'
  }), []);

  return (
    <>
      <div className="m-4 pb-5 rounded-lg dark:bg-dark-2">
        <div className="container flex items-center justify-evenly w-full">
          <h1 className="text-white text-lg text-center mt-10 mb-10 w-full">
            Select Products
          </h1>
        </div>
        
        {sellerInfo && (
          <div className="bg-gray-900 dark:bg-dark-1 text-white px-4 py-3 rounded mx-10 mb-6">
            <h2 className="text-lg font-medium">Selected Seller</h2>
            <p className="text-sm text-gray-400">
              {orderData.cityDisplayName ? orderData.cityDisplayName.charAt(0).toUpperCase() + orderData.cityDisplayName.slice(1).toLowerCase() : 
               sellerInfo.city ? sellerInfo.city.charAt(0).toUpperCase() + sellerInfo.city.slice(1).toLowerCase() : 
               'Unknown Location'}
            </p>
            {orderData.coordinates && sellerInfo.coordinates && (
              <p className="text-xs text-gray-400 mt-1">
                Distance: <span className={sellerInfo.distance <= 5 ? "text-green-400" : ""}>{sellerInfo.distance.toFixed(2)} km</span>
                <span className="text-xs text-gray-500 ml-2">(Max allowed: {orderData.maxDistance || 10} km)</span>
              </p>
            )}
          </div>
        )}
        
        {error && (
          <div className="bg-gray-900 dark:bg-dark-1 border border-red-500 text-red-400 px-4 py-3 rounded relative mb-6 mx-10" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="text-white text-center flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mr-3"></div>
            <span>Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-white text-center p-10">
            <h2 className="text-xl font-bold mb-4">No Products Available</h2>
            <p className="mb-6">The selected seller doesn't have any inventory items available.</p>
            
            <button 
              onClick={stepDec}
              className="bg-secondary hover:bg-[#0BB489] text-white font-medium py-2 px-4 rounded mr-2"
            >
              Go Back
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded ml-2"
            >
              Return to Home
            </button>
          </div>
        ) : (
          <div className="grid place-items-center">
            <div className="flex items-center justify-evenly flex-wrap">
              {products.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleProductSelection(item)}
                  className={styles.divImgStyle + " cursor-pointer"}
                >
                  {/* <img
                    className={styles.imgStyle}
                    src={item.image_url}
                    alt={item.name}
                    onError={(e) => handleImageError(e, 0)}
                  /> */}
                  <br />
                  <b className={styles.bImg}>{item.name}</b>
                  <br />
                  <b className={styles.bImg + " text-secondary"}>Price: {formatCurrency(item.price)}</b>
                  <br />
                  <span className={item.inStock ? "text-xs text-green-400" : "text-xs text-red-400"}>
                    {item.inStock ? `In Stock: ${item.totalStock}` : "Out of Stock"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* {debugInfo && process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-900 dark:bg-dark-1 text-white text-xs mt-8 p-4 mx-10 rounded overflow-auto" style={{maxHeight: '200px'}}>
            <h3 className="font-bold mb-2">Debug Information:</h3>
            <p>Seller ID: {debugInfo.sellerId}</p>
            <p>Raw Inventory Count: {debugInfo.rawInventory?.length || 0}</p>
            <p>Products Count: {products.length}</p>
          </div>
        )} */}
        
        <div className="flex justify-center mt-6">
          <button
            onClick={stepDec}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded mr-4"
          >
            Back
          </button>
        </div>
      </div>
    </>
  );
}

export default SelectProduct;