import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import avatar from '../../imgs/avatar.jpg'
function SellerProfile() {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  const styles = 'mt-3';
  const [onboardedBrandData, setOnboardedBrandsData] = useState({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        console.error("No user session found.");
        return;
      }

      const userId = session.user.id;

      try {
        const { data: onboardedBrands, error: onboardedBrandsError } = await supabase
          .from("brandsOnboardForm")
          .select("ownerName, brandName, email, theme, contactNumber")
          .eq("id", userId)
          .single();

        if (onboardedBrandsError) {
          throw onboardedBrandsError;
        }
        
        console.log(onboardedBrands);
        setOnboardedBrandsData(onboardedBrands);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchUserProfile();
  }, []);
   const handleLogout = async () => {
      await supabase.auth.signOut();
      navigate("/login");
    };

  return (
    <div className="container">
      <ArrowBackIcon fontSize="large" onClick={handleBackClick} />
      <div className="grid place-items-center w-full mt-10">
        <div className='grid place-items-center rounded-lg dark:bg-dark-2  mb-5 p-3 m-2'>
        <div className='flex justify-end items-end w-full'>
<span onClick={()=>{alert('edit feature is still under development')}} className='cursor-pointer'>
<EditIcon/>
</span>
        </div>
          <img src={avatar} className='w-1/3 m-3 rounded-full' alt="" />
          <ol class="mt-10 pl-5 text-sm flex justify-evenly items-center flex-wrap">
          <li class="mr-2 p-5 w-1/3 rounded-lg items-center bg-dark-3 mb-5 text-left"> <h3 className='mr-5 text-left w-full'>Name:</h3>
          <b>{onboardedBrandData.ownerName}</b></li>
          <li class="mr-2 p-5 w-1/2 rounded-lg items-center bg-dark-3 mb-5 text-left"><h3 className='mr-5 text-left w-full'>Brand Name:</h3>
          <b>{onboardedBrandData.brandName}</b></li>
          <li class="mr-2 p-5 w-1/3 rounded-lg items-center bg-dark-3 mb-5 text-left"><h3 className='mr-5 text-left w-full'>Brand Theme:</h3>
          <b>{onboardedBrandData.theme}</b></li>
          <li class="mr-2 p-5 w-1/2 rounded-lg items-center bg-dark-3 mb-5 text-left"><h3 className='mr-5 text-left w-full'>Mobile:</h3>
          <b>{onboardedBrandData.contactNumber}</b></li>
          <li class="mr-2 p-5 w-full rounded-lg items-center bg-dark-3 mb-5 text-left"><h3 className='mr-5 text-left w-full'>Email:</h3>
          <b>{onboardedBrandData.email}</b></li>
          <button onClick={handleLogout} className='mt-5 bg-red border-dark dark:border-dark-2 border rounded-full inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-body-color hover:border-body-color disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5'>
            Logout
          </button>
        </ol>
        </div>
      </div>
    </div>
  );
}

export default SellerProfile;
