import React, { useState, useEffect } from 'react'
import BackButton from '../../element/BackButton'
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../utils/supabase';

function FullAddress({ setOrderData, orderData, handleChange, stepDec, stepInc, isDarkMode = false }) {
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [citySellers, setCitySellers] = useState([]);
    const [closestSeller, setClosestSeller] = useState(null);
    const [sellersWithInventory, setSellersWithInventory] = useState([]);

    const apiKey = process.env.REACT_APP_OPEN_CAGE_KEY;

    const handleGeocode = async () => {
        if (!address) {
            return null;
        }

        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;

        try {
            const response = await axios.get(url);
            if (response.data.results && response.data.results.length > 0) {
                const { lat, lng } = response.data.results[0].geometry;
                setCoordinates({ lat, lng });
                return { lat, lng };
            } else {
                setError('Location not found. Please check the address and try again.');
                return null;
            }
        } catch (error) {
            console.error('Error fetching geocode data:', error);
            setError('Error connecting to location service. Please try again later.');
            return null;
        }
    };

    const handleNextClick = async () => {
        // Clear previous errors
        setError('');
        
        // Validate required fields
        if (!orderData.customerInfo.customerName || !orderData.customerInfo.customerContact) {
            setError('Please enter customer name and contact information');
            return;
        }
        
        if (!orderData.fullAddress.address || !orderData.fullAddress.pincode) {
            setError('Please enter both address and pincode');
            return;
        }

        setIsLoading(true);
        setAddress(orderData.fullAddress.address);

        try {
            // Get coordinates from address
            const coords = await handleGeocode();
            if (!coords) {
                setError('Could not determine location from address. Please check the address and try again.');
                setIsLoading(false);
                return;
            }

            // Use only city sellers (already filtered by city in useEffect)
            const sellersToUse = citySellers;
            const displayCity = orderData.cityDisplayName || orderData.selectedCity;

            if (!sellersToUse || sellersToUse.length === 0) {
                setError(`No sellers available in ${displayCity}. Please select a different city.`);
                setIsLoading(false);
                return;
            }

            // Calculate distances and sort sellers from the selected city
            const sellersWithDistances = sellersToUse.map(seller => {
                const distance = seller.coordinates ? calculateDistance(
                    coords.lat,
                    coords.lng,
                    seller.coordinates.lat,
                    seller.coordinates.lng
                ) : Infinity; // Use Infinity for sellers without coordinates
                
                return {
                    ...seller,
                    distance: distance
                };
            }).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

            // Filter sellers by distance - only include those within 10km
            const MAX_DISTANCE_KM = 10;
            const nearbySellers = sellersWithDistances.filter(seller => 
                seller.distance !== Infinity && seller.distance <= MAX_DISTANCE_KM
            );
            
            console.log(`Found ${nearbySellers.length} sellers within ${MAX_DISTANCE_KM}km radius`);
            
            if (nearbySellers.length === 0) {
                setError(`No sellers available within ${MAX_DISTANCE_KM}km of your location in ${displayCity}. Please try a different address.`);
                setIsLoading(false);
                return;
            }

            // Update order data with coordinates and nearby sellers only
            const updatedOrderData = {
                ...orderData,
                coordinates: coords,
                availableSellers: nearbySellers,
                maxDistance: MAX_DISTANCE_KM,
                fullAddress: {
                    ...orderData.fullAddress,
                    address: address,
                    pincode: orderData.fullAddress.pincode
                }
            };
            
            console.log('Updated order data with nearby sellers:', updatedOrderData);
            setOrderData(updatedOrderData);
            
            // Move to next step
            stepInc();
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to find the closest seller with inventory based on distance
    const findClosestSellerWithInventory = (customerCoords) => {
        if (!sellersWithInventory || sellersWithInventory.length === 0) return null;
        
        let closestSeller = null;
        let shortestDistance = Infinity;
        
        sellersWithInventory.forEach(seller => {
            if (seller.coordinates && seller.coordinates.lat && seller.coordinates.lng) {
                const distance = calculateDistance(
                    customerCoords.lat,
                    customerCoords.lng,
                    seller.coordinates.lat,
                    seller.coordinates.lng
                );
                
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    closestSeller = {
                        ...seller,
                        distance: distance // Add the distance for reference
                    };
                }
            }
        });
        
        setClosestSeller(closestSeller);
        return closestSeller;
    };

    // Function to find the closest seller regardless of inventory (fallback)
    const findClosestSeller = (customerCoords) => {
        if (!citySellers || citySellers.length === 0) return null;
        
        let closestSeller = null;
        let shortestDistance = Infinity;
        
        citySellers.forEach(seller => {
            if (seller.coordinates && seller.coordinates.lat && seller.coordinates.lng) {
                const distance = calculateDistance(
                    customerCoords.lat,
                    customerCoords.lng,
                    seller.coordinates.lat,
                    seller.coordinates.lng
                );
                
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    closestSeller = {
                        ...seller,
                        distance: distance // Add the distance for reference
                    };
                }
            }
        });
        
        return closestSeller;
    };

    useEffect(() => {
        const fetchCityData = async () => {
            setIsPageLoading(true);
            
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError || !session || !session.user) {
                    console.error("No user session found.");
                    setError("Authentication error. Please log in again.");
                    setIsPageLoading(false);
                    return;
                }
                
                if (!orderData.selectedCity) {
                    setError("Please select a city first");
                    navigate('/order');
                    setIsPageLoading(false);
                    return;
                }

                // Ensure selectedCity is normalized to lowercase for comparison
                const selectedCity = orderData.selectedCity.toLowerCase().trim();
                const displayCity = orderData.cityDisplayName || orderData.selectedCity;
                
                console.log(`Fetching sellers for city: "${selectedCity}" (display: "${displayCity}")`);

                // Fetch all sellers using exact city match (case insensitive)
                const { data: sellersData, error: sellersError } = await supabase
                    .from('businessOnboardForm')
                    .select('*')
                    .eq('status', 'approved');
                
                console.log("All approved sellers:", sellersData);
                    
                if (sellersError) {
                    console.error("Error fetching sellers:", sellersError);
                    throw sellersError;
                }
                
                if (!sellersData || sellersData.length === 0) {
                    console.log("No approved sellers found");
                    setError("No approved sellers found in the system.");
                    setIsPageLoading(false);
                    return;
                }
                
                // Strictly filter only sellers from the exact city (ignoring case)
                const citySellersList = sellersData.filter(seller => {
                    const sellerCity = (seller.city || '').toLowerCase().trim();
                    const isMatch = sellerCity === selectedCity;
                    console.log(`Seller ID: ${seller.id}, City: "${sellerCity}" - Match with "${selectedCity}": ${isMatch}`);
                    return isMatch;
                });
                
                console.log(`Found ${citySellersList.length} sellers in ${displayCity}:`, citySellersList);
                
                if (citySellersList.length === 0) {
                    setError(`No approved sellers found in ${displayCity}. Please select another city.`);
                    setIsPageLoading(false);
                    return;
                }
                
                // Store the filtered sellers for this city
                setCitySellers(citySellersList);
                
                // Fetch inventory for each seller to check which sellers have stock
                const sellersInventoryPromises = citySellersList.map(async seller => {
                    const { data: inventory, error: invError } = await supabase
                        .from('inventory')
                        .select('*')
                        .eq('brand_id', seller.id);
                        
                    if (invError) {
                        console.error(`Error fetching inventory for seller ${seller.id}:`, invError);
                        return null;
                    }
                    
                    // Check if inventory has any items with stock
                    let hasStock = false;
                    if (inventory && inventory.length > 0) {
                        for (const item of inventory) {
                            if (item.data && Array.isArray(item.data)) {
                                for (const colorData of item.data) {
                                    // Check each size property for stock
                                    for (const key in colorData) {
                                        if (key !== 'color' && colorData[key] > 0) {
                                            hasStock = true;
                                            break;
                                        }
                                    }
                                    if (hasStock) break;
                                }
                            }
                            if (hasStock) break;
                        }
                    }
                    
                    return { ...seller, hasStock };
                });
                
                const sellersInventoryResults = await Promise.all(sellersInventoryPromises);
                const sellersWithInventoryList = sellersInventoryResults
                    .filter(seller => seller && seller.hasStock);
                
                console.log(`Found ${sellersWithInventoryList.length} sellers with inventory in ${displayCity}:`, sellersWithInventoryList);
                
                setSellersWithInventory(sellersWithInventoryList);
                
                setIsPageLoading(false);
            } catch (error) {
                console.error('Error fetching city data:', error);
                setError('Failed to load sellers. Please try again.');
                setIsPageLoading(false);
            }
        };

        fetchCityData();
    }, [orderData.selectedCity, navigate, orderData.cityDisplayName]);

    // Restore form values from orderData when component mounts
    useEffect(() => {
        if (orderData.fullAddress && orderData.fullAddress.address) {
            setAddress(orderData.fullAddress.address);
        }
        
        if (orderData.coordinates) {
            setCoordinates(orderData.coordinates);
        }
    }, [orderData]);

    // Function to calculate distance
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

    // Function to calculate total print size
    const calculateTotalPrintSize = () => {
        // Add logic to calculate total print size if needed
        return 0;
    };

    // Add a function to handle back navigation with state preservation
    const handleBackClick = () => {
        // Save the current state before navigating back
        const updatedOrderData = {
            ...orderData,
            fullAddress: {
                ...orderData.fullAddress,
                address: address || orderData.fullAddress.address,
                pincode: orderData.fullAddress.pincode
            }
        };
        
        // Update the orderData with current form values
        setOrderData(updatedOrderData);
        
        // Navigate back
        stepDec();
    };

    if (isPageLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid ${isDarkMode ? 'border-white border-t-transparent' : 'border-blue-600 border-t-transparent'}`} />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl">
            <div className="flex items-center mb-6">
                <button 
                  onClick={handleBackClick} 
                  className={`mr-4 p-2 rounded-full ${isDarkMode ? 'bg-dark-3 hover:bg-dark-4' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Enter Delivery Address
                </h2>
            </div>

            {error && (
                <div className={`p-4 mb-6 rounded-lg ${isDarkMode ? 'bg-red-900 bg-opacity-20 border border-red-800 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {error}
                </div>
            )}

            <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-dark-3' : 'bg-gray-100'}`}>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Please enter delivery details for {orderData.cityDisplayName || orderData.selectedCity || 'your city'}.
                </p>
            </div>

            <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-dark-3' : 'bg-white border border-gray-200'}`}>
                <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Customer Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className={`block mb-1 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Customer Name
                        </label>
                        <input
                            type="text"
                            name="customerName"
                            value={orderData.customerInfo.customerName || ''}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 rounded-lg ${
                                isDarkMode 
                                    ? 'bg-dark-4 border-gray-700 text-white placeholder-gray-500 focus:border-secondary' 
                                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                            } border focus:outline-none focus:ring-1 ${
                                isDarkMode ? 'focus:ring-secondary' : 'focus:ring-blue-500'
                            }`}
                            placeholder="Enter customer name"
                        />
                    </div>
                    <div>
                        <label className={`block mb-1 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Contact Number
                        </label>
                        <input
                            type="tel"
                            name="customerContact"
                            value={orderData.customerInfo.customerContact || ''}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 rounded-lg ${
                                isDarkMode 
                                    ? 'bg-dark-4 border-gray-700 text-white placeholder-gray-500 focus:border-secondary' 
                                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                            } border focus:outline-none focus:ring-1 ${
                                isDarkMode ? 'focus:ring-secondary' : 'focus:ring-blue-500'
                            }`}
                            placeholder="Enter contact number"
                        />
                    </div>
                </div>
                
                <div className="mb-4">
                    <label className={`block mb-1 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Full Address
                    </label>
                    <textarea
                        name="address"
                        value={orderData.fullAddress.address || ''}
                        onChange={(e) => setOrderData(prev => ({
                            ...prev,
                            fullAddress: { ...prev.fullAddress, address: e.target.value }
                        }))}
                        className={`w-full px-3 py-2 rounded-lg ${
                            isDarkMode 
                                ? 'bg-dark-4 border-gray-700 text-white placeholder-gray-500 focus:border-secondary' 
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                        } border focus:outline-none focus:ring-1 ${
                            isDarkMode ? 'focus:ring-secondary' : 'focus:ring-blue-500'
                        }`}
                        rows="3"
                        placeholder="Enter full address"
                    ></textarea>
                </div>
                
                <div>
                    <label className={`block mb-1 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Pincode
                    </label>
                    <input
                        type="text"
                        name="pincode"
                        value={orderData.fullAddress.pincode || ''}
                        onChange={(e) => setOrderData(prev => ({
                            ...prev,
                            fullAddress: { ...prev.fullAddress, pincode: e.target.value }
                        }))}
                        className={`w-full px-3 py-2 rounded-lg ${
                            isDarkMode 
                                ? 'bg-dark-4 border-gray-700 text-white placeholder-gray-500 focus:border-secondary' 
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                        } border focus:outline-none focus:ring-1 ${
                            isDarkMode ? 'focus:ring-secondary' : 'focus:ring-blue-500'
                        }`}
                        placeholder="Enter pincode"
                        maxLength="6"
                    />
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <button
                    onClick={handleBackClick}
                    className={`px-6 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Back
                </button>
                <button
                    onClick={handleNextClick}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-lg ${isLoading 
                        ? isDarkMode 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : isDarkMode 
                            ? 'bg-secondary text-black hover:bg-green-600' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    } inline-flex items-center`}
                >
                    {isLoading ? (
                        <>
                            <svg className={`animate-spin -ml-1 mr-2 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-white'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : 'Continue'}
                </button>
            </div>
        </div>
    );
}

export default FullAddress;