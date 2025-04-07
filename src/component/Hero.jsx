import React, { useState, useEffect } from "react";
import '../css/tailwind.css'
import {useNavigate} from 'react-router-dom'
import printing from '../imgs/image.png'
import Button from './Button'
import {supabase} from '../utils/supabase'
import tshirtIcon from '../imgs/tshirt.png'
import hoodieIcon from '../imgs/hoodie.png'
import sweatshirt from '../imgs/sweatshirt.png'
import { FaSearch } from 'react-icons/fa';
import IconContainer from './IconContainer';

const Hero = ({navigateTo, loggedIn, isDarkMode}) => {
  const navigate = useNavigate();
  const [product, setProduct] = useState('Tshirt');
  const [printArea, setPrintArea] = useState('');
  const [city, setCity] = useState('');
  const [pricing, setPricing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([
    { id: 1, name: 'T-Shirt', icon: tshirtIcon, color: 'indigo', description: 'Classic cotton t-shirt for everyday wear' },
    { id: 2, name: 'Hoodie', icon: hoodieIcon, color: 'black', description: 'Comfortable hoodie for casual outings' },
    // { id: 3, name: 'Premium Tee', icon: tshirtIcon, color: 'indigo', description: 'High-quality premium cotton t-shirt' },
    { id: 4, name: 'Sweatshirt', icon: sweatshirt, color: 'black', description: 'Warm sweatshirt for cool weather' },
    // { id: 5, name: 'Tank Top', icon: tshirtIcon, color: 'indigo', description: 'Sleeveless top for summer days' },
    { id: 6, name: 'Polo Shirt', icon: tshirtIcon, color: 'blue', description: 'Classic polo with collar for smart casual look' }
  ]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  useEffect(() => {
    // Fetch cities from database
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('businessOnboardForm')
          .select('city')
          .not('city', 'is', null);
        
        if (error) {
          throw error;
        }
        
        // Extract unique cities and convert to lowercase
        const normalizedCities = data.map(item => item.city.toLowerCase().trim());
        const uniqueCities = [...new Set(normalizedCities)];
        // Sort cities alphabetically
        setCities(uniqueCities.sort());
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    // Fetch printer and pricing information
    const fetchPrinterInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('businessOnboardForm')
          .select('printer,printingMethod,ink,printingPrice,city');
        
        if (error) {
          throw error;
        }
        
        setPrinters(data);
      } catch (error) {
        console.error('Error fetching printer info:', error);
      }
    };

    fetchCities();
    fetchPrinterInfo();
  }, []);

  const navigateRegister = () => {
    navigate('/register')
  }
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Filter products based on search query
      const results = featuredProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Update search input to show suggestions as user types
  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      const results = featuredProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const calculatePrice = () => {
    if (!product || !printArea || !city) return;

    try {
      // Normalize the selected city to lowercase for comparison
      const normalizedCity = city.toLowerCase().trim();
      
      // Find matching printer data for the selected city
      const cityPrinters = printers.filter(p => p.city && p.city.toLowerCase().trim() === normalizedCity);
      
      if (cityPrinters.length === 0) {
        console.error(`No printers found in ${city}`);
        // Use default pricing if no city printers are found
        const basePrice = basePrices[product] || 180;
        const printingPrice = 1.5 * parseFloat(printArea); // Default printing rate
        const deliveryCharge = cityDeliveryCharges[normalizedCity] || 150;
        
        setPricing({
          product: product,
          basePrice: basePrice,
          printArea: printArea,
          printingPrice: printingPrice.toFixed(2),
          city: city,
          deliveryCharges: deliveryCharge,
          total: basePrice + printingPrice + deliveryCharge
        });
        return;
      }
      
      // Calculate average printing price for the city
      let avgPrintingPrice = 0;
      let validPriceCount = 0;
      
      cityPrinters.forEach(p => {
        const price = parseFloat(p.printingPrice);
        if (!isNaN(price) && price > 0) {
          avgPrintingPrice += price;
          validPriceCount++;
        }
      });
      
      // If no valid prices found, use default
      avgPrintingPrice = validPriceCount > 0 ? (avgPrintingPrice / validPriceCount) : 1.5;
      
      // Base prices (you can store these in the database too)
      const basePrices = {
        'Tshirt': 180,
        'Hoodie': 350,
        'Cap': 120
      };
      
      // Delivery charges by city (ideally should come from database)
      const cityDeliveryCharges = {
        'mumbai': 180,
        'pune': 150,
        'delhi': 200,
        'bangalore': 170,
        'chennai': 165,
        'hyderabad': 160,
        'kolkata': 190
      };
      
      // Calculate the total price
      const basePrice = basePrices[product] || 180;
      const printingPrice = avgPrintingPrice * parseFloat(printArea);
      const deliveryCharge = cityDeliveryCharges[normalizedCity] || 150;
      
      // Set pricing state with calculated values
      setPricing({
        product: product,
        basePrice: basePrice,
        printArea: printArea,
        printingPrice: printingPrice.toFixed(2),
        city: city,
        deliveryCharges: deliveryCharge,
        total: basePrice + printingPrice + deliveryCharge
      });
      
      console.log('Price calculated:', {
        product,
        basePrice,
        printArea,
        avgPrintingPrice,
        printingPrice,
        city,
        deliveryCharge,
        total: basePrice + printingPrice + deliveryCharge
      });
      
    } catch (error) {
      console.error('Error calculating price:', error);
      // Show error to user
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    calculatePrice();
  };
  
  const handleProductClick = (product) => {
    if (!loggedIn) {
      // If user is not logged in, redirect to register page
      navigateRegister();
    } else {
      // If user is logged in, navigate to product page or show details
      console.log('Clicked on product:', product);
      // Close search results
      setShowSearchResults(false);
      // Clear search query
      setSearchQuery('');
      // Here you would typically navigate to the product page
      // navigate(`/product/${product.id}`);
    }
  };
  const speicalMode = true;
  return (
    <>
      <div className={`relative pb-[60px] pt-[60px] ${isDarkMode ? 'bg-[#111928]' : 'bg-[#f8f9fa]'} lg:pt-[80px]`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Ultra-Minimalist Search Bar */}
          

          <div className="-mx-4 grid place-items-center">
            {/* Left column - Minimalist Hero content */}
            <div className="w-full px-4">
              <div className="hero-content">
                <h1 className={`mb-4 text-center text-3xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-4xl lg:text-4xl`}>
                  Clothing Under Hours Using Print On Demand
                </h1>
                <div className="">
                <p className={`mb-6 text-center max-w-1/3  ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  A decentralized platform connecting brands with printing services for efficient, high-quality printing on demand.
                </p>
                </div>
               
                {/* <div className="pt-4">
                  {loggedIn ? (
                    <button
                      onClick={navigateTo}
                      className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 transition-all duration-300 shadow-sm"
                    >
                      Go to Dashboard
                    </button>
                  ) : (
                    <button
                      onClick={navigateRegister}
                      className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 transition-all duration-300 shadow-sm"
                    >
                      Get Started
                    </button>
                  )}
                </div> */}
              </div>
            </div>
          
            {/* Spacing column */}
            <div className="hidden px-4 lg:block w-full"></div>
            <div className="max-w-full mx-auto mb-12 relative">
            <div className="flex items-center">
              <div className="relative flex-grow w-full mt-10 mb-5">
                <input 
                  type="text" a
                  placeholder="Search for products..." 
                  className={` w-[80vw] lg:w-[65vw] p-3 pr-12 rounded-full border ${
                    isDarkMode 
                      ? 'bg-gray-800/50 border-0 text-white focus:ring-2 focus:ring-indigo-500/40' 
                      : 'bg-white/80 border-0 text-gray-900 focus:ring-2 focus:ring-primary/40'
                  } focus:outline-none transition-all duration-300`}
                  value={searchQuery}
                  onChange={handleSearchInput}
                />
                <button 
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500 w-[30px] p-1.5 h-[30px] bg-black rounded-full'
                  }`}
                >
                  <FaSearch className="h-4 w-4 text-center" />
                </button>
              </div>
            </div>
            
            {/* Minimalist Search Results */}
            {showSearchResults && (
              <div className={`absolute z-20 mt-1 w-full rounded-md shadow-lg ${
                isDarkMode ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50' : 'bg-white/90 backdrop-blur-sm border border-gray-200/50'
              } overflow-hidden`}>
                <div className="py-1">
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <div 
                        key={product.id}
                        className={`px-4 py-2 cursor-pointer flex items-center ${
                          isDarkMode 
                            ? 'hover:bg-gray-700/70 text-white' 
                            : 'hover:bg-gray-100/70 text-gray-900'
                        } transition-colors duration-200`}
                        onClick={() => navigateRegister()}
                      >
                        <IconContainer 
                          icon={product.icon}
                          size="md"
                          alt={product.name}
                          isDarkMode={isDarkMode}
                          color={product.color}
                        />
                        <div className="ml-3">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium text-sm`}>{product.name}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      No products found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
            {/* Right column - Minimalist Featured Products */}
            <div className="w-full grid place-items-center px-4">
              <div className="mx-auto w-[80vw]">
                {/* Featured Products */}
                <h2 className={`text-2xl font-bold mb-10 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Featured products
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">

                  {featuredProducts.slice(0, 6).map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => navigateRegister()}
                      className={` min-w-[180px] min-h-[180px]
                     border rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                        isDarkMode 
                          ? 'border-gray-700/50 bg-gray-800/30 hover:bg-gray-700/30' 
                          : 'border bg-white/60 hover:bg-gray-50/80'
                      } hover:shadow-sm h-full`}
                    >
                      <IconContainer 
                        icon={item.icon} 
                        alt={item.name} 
                        isDarkMode={speicalMode} 
                        size={'exl'}
                        // color={item.color}
                      />
                      <span className={`mt-2 text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Simplified Pricing Calculator with Blur Effect for non-logged in users */}
                <div className="relative">
                  <div className={`border rounded-lg p-6 mb-6 shadow-sm ${
                    isDarkMode ? 'border-gray-700/50 bg-black/20' : 'border-gray-200/50 bg-white/80'
                  }`}>
                    <h3 className={`text-xl font-semibold mb-5 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Pricing Calculator
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-3 gap-8">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Product
                          </label>
                          <select 
                            className={`w-full p-2 rounded-md border text-sm ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                            } focus:outline-none focus:ring-1 focus:ring-green-500`}
                            value={product}
                            onChange={(e) => setProduct(e.target.value)}
                            disabled={!loggedIn}
                          >
                            <option value="Tshirt">Tshirt</option>
                            <option value="Hoodie">Hoodie</option>
                            <option value="Cap">Cap</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Total sq.inch for printing
                          </label>
                          <input
                            type="text"
                            placeholder="(e.g. 144, 256)"
                            className={`w-full p-2 rounded-md border text-sm ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                            } focus:outline-none focus:ring-1 focus:ring-green-500`}
                            value={printArea}
                            onChange={(e) => setPrintArea(e.target.value)}
                            disabled={!loggedIn}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            City
                          </label>
                          <select
                            className={`w-full p-2 rounded-md border text-sm ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                            } focus:outline-none focus:ring-1 focus:ring-green-500`}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            disabled={!loggedIn}
                          >
                            <option value="">Select</option>
                            {cities.map((cityName, index) => (
                              <option key={index} value={cityName}>{cityName.charAt(0).toUpperCase() + cityName.slice(1)}</option>
                            ))}
                            {cities.length === 0 && (
                              <>
                                <option value="mumbai">Mumbai</option>
                                <option value="pune">Pune</option>
                                <option value="delhi">Delhi</option>
                                <option value="bangalore">Bangalore</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <button
                          type="submit"
                          className="px-8 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-md shadow-sm transition-all duration-200"
                          disabled={!loggedIn}
                        >
                          Calculate Price
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  {/* Blur overlay for non-logged in users */}
                  {!loggedIn && (
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex flex-col items-center justify-center rounded-lg">
                      <div className="text-white text-center px-6 py-8">
                        <div className="flex justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Access Restricted</h3>
                        <p className="mb-4 text-gray-300">Log in to use our pricing calculator and get accurate price estimates.</p>
                        <button 
                          onClick={navigateRegister}
                          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md shadow-md transition-colors duration-200"
                        >
                          Sign in / Register
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Pricing Result - Redesigned to match mockup */}
                {pricing && loggedIn && (
                  <div className={`border rounded-lg p-6 shadow-sm ${
                    isDarkMode ? 'border-gray-700/50 bg-black/20' : 'border-gray-200/50 bg-white/80'
                  }`}>
                    <h3 className={`text-xl font-semibold mb-5 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Pricing Details
                    </h3>
                    
                    <div className="grid grid-cols-4 gap-8">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {pricing.product}
                        </label>
                        <div className={`w-full p-2 rounded-md border text-sm ${
                          isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                        }`}>
                          ₹{pricing.basePrice}
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Total sq.inch for printing
                        </label>
                        <div className={`w-full p-2 rounded-md border text-sm ${
                          isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                        }`}>
                          {pricing.printArea}
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          City delivery charges
                        </label>
                        <div className={`w-full p-2 rounded-md border text-sm ${
                          isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                        }`}>
                          ₹{pricing.deliveryCharges}
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Total price
                        </label>
                        <div className={`w-full p-2 rounded-md text-center font-medium text-sm bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm`}>
                          ₹{Math.floor(pricing.total)}-{Math.ceil(pricing.total + 60)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default Hero;

const SingleImage = ({ href, imgSrc }) => {
  return (
    <>
      <a href={href} className="flex w-full items-center justify-center">
        <img src={imgSrc} alt="brand image" className="h-10 w-full" />
      </a>
    </>
  );
};

