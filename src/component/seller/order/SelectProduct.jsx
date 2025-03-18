import React, { useState, useEffect } from 'react';
// Import your images here if needed
import { supabase } from '../../../utils/supabase';
import { useNavigate } from 'react-router-dom';

function SelectProduct({ setOrderData, orderData, handleChange, stepDec, stepInc }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null); // For debugging purposes

  // Hardcoded product images - this ensures we always have images for each product type
  const productImages = {
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
  };

  // Fallback images if the main ones fail to load
  const fallbackImages = [
    '/assets/t-shirt.png',
    '/assets/tshirt.png',
    '/assets/hoodie.png',
    '/assets/sweatshirt.png',
    '/images/placeholder.jpg'
  ];

  useEffect(() => {
    const fetchInventoryProducts = async () => {
      setLoading(true);
      try {
        // Check if we have a closest seller ID from the previous step
        if (!orderData.closestSellerId && !orderData.sellerId) {
          setError("No seller information found. Please go back and complete the address step.");
          setLoading(false);
          return;
        }

        // Get the seller ID from the order data
        const sellerId = orderData.closestSellerId || orderData.sellerId;
        console.log("Loading inventory for seller ID:", sellerId);
        
        // Fetch seller information
        const { data: sellerData, error: sellerError } = await supabase
          .from('businessOnboardForm')
          .select('*')
          .eq('id', sellerId)
          .single();
          
        if (sellerError) {
          console.error("Error fetching seller details:", sellerError);
          setError("Could not find seller information. Please try again.");
          setLoading(false);
          return;
        }
        
        if (!sellerData) {
          setError("Seller information not found.");
          setLoading(false);
          return;
        }
        
        setSellerInfo(sellerData);
        console.log("Seller Info:", sellerData);
        
        // First try to fetch by seller_id
        let { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .eq('seller_id', sellerId);
          
        // If no results or error, try with brand_id as fallback
        if ((inventoryError || !inventoryData || inventoryData.length === 0)) {
          console.log("No inventory found with seller_id, trying with brand_id instead");
          const { data: brandInventory, error: brandError } = await supabase
            .from('inventory')
            .select('*')
            .eq('brand_id', sellerId);
            
          if (!brandError && brandInventory && brandInventory.length > 0) {
            inventoryData = brandInventory;
            inventoryError = null;
          }
        }
        
        if (inventoryError) {
          console.error("Error fetching inventory:", inventoryError);
          setError('Failed to load inventory. Please try again.');
          setLoading(false);
          return;
        }
        
        console.log("Inventory data for selected seller:", inventoryData);
        
        // Store the raw inventory data for debugging
        setDebugInfo({
          sellerId,
          rawInventory: inventoryData
        });
        
        if (!inventoryData || inventoryData.length === 0) {
          setError("No inventory found for the selected seller.");
          setLoading(false);
          return;
        }
        
        // Process inventory data to create product list
        const availableProducts = [];
        
        inventoryData.forEach(item => {
          console.log("Processing inventory item:", item);
          
          // Check if the product has any stock
          if (!Array.isArray(item.data)) {
            console.log("Item data is not an array:", item.data);
            return;
          }
          
          let hasStock = false;
          let totalStock = 0;
          
          item.data.forEach(colorRow => {
            if (colorRow && typeof colorRow === 'object') {
              Object.keys(colorRow).forEach(key => {
                if (key !== 'color' && key !== 'price' && colorRow[key] > 0) {
                  hasStock = true;
                  totalStock += parseInt(colorRow[key], 10);
                }
              });
            }
          });
          
          console.log(`Product ${item.product_name || 'Unknown'}: hasStock=${hasStock}, totalStock=${totalStock}`);
          
          // Even if no stock is found, still show the product for debugging
          // Remove this condition for production or comment it out if needed
          // if (hasStock) {
            // Get price from the price field if available
            let price = 0;
            if (item.price !== undefined && item.price !== null) {
              price = Number(item.price);
            } else if (item.data && item.data.length > 0 && item.data[0]) {
              // Fallback: check if price is in the color data
              const firstColorData = item.data[0];
              if (firstColorData.price !== undefined) {
                price = Number(firstColorData.price);
              } else {
                // Legacy fallback
                const priceKey = Object.keys(firstColorData).find(key => key !== 'color');
                if (priceKey) {
                  price = firstColorData[priceKey];
                }
              }
            }
            
            // Get the correct image for this product
            const productName = item.product_name || "Unknown Product";
            const imageUrl = productImages[productName] || 
                            productImages[productName.toLowerCase()] || 
                            `/images/${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
            
            availableProducts.push({
              id: item.id,
              name: productName,
              base_price: price || 0,
              price: price || 0,
              image_url: imageUrl,
              inventory_id: item.id,
              inventory_data: item.data,
              seller_id: sellerId,
              inStock: hasStock,
              totalStock: totalStock
            });
          // }
        });
        
        console.log("Available products from closest seller:", availableProducts);
        setProducts(availableProducts);

        // Update order data with seller information
        setOrderData(prev => ({
          ...prev,
          sellerId: sellerId,
          sellerName: sellerData.business_name || 'Unknown Seller'
        }));
      } catch (error) {
        console.error('Error fetching inventory products:', error);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventoryProducts();
  }, [orderData.closestSellerId, orderData.sellerId, setOrderData]);

  const imgStyle = 'w-full h-32 object-contain';
  const divImgStyle =
    'w-[200px] rounded-lg bg-dark-3 p-5 m-2 hover:opacity-85 transition-opacity duration-200 relative';
  const bImg = 'text-sm';

  const handleProductSelection = (product) => {
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
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Number(amount).toFixed(2)}`;
  };

  // Handle image loading errors by trying fallback images
  const handleImageError = (e, index) => {
    // Try the next fallback image
    if (index < fallbackImages.length) {
      e.target.src = fallbackImages[index];
      e.target.onerror = (e) => handleImageError(e, index + 1);
    } else {
      // If all fallbacks fail, use a data URI for a simple placeholder
      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23cccccc'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' alignment-baseline='middle' fill='%23666666'%3ENo Image%3C/text%3E%3C/svg%3E";
      e.target.onerror = null;
    }
  };

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
              {/* {sellerInfo.businessName || 'Unknown'} -  */}
              {sellerInfo.city ? sellerInfo.city.charAt(0).toUpperCase() + sellerInfo.city.slice(1).toLowerCase() : 'Unknown Location'}
            </p>
            {orderData.coordinates && sellerInfo.coordinates && (
              <p className="text-xs text-gray-400 mt-1">
                Distance: {calculateDistance(
                  orderData.coordinates.lat,
                  orderData.coordinates.lng,
                  sellerInfo.coordinates.lat,
                  sellerInfo.coordinates.lng
                ).toFixed(2)} km
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
                  className={divImgStyle + " cursor-pointer"}
                >
                  {/* <img
                    className={imgStyle}
                    src={item.image_url}
                    alt={item.name}
                    onError={(e) => handleImageError(e, 0)}
                  /> */}
                  <br />
                  <b className={bImg}>{item.name}</b>
                  <br />
                  <b className={bImg + " text-secondary"}>Price: {formatCurrency(item.price)}</b>
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

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

export default SelectProduct;
