import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import avatar from '../imgs/avatar.jpg';

function SellerProfile() {
  const navigate = useNavigate();
  const [onboardedBrandData, setOnboardedBrandsData] = useState({});
  const [onboardedSellerData, setOnboardedSellerData] = useState([]);

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

        const { data: onboardedSeller, error: onboardedSelleError } = await supabase
          .from("businessOnboardForm")
          .select("*")
          .eq("id", userId)
          .single();

        if (onboardedSelleError) {
          throw onboardedSelleError;
        }

        setOnboardedSellerData(onboardedSeller);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-6 py-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white transition-colors duration-300"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>

        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-black bg-opacity-60 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
            <div className="relative p-8">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00E0A4] to-[#0BB489] opacity-5"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity"></div>
                    <img 
                      src={avatar} 
                      className="w-32 h-32 rounded-full border-4 border-[#00E0A4] shadow-lg transition-transform duration-300 transform group-hover:scale-105" 
                      alt="Profile" 
                    />
                  </div>
                </div>

                {onboardedBrandData ? (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileItem label="Name" value={onboardedBrandData.ownerName} />
                    <ProfileItem label="Brand Name" value={onboardedBrandData.brandName} />
                    <ProfileItem label="Brand Theme" value={onboardedBrandData.theme} />
                    <ProfileItem label="Mobile" value={onboardedBrandData.contactNumber} />
                    <ProfileItem label="Email" value={onboardedBrandData.email} fullWidth />
                  </div>
                ) : onboardedSellerData ? (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileItem label="Name" value={onboardedSellerData.ownerName} />
                    <ProfileItem label="Business Name" value={onboardedSellerData.businessName} />
                    <ProfileItem label="Mobile" value={onboardedSellerData.contactNumber} />
                    <ProfileItem label="Email" value={(onboardedSellerData.email || "").slice(0, 10) + "..."} />
                    <ProfileItem label="City" value={onboardedSellerData.city} />
                    <ProfileItem label="Profile Status" value={onboardedSellerData.status} />
                  </div>
                ) : (
                  <div className="text-center mt-8 text-gray-400">Please login to view your profile</div>
                )}

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-800 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-xl flex items-center text-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    <FaSignOutAlt className="mr-2" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ProfileItem = ({ label, value, fullWidth = false }) => {
  return (
    <div className={`bg-black bg-opacity-50 rounded-xl p-6 border border-gray-800 transition-all duration-300 hover:border-[#00E0A4] ${fullWidth ? 'col-span-2' : ''}`}>
      <h3 className="text-gray-400 text-sm mb-2">{label}</h3>
      <p className="text-white text-lg font-semibold">{value || 'N/A'}</p>
    </div>
  );
};

export default SellerProfile;
