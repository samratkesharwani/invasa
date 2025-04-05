import React, { useState, useEffect } from 'react'
import Hero from "../component/Hero";
import Header from "../component/Header";
import Card from "../component/Card";
import Milestone from "../component/Milestone";
import About from "../component/About";
import Footer from './Footer';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
// import { useTheme } from "../contexts/ThemeContext";

function Layout({isDarkMode, toggleTheme}) {
  // const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
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

  const navigateTo = () => {
    // Check if role is set and navigate to the appropriate dashboard
    if (role) {
      // Map the role from database to the actual route path
      const dashboardRoutes = {
        'seller': '/dashboard-seller',
        'brands': '/dashboard-brands',
        // Add other role mappings if needed
      };
      
      // Use the mapped route or fallback to the original format if not found in the mapping
      const route = dashboardRoutes[role.toLowerCase()] || `/dashboard-${role}`;
      navigate(route);
    } else {
      // If role is not set yet, navigate to a default dashboard or show an error
      console.warn("User role not determined yet");
      // You could navigate to a default dashboard or show a loading state
      navigate('/profile'); // Fallback to profile page if role is not determined
    }
  };

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
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#111928]' : 'bg-[#f8f9fa]'}`}>
      <div className="relative">
        <div className="blur-3xl rounded-full"></div>
        <main className="relative z-10">
        
          <Hero navigateTo={navigateTo} loggedIn={loggedIn} isDarkMode={isDarkMode} />
          <div className="container mx-auto px-6 py-16">
            <Card isDarkMode={isDarkMode} />
          </div>
          <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} bg-opacity-60 backdrop-blur-lg`}>
            <div className="container mx-auto px-6 py-16">
              <Milestone isDarkMode={isDarkMode} />
            </div>
          </div>
          <div className="container mx-auto px-6 py-16">
            <About navigateTo={navigateTo} loggedIn={loggedIn} isDarkMode={isDarkMode} />
          </div>
        </main>
        <Footer isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

export default Layout;
