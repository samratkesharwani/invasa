import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import avatar from '../imgs/avatar.jpg';

function SellerProfile() {
  const navigate = useNavigate();
  const [onboardedBrandData, setOnboardedBrandsData] = useState(null);
  const [onboardedSellerData, setOnboardedSellerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        console.error("No user session found.");
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      try {
        const { data: onboardedBrands, error: onboardedBrandsError } = await supabase
          .from("brandsOnboardForm")
          .select("ownerName, brandName, email, theme, contactNumber")
          .eq("id", userId)
          .single();

        if (onboardedBrandsError && onboardedBrandsError.code !== 'PGRST116') {
          console.error("Error fetching brand data:", onboardedBrandsError.message);
        }

        const { data: onboardedSeller, error: onboardedSellerError } = await supabase
          .from("businessOnboardForm")
          .select("*")
          .eq("id", userId)
          .single();

        if (onboardedSellerError && onboardedSellerError.code !== 'PGRST116') {
          console.error("Error fetching seller data:", onboardedSellerError.message);
        }

        setOnboardedSellerData(onboardedSeller || null);
        setOnboardedBrandsData(onboardedBrands || null);
        console.log("Fetched data:", { seller: onboardedSeller, brand: onboardedBrands });
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      } finally {
        setLoading(false);
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

                {loading ? (
                  <div className="text-center mt-8 text-gray-400">Loading profile data...</div>
                ) : (
                  <>
                    {onboardedBrandData && Object.keys(onboardedBrandData).length > 0 && (
                      <>
                        <h2 className="text-white text-xl font-bold mt-6 mb-4 text-center">Brand Information</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ProfileItem label="Name" value={onboardedBrandData.ownerName} />
                          <ProfileItem label="Brand Name" value={onboardedBrandData.brandName} />
                          <ProfileItem label="Brand Theme" value={onboardedBrandData.theme} />
                          <ProfileItem label="Mobile" value={onboardedBrandData.contactNumber} />
                          <ProfileItem label="Email" value={onboardedBrandData.email} fullWidth />
                        </div>
                      </>
                    )}
                    
                    {onboardedSellerData && Object.keys(onboardedSellerData).length > 0 && (
                      <>
                        <h2 className="text-white text-xl font-bold mt-6 mb-4 text-center">Business Information</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ProfileItem label="Name" value={onboardedSellerData.ownerName} />
                          <ProfileItem label="Business Name" value={onboardedSellerData.businessName} />
                          <ProfileItem label="Mobile" value={onboardedSellerData.contactNumber} />
                          <ProfileItem label="Email" value={onboardedSellerData.email ? `${onboardedSellerData.email.slice(0, 10)}...` : 'N/A'} />
                          <ProfileItem label="City" value={onboardedSellerData.city} />
                          <ProfileItem label="Profile Status" value={onboardedSellerData.status} />
                        </div>
                      </>
                    )}
                    
                    {(!onboardedBrandData || Object.keys(onboardedBrandData).length === 0) && 
                     (!onboardedSellerData || Object.keys(onboardedSellerData).length === 0) && (
                      <div className="text-center mt-8 text-gray-400">No profile data found. Please complete your onboarding.</div>
                    )}
                  </>
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
