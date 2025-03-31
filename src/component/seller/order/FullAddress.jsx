import React, { useState, useEffect } from 'react'
import BackButton from '../../element/BackButton'
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../utils/supabase';

function FullAddress({ setOrderData, orderData, handleChange, stepDec, stepInc }) {
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
                
                console.log(`Found ${citySellersList.length} sellers in city "${selectedCity}"`);
                
                if (citySellersList.length === 0) {
                    setError(`No sellers found in ${displayCity}. Please select a different city.`);
                    setIsPageLoading(false);
                    return;
                }
                
                setCitySellers(citySellersList);
                setSellersWithInventory(citySellersList);

            } catch (error) {
                console.error("Error loading city data:", error);
                setError("Error loading city data. Please try again.");
            } finally {
                setIsPageLoading(false);
            }
        };

        fetchCityData();
    }, [orderData.selectedCity, navigate]);

    // Calculate distance is a pure function that doesn't need component state - can be moved outside
    // This function can be shared across components
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
    };

    const calculateTotalPrintSize = () => {
        if (!orderData.prints || orderData.prints.length === 0) {
            return 0;
        }
        return orderData.prints.reduce((total, print) => total + (print.size || 0), 0);
    };

    if (isPageLoading) {
        return (
            <div className="container m-4 rounded-lg bg-gray-800 dark:bg-dark-2 flex items-center justify-center" style={{ minHeight: "300px" }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
                    <p className="text-white">Loading address form...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='container m-4 rounded-lg bg-gray-800 dark:bg-dark-2'>
                <div className='pr-10 pl-10 pb-5'>
                    <div className="flex items-center justify-evenly w-full">
                        <h1 className="text-white text-lg text-center mt-10 mb-10 w-full">Enter Address</h1>
                    </div>
                    
                    {/* Show city information and seller count */}
                    <div className="bg-gray-900 dark:bg-dark-1 text-white px-4 py-3 rounded mb-6">
                        <p className="text-sm">
                            Selected City: <span className="font-medium">{orderData.selectedCity.charAt(0).toUpperCase() + orderData.selectedCity.slice(1)}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {citySellers.length} approved sellers found{sellersWithInventory.length > 0 ? `, ${sellersWithInventory.length} with active inventory` : ''}
                        </p>
                    </div>
                    
                    <input 
                        onChange={handleChange} 
                        type="text" 
                        placeholder='Customer Name' 
                        name='customerName' 
                        value={orderData.customerInfo.customerName || ''} 
                        className='m-3 w-full bg-gray-700 dark:bg-dark-3 rounded-md border border-gray-600 dark:border-dark-5 py-[10px] px-5 text-white outline-none transition focus:border-secondary active:border-secondary' 
                    />
                    <input 
                        onChange={handleChange} 
                        type="number" 
                        placeholder='Contact Number' 
                        name='customerContact' 
                        value={orderData.customerInfo.customerContact || ''} 
                        className='m-3 w-full bg-gray-700 dark:bg-dark-3 rounded-md border border-gray-600 dark:border-dark-5 py-[10px] px-5 text-white outline-none transition focus:border-secondary active:border-secondary' 
                    />
                    <input 
                        onChange={(e) => {
                            const updatedOrderData = {
                                ...orderData,
                                fullAddress: {
                                    ...orderData.fullAddress,
                                    address: e.target.value
                                }
                            };
                            setOrderData(updatedOrderData);
                        }} 
                        type="text" 
                        placeholder='Enter Full Address' 
                        value={orderData.fullAddress.address || ''} 
                        className='m-3 w-full bg-gray-700 dark:bg-dark-3 rounded-md border border-gray-600 dark:border-dark-5 py-[10px] px-5 text-white outline-none transition focus:border-secondary active:border-secondary' 
                    />
                    <input 
                        onChange={(e) => {
                            const updatedOrderData = {
                                ...orderData,
                                fullAddress: {
                                    ...orderData.fullAddress,
                                    pincode: e.target.value
                                }
                            };
                            setOrderData(updatedOrderData);
                        }}  
                        type="text" 
                        placeholder='Pincode' 
                        value={orderData.fullAddress.pincode || ''} 
                        className='m-3 w-full bg-gray-700 dark:bg-dark-3 rounded-md border border-gray-600 dark:border-dark-5 py-[10px] px-5 text-white outline-none transition focus:border-secondary active:border-secondary' 
                    />

                    {error && (
                        <div className="bg-gray-900 dark:bg-dark-1 border border-red-500 text-red-400 px-4 py-3 rounded relative mt-4 mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {sellersWithInventory.length === 0 && citySellers.length > 0 && !error && (
                        <div className="bg-gray-900 dark:bg-dark-1 border border-yellow-500 text-yellow-400 px-4 py-3 rounded relative mt-4 mb-4" role="alert">
                            <span className="block sm:inline">Warning: No sellers with active inventory found in this city. You should choose another city.</span>
                        </div>
                    )}

                    {/* <div className="text-white text-center mt-4">
                        Total Print Size: {calculateTotalPrintSize()} units
                    </div> */}

                    <br />
                    <button 
                        onClick={stepDec} 
                        disabled={isLoading}
                        className="mr-5 mt-5 p-2 w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-700 disabled:border-gray-700 disabled:text-gray-400"
                    >
                        Prev
                    </button>
                    <button 
                        onClick={handleNextClick} 
                        disabled={isLoading || sellersWithInventory.length === 0}
                        className="mt-5 p-2 w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-700 disabled:border-gray-700 disabled:text-gray-400"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : sellersWithInventory.length === 0 ? 'No Sellers Available' : 'Next'}
                    </button>
                </div>
            </div>
        </>
    );
}

export default FullAddress;