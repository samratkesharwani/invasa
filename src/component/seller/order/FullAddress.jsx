import React,{useState,useEffect, use} from 'react'
import BackButton from '../../element/BackButton'
import axios from 'axios';

import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../utils/supabase';
function FullAddress({setOrderData, orderData,handleChange,stepDec,stepInc}) {
    const navigate = useNavigate();
const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [fetchedCoordinatesWithId,setFetchedCoordinatesWithId] = useState({
    id:'',
    lat:0,
    lng:0
  })

  const [brandId,setBrandId]= useState('')

  const apiKey = process.env.REACT_APP_OPEN_CAGE_KEY;

  const handleGeocode = async () => {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const { lat, lng } = response.data.results[0].geometry;
      setCoordinates({ lat, lng });
      return { lat, lng };
    } catch (error) {
      console.error('Error fetching geocode data:', error);
    }
  };
  const handleNextClick = async () => {
    setAddress(orderData.fullAddress)
    
    if(address){
      await handleGeocode().then(()=>{
       orderData.coordinates=coordinates;
       console.log(orderData);
       console.log(coordinates);
       if(coordinates){
          console.log(fetchedCoordinatesWithId.id,': ',calculateDistance(fetchedCoordinatesWithId.lat,fetchedCoordinatesWithId.lng,coordinates.lat,coordinates.lng))
          

      // do smth with shortest distance once back got it?    
      //  console.log(fetchedCoordinatesWithId)

         stepInc()
         orderData.sellerId=fetchedCoordinatesWithId.id;
         orderData.brandId=brandId
       }else{
        alert('try again theres an error')
       }
      }
      ).catch(err=>console.log(err))
    }else{
      alert('try again theres some issue')
    }
   };

    useEffect(()=>{
      const fetchCityData = async()=>{
        
         const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
              if (sessionError || !session || !session.user) {
                console.error("No user session found.");
                return;
              }
          
              const userId = session.user.id;
          
        try{

          //  const {data:profile, error: profileError}=await supabase
          //           .from(profile)
          //           .select('id')
          //           .eq('id',userId)
          //           .single()
          
          //           if(profileError){
          //             throw profileError
          //           }

        const {data:selectCity,error:selectCityError} =await supabase.
        from('businessOnboardForm')
        .select('city, coordinates,id')
        .eq('city',orderData.selectedCity)
        .single()
        if(selectCityError){
          throw selectCityError
        }
        console.log(selectCity)
       setFetchedCoordinatesWithId({
        id:selectCity.id,
        lat:selectCity.coordinates.lat,
        lng:selectCity.coordinates.lng,
       })

      }
      catch(error){
        console.log(error)
      }
      setBrandId(userId)
      }

      fetchCityData()
    },[])
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
    const findSmallestNumber = (distance) => {
      if (distance.length === 0) return null; // Handle empty array case
      let smallest = distance[0];
      
      for (let i = 1; i < distance.length; i++) {
        if (distance[i] < smallest) {
          smallest = distance[i];
        }
      }
      
      return smallest;
    };
  return (
    <>
    <div className='container m-4 rounded-lg dark:bg-dark-2'>
    <div className='pr-10 pl-10 pb-5'>
          <div className="flex items-center justify-evenly w-full">
                <h1 className="text-white text-lg text-center mt-10 mb-10 w-full">Enter Address</h1>
                </div>
                <input onChange={handleChange}  type="text" placeholder='Customer Name' name='customerName' value={orderData.customerInfo.customerName} className='m-3 w-full bg-transparent rounded-md border border-stroke py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary' />
            <input onChange={handleChange}  type="text" placeholder='Contact Info' name='customerContact' value={orderData.customerInfo.customerContact} className='m-3 w-full bg-transparent rounded-md border border-stroke py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary' />
            <input  onChange={handleChange} type="text" placeholder='Enter Full Address' name='fullAddress' value={orderData.fullAddress.address} className='m-3 w-full bg-transparent rounded-md border border-stroke py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary' />
            <input onChange={handleChange}  type="text" placeholder='Pincode' name='pincode' value={orderData.fullAddress.pincode} className='m-3 w-full bg-transparent rounded-md border border-stroke py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary' />

      <br/>
      <button onClick={stepDec}  className="mr-5 mt-5 p-2 w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5">Prev</button>
      <button onClick={handleNextClick}  className=" mt-5 p-2 w-1/4  bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5">Next</button>
    </div>
    </div>
    </>
  )
}

export default FullAddress
