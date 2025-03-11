import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import logo from '../imgs/logo.png';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session?.user) {
        console.error("No user session found.");
        return;
      }
      setLoggedIn(!!data.session.user.id);
    };
  
    fetchUserProfile();
  }, []);

  const navigateToProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="bg-[#1a1f2e] sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Logo />

          {/* Profile/Login Section */}
          <div className="flex items-center">
            {loggedIn ? (
              <button
                onClick={navigateToProfile}
                className="flex items-center space-x-2 bg-[#2a2f3e] hover:bg-[#3a3f4e] text-white px-4 py-2 rounded-full transition-all duration-300 border border-[#00E0A4] hover:border-[#0BB489] group"
              >
                <FaUserCircle className="text-[#00E0A4] group-hover:text-[#0BB489] text-xl" />
                <span className="text-sm font-medium">Profile</span>
              </button>
            ) : (
              <LoginOptions />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Logo = () => {
  const navigate = useNavigate();
  
  return (
    <div onClick={() => navigate('/')} className="cursor-pointer">
      <img
        src={logo}
        alt="INVASA-LINK"
        className="h-8 md:h-10 w-auto"
      />
    </div>
  );
};

const LoginOptions = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => navigate('/login')}
        className="text-white hover:text-[#00E0A4] transition-colors duration-300 text-sm font-medium"
      >
        Login
      </button>
      <button
        onClick={() => navigate('/register')}
        className="bg-gradient-to-r from-[#00E0A4] to-[#0BB489] hover:from-[#0BB489] hover:to-[#00E0A4] text-black font-semibold py-2 px-6 rounded-full flex items-center text-sm transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(0,224,164,0.3)]"
      >
        Get Started
      </button>
    </div>
  );
};

export default Navbar;