import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import logo from '../imgs/logo.png';
import logoBlack from '../imgs/logo_black.png';
import logoWhite from '../imgs/logo_white.png';
import { FaUserCircle, FaBars, FaTimes, FaMoon, FaSun } from 'react-icons/fa';
import IconContainer from './IconContainer';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error.message);
          setLoggedIn(false);
          return;
        }
        
        setLoggedIn(!!session);
        
        if (session) {
          // Fetch user role if logged in
          const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();
          
          if (!profileError && userProfile) {
            setRole(userProfile.role);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserSession();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoggedIn(!!session);
        
        if (session) {
          // Fetch user role on auth change
          const { data: userProfile } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();
          
          if (userProfile) {
            setRole(userProfile.role);
          }
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  const navigateTo = () => {
    if (role) {
      // Map the role to the appropriate dashboard route
      const dashboardRoutes = {
        'seller': '/dashboard-seller',
        'brands': '/dashboard-brands',
      };
      
      const route = dashboardRoutes[role.toLowerCase()] || `/dashboard-${role}`;
      navigate(route);
    } else {
      // Fallback if role isn't determined yet
      alert("there's some issue please reload the page");
    }
  };

  const navigateToProfile = useCallback(() => {
    navigate('/profile');
    setMobileMenuOpen(false);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setLoggedIn(false);
      setRole("");
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user) return;

      const { data: userProfile, error } = await supabase
        .from("profile")
        .select("role")
        .eq("id", user.user.id)
        .single();

      if (!error && userProfile) {
        setRole(userProfile.role);
      }
    };

    fetchUserProfile();
  }, []);
  return (
    <div className={`${isDarkMode ? 'bg-[#1A1F2E]' : 'bg-white border-b-1'} sticky top-0 z-50 shadow-md shadow-gray-900/20`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Logo />

          <div className="hidden md:flex items-center space-x-6">
            <NavLink path="/" label="Home" />
            {/* {loggedIn && (
              <button
                onClick={navigateTo}
                className={`${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'
                } font-medium transition-colors duration-300`}
              >
                Dashboard
              </button>
            )} */}
            <NavLink path="/blog" label="Blog" />
            {/* <NavLink path="/about" label="About" /> */}
            <NavLink path="/contact" label="Contact" />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {loggedIn && (
              <button
                onClick={() => {
                  navigateTo();
                  setMobileMenuOpen(false);
                }}
                className={`mr-3 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-[#2A3A4A] to-[#1F2A37] text-[#00E0A4] border border-[#00E0A4]/30' 
                    : 'bg-gradient-to-r from-[#f0f9f6]/60 to-[#e6f7f2]/60 text-black border border-[#0BB489]/20'
                }`}
              >
                Dashboard
              </button>
            )}
            <button 
              onClick={toggleMobileMenu}
              className="p-2 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <IconContainer 
                  icon={<FaTimes className=" m-0.5" />} 
                  size="sm" 
                  color="gray" 
                />
              ) : (
                <IconContainer 
                  icon={<FaBars className=" m-0.5" />} 
                  size="sm" 
                  color="gray" 
                />
              )}
            </button>
          </div>

          {/* Desktop Profile/Login Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="focus:outline-none"
            >
              {isDarkMode ? (
                <IconContainer 
                  icon={<FaSun />} 
                  size="sm" 
                  color="yellow" 
                />
              ) : (
                <IconContainer 
                  icon={<FaMoon />} 
                  size="sm" 
                  color="blue" 
                />
              )}
            </button>
            
            {loading ? (
              <div className="h-8 w-24 rounded-full bg-gray-200 animate-pulse"></div>
            ) : loggedIn ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={navigateTo}
                  className={`flex items-center justify-center space-x-2 ${
                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'
                  } px-4 py-2 rounded-full transition-all duration-300 border border-gray-600 hover:border-[#00E0A4]`}
                >
                  <div className="flex items-center">
                    <IconContainer 
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className=" p-0.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>} 
                      size="xs" 
                      color="teal" 
                    />
                    <span className={`${isDarkMode ? 'text-white' : 'text-black'} text-sm font-medium m-1`}>Dashboard</span>
                  </div>
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={navigateToProfile}
                    className={`flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'
                    } px-4 py-2 rounded-full transition-all duration-300 border border-[#00E0A4] hover:border-[#0BB489]`}
                  >
                    <div className="flex items-center">
                      <IconContainer 
                        icon={<FaUserCircle className="text-xl" />} 
                        size="xs" 
                        color="teal" 
                      />
                      <span className={`${isDarkMode ? 'text-white' : 'text-black'} text-sm font-medium m-1`}>Profile</span>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center justify-center ${
                      isDarkMode ? 'bg-red-900/30 hover:bg-red-900/50 text-white' : 'bg-red-50 hover:bg-red-100 text-red-600'
                    } px-4 py-2 rounded-full transition-all duration-300 border border-red-500/30`}
                  >
                    <span className={`${isDarkMode ? 'text-white' : 'text-black'} text-sm font-medium`}>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <LoginOptions setMobileMenuOpen={setMobileMenuOpen} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t`}>
          <div className="px-4 pt-2 pb-4 space-y-3">
            <NavLink mobile path="/" label="Home" onClick={() => setMobileMenuOpen(false)} />
            <NavLink mobile path="/blog" label="Blog" onClick={() => setMobileMenuOpen(false)} />
            <NavLink mobile path="/about" label="About" onClick={() => setMobileMenuOpen(false)} />
            <NavLink mobile path="/contact" label="Contact" onClick={() => setMobileMenuOpen(false)} />
            
            <div className={`flex items-center justify-between py-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Theme</span>
              <button 
                onClick={toggleTheme} 
                className="focus:outline-none"
              >
                {isDarkMode ? (
                  <div className="flex items-center space-x-1">
                    <IconContainer 
                      icon={<FaSun />} 
                      size="xs" 
                      color="yellow" 
                    />
                    <span className="text-sm text-gray-300">Light Mode</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <IconContainer 
                      icon={<FaMoon className=" p-0.5" />} 
                      size="xs" 
                      color="blue" 
                    />
                    <span className="text-sm text-gray-600">Dark Mode</span>
                  </div>
                )}
              </button>
            </div>
            
            <div className={`pt-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              {loading ? (
                <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse"></div>
              ) : loggedIn ? (
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={navigateToProfile}
                    className={`flex w-full items-center space-x-2 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-[#1A2435] to-[#19212D] text-white border border-[#00E0A4]/40' 
                        : 'bg-gradient-to-r from-[#e6f7f2]/40 to-[#d9f2ea]/40 text-black border border-[#0BB489]/30'
                    } px-4 py-3 rounded-lg transition-all duration-300`}
                  >
                    <div className="flex items-center justify-center w-6">
                      <IconContainer 
                        icon={<FaUserCircle className="text-xl p-1" />} 
                        size="sm" 
                        color="teal" 
                      />
                    </div>
                    <span className={`${isDarkMode ? 'text-white' : 'text-black'} text-sm font-medium`}>Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`flex w-full items-center space-x-2 ${
                      isDarkMode 
                        ? 'bg-red-900/20 text-white border border-red-500/30' 
                        : 'bg-red-50 text-red-600 border border-red-200'
                    } px-4 py-3 rounded-lg transition-all duration-300`}
                  >
                    <span className={`${isDarkMode ? 'text-white' : 'text-black'} text-sm font-medium`}>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 py-2">
                  <LoginOptions setMobileMenuOpen={setMobileMenuOpen} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;

const Logo = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  return (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={() => navigate('/')}
    >
      <img 
        src={isDarkMode ? logoWhite : logoBlack} 
        alt="Invasa Logo" 
        className="h-8 md:h-10" 
      />
    </div>
  );
};

const NavLink = ({ path, label, mobile = false, onClick }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(path);
    if (onClick) onClick();
  };
  
  return (
    <button
      onClick={handleClick}
      className={`
        ${mobile 
          ? `block w-full text-left py-2` 
          : ''}
        ${isDarkMode 
          ? 'text-gray-300 hover:text-white' 
          : 'text-gray-700 hover:text-black'}
        font-medium transition-colors duration-300
      `}
    >
      {label}
    </button>
  );
};

const LoginOptions = ({ setMobileMenuOpen }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => {
          navigate('/login');
          if (setMobileMenuOpen) setMobileMenuOpen(false);
        }}
        className={`${
          isDarkMode ? 'text-white' : 'text-black'
        } hover:text-[#00E0A4] transition-colors duration-300 text-sm font-medium`}
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