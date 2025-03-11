import React, { useState, useEffect } from 'react';
// Import your images here if needed
import { supabase } from '../../../utils/supabase';
import { useNavigate } from 'react-router-dom';

function SelectProduct({ setOrderData, orderData, handleChange, stepDec, stepInc }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

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
        // Get user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session || !session.user) {
          console.error("No user session found.");
          setError("Authentication error. Please log in again.");
          setLoading(false);
          return;
        }
        
        // Get the current user's ID
        const userId = session.user.id;
        
        // Fetch inventory data for the current user
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .eq('brand_id', userId);
          
        if (inventoryError) {
          throw inventoryError;
        }
        
        console.log("Inventory data for current user:", inventoryData);
        
        if (!inventoryData || inventoryData.length === 0) {
          setError("No inventory found for your account. Please add inventory first.");
          setLoading(false);
          return;
        }
        
        // Process inventory data to create product list
        const availableProducts = [];
        
        inventoryData.forEach(item => {
          // Check if the product has any stock
          if (!Array.isArray(item.data)) return;
          
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
          
          if (hasStock) {
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
            const productName = item.product_name;
            const imageUrl = productImages[productName] || 
                            productImages[productName.toLowerCase()] || 
                            `/images/${productName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
            
            availableProducts.push({
              id: item.id,
              name: productName,
              base_price: price,
              price: price, // Add explicit price field
              image_url: imageUrl,
              inventory_id: item.id,
              inventory_data: item.data,
              inStock: true,
              totalStock: totalStock
            });
          }
        });
        
        console.log("Available products:", availableProducts);
        setProducts(availableProducts);
      } catch (error) {
        console.error('Error fetching inventory products:', error);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventoryProducts();
  }, []);

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
        price: Number(product.price), // Add the price field
        inventory_id: product.inventory_id,
        inventory_data: product.inventory_data,
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
            <p className="mb-6">There are currently no products in your inventory. Please add inventory items first.</p>
            
            <button 
              onClick={() => navigate('/')}
              className="bg-secondary hover:bg-[#0BB489] text-white font-medium py-2 px-4 rounded"
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
                  <span className="text-xs text-green-400">
                    In Stock: {item.totalStock}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={stepDec}
          className="mr-10 ml-10 mt-10 p-2 w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489]"
          disabled={loading}
        >
          Prev
        </button>
      </div>
    </>
  );
}

export default SelectProduct;
