import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import logo from '../imgs/logo.png';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="bg-black sticky top-0 z-50 shadow-md shadow-gray-900/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Logo />

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-400 hover:text-white p-2 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop Profile/Login Section */}
          <div className="hidden md:flex items-center">
            {loggedIn ? (
              <button
                onClick={navigateToProfile}
                className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-full transition-all duration-300 border border-[#00E0A4] hover:border-[#0BB489] group"
              >
                <FaUserCircle className="text-[#00E0A4] group-hover:text-[#0BB489] text-xl" />
                <span className="text-sm font-medium">Profile</span>
              </button>
            ) : (
              <LoginOptions setMobileMenuOpen={setMobileMenuOpen} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-4 pt-2 pb-4 space-y-3">
            {loggedIn ? (
              <button
                onClick={navigateToProfile}
                className="flex w-full items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-all duration-300 border border-[#00E0A4]"
              >
                <FaUserCircle className="text-[#00E0A4] text-xl" />
                <span className="text-sm font-medium">Profile</span>
              </button>
            ) : (
              <div className="flex flex-col space-y-3 py-2">
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-white bg-gray-800 hover:bg-gray-700 py-3 px-4 rounded-lg transition-colors duration-300 text-sm font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-[#00E0A4] to-[#0BB489] hover:from-[#0BB489] hover:to-[#00E0A4] text-black font-semibold py-3 px-4 rounded-lg flex justify-center items-center text-sm transition-all duration-300"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
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

const LoginOptions = ({ setMobileMenuOpen }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => {
          navigate('/login');
          if (setMobileMenuOpen) setMobileMenuOpen(false);
        }}
        className="text-white hover:text-[#00E0A4] transition-colors duration-300 text-sm font-medium"
      >
        Login
      </button>
      <button
        onClick={() => {
          navigate('/register');
          if (setMobileMenuOpen) setMobileMenuOpen(false);
        }}
        className="bg-gradient-to-r from-[#00E0A4] to-[#0BB489] hover:from-[#0BB489] hover:to-[#00E0A4] text-black font-semibold py-2 px-6 rounded-full flex items-center text-sm transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(0,224,164,0.3)]"
      >
        Get Started
      </button>
    </div>
  );
};

export default Navbar;