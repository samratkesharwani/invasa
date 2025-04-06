import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import ExploreProducts from '../../component/form/ExploreProducts';
import Modal from '../../component/element/Modal';
import Seller from '../../component/form/Seller';
import OrdersComponent from './OrdersComponent';
import Inventory from "./Inventory";
import { FaBox, FaClock, FaCheck, FaPlus } from 'react-icons/fa';
import IconContainer from '../../component/IconContainer';

function BrandsDashboard({ isDarkMode }) {
  const [name, setName] = useState("");
  const [orders, setOrders] = useState([]);
  const [role, setRole] = useState("");
  const [form, setForm] = useState(false);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      setSession(session);

      if (sessionError || !session || !session.user) {
        console.error("No user session found.");
        return;
      }

      const userId = session.user.id;

      try {
        const { data: userProfile, error: userProfileError } = await supabase
          .from("profile")
          .select("id, name, role, email")
          .eq("id", userId)
          .single();

        if (userProfileError) {
          throw userProfileError;
        }

        const { data: businessOnboardForm, error: businessOnboardFormError } = await supabase
          .from("businessOnboardForm")
          .select("id")
          .eq("id", userId)
          .single();

        if (businessOnboardFormError) {
          throw businessOnboardFormError;
        }

        if (businessOnboardForm?.id) {
          setForm(true);
        }

        const { data: ordersData, error: ordersDataError } = await supabase
          .from('orders')
          .select('*')
          .eq('sellerId', userId);
        
        if (ordersDataError) {
          throw ordersDataError;
        }

        setOrders(ordersData);
        setName(userProfile.name);
        setRole(userProfile.role);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-[#f5f9fa]'}`}>
      <div className="container mx-auto px-6 py-8">
        {!form ? (
          <div className={`${isDarkMode 
            ? 'bg-black bg-opacity-60 backdrop-blur-lg border-gray-800' 
            : 'bg-white backdrop-blur-lg border-gray-200'} 
            rounded-2xl p-10 mb-12 shadow-lg border`}>
            <div className="flex items-center mb-8">
              <div className="relative mr-6">
                <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full"></div>
                <div className="flex items-center justify-center w-12 h-12">
                  <IconContainer
                    icon={<FaPlus />}
                    isDarkMode={isDarkMode}
                    size="md"
                    color="teal"
                  />
                </div>
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent' 
                    : 'text-gray-900'
                }`}>
                  Complete Your Profile
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mt-2`}>
                  Please fill out the onboarding form so we can onboard you, {name}
                </p>
              </div>
            </div>
            <Seller isDarkMode={isDarkMode} />
          </div>
        ) : (
          <>
            <div className={`${isDarkMode 
              ? 'bg-black bg-opacity-60 backdrop-blur-lg border-gray-800' 
              : 'bg-white backdrop-blur-lg border-gray-200'} 
              rounded-2xl p-8 mb-12 shadow-lg border`}>
              <h1 className={`text-3xl font-bold ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent' 
                  : 'text-gray-900'
              } mb-8`}>
                Welcome back, {name}!
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatsCard
                  icon={<FaBox className="m-1.5" />}
                  label="Total Orders"
                  value={orders.length}
                  isDarkMode={isDarkMode}
                />
                <StatsCard
                  icon={<FaClock className="m-1.5" />}
                  label="Pending Orders"
                  value={orders.filter(order => order.status === "pending").length}
                  isDarkMode={isDarkMode}
                />
                <StatsCard
                  icon={<FaCheck className="m-1.5" />}
                  label="Completed Orders"
                  value={orders.filter(order => order.status === "completed").length}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            <div className={`${isDarkMode 
              ? 'bg-black bg-opacity-60 backdrop-blur-lg border-gray-800' 
              : 'bg-white backdrop-blur-lg border-gray-200'} 
              rounded-2xl p-8 mb-12 shadow-lg border`}>
              <div className="flex items-center mb-8">
                <div className="relative mr-6">
                  <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full"></div>
                  <div className="flex items-center justify-center w-12 h-12">
                    <IconContainer
                      icon={<FaBox className="m-1.5" />}
                      isDarkMode={isDarkMode}
                      size="md"
                      color="teal"
                    />
                  </div>
                </div>
                <div>
                  <h2 className={`text-3xl font-bold ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent' 
                      : 'text-gray-900'
                  }`}>Orders</h2>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mt-2`}>Manage your customer orders</p>
                </div>
              </div>
              {session && <OrdersComponent isDarkMode={isDarkMode} sellerId={session.user.id} />}
            </div>

            <div className={`${isDarkMode 
              ? 'bg-black bg-opacity-60 backdrop-blur-lg border-gray-800' 
              : 'bg-white backdrop-blur-lg border-gray-200'} 
              rounded-2xl p-8 shadow-lg border mb-12`}
              style={{position: 'relative', zIndex: 'auto'}}
            >
              <div className="flex items-center mb-8">
                <div className="relative mr-6">
                  <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full"></div>
                  <div className="flex items-center justify-center w-12 h-12">
                    <IconContainer
                      icon={<FaBox className="m-1.5" />}
                      isDarkMode={isDarkMode}
                      size="md"
                      color="teal"
                    />
                  </div>
                </div>
                <div>
                  <h2 className={`text-3xl font-bold ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent' 
                      : 'text-gray-900'
                  }`}>Inventory</h2>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mt-2`}>Manage your product inventory</p>
                </div>
              </div>
              <Inventory isDarkMode={isDarkMode} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const StatsCard = ({ icon, label, value, isDarkMode }) => {
  return (
    <div className={`${isDarkMode 
      ? 'bg-black bg-opacity-50 border-gray-800' 
      : 'bg-white border-gray-200'} 
      rounded-xl p-6 border transition-all duration-300 hover:border-[#00E0A4] group`}>
      <div className="flex items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity"></div>
          <div className="flex items-center justify-center w-12 h-12">
            <IconContainer
              icon={icon}
              isDarkMode={isDarkMode}
              size="md"
              color="teal"
            />
          </div>
        </div>
        <div className="ml-6">
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-700'} text-lg`}>{label}</p>
          <h3 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-2`}>{value}</h3>
        </div>
      </div>
    </div>
  );
};

export default BrandsDashboard;
