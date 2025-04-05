import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from './component/Header';
import Layout from "./component/Layout";
import Signup from "./component/SignUp";
import Dashboard from "./component/Dashboard";
import Wrapper from "./component/Wrapper";
import AdminPanel from "./component/AdminPanel";
import GeneralPosts from "./component/GeneralPosts";
import ExploreProducts from "./component/form/ExploreProducts";
import Seller from "./component/form/Seller";
import Thanks from "./component/Thanks";
import Login from "./component/auth/Login";
import Register from "./component/auth/Register";
import BrandsDashboard from "./component/brands/BrandsDashboard";
import SellerDashboard from "./component/seller/SellerDashboard";
import Profile from "./component/Profile";
import Order from "./component/seller/order/Order";
import FullAddress from "./component/seller/order/FullAddress";
import SelectProduct from "./component/seller/order/SelectProduct";
import SelectOptions from "./component/seller/order/SelectOptions";
import Payment from "./component/Payment";
import Location from './component/Location';
import Print from './component/seller/Print';
import Test from './component/seller/Test';
import InventorySetup from './component/form/InventorySetup';
import AdminRoutes from './component/admin/AdminRoutes';
import AdminLogin from './component/admin/pages/Login';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import './app.css';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const ProtectedRoute = ({ children }) => {
  const user = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage but default to light theme
    const savedTheme = localStorage.getItem('theme');
    // Only use dark if explicitly set to 'dark' in localStorage
    return savedTheme === 'dark';
  });
  
  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  return (
    <ThemeProvider>
      <HelmetProvider>
        <AuthProvider>
          <Router>
            <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-[#111928]' : 'bg-[#f8f9fa]'}`}>
              <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Layout isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
                  <Route path="/explore-products" element={<ExploreProducts isDarkMode={isDarkMode} />} />
                  <Route path="/seller" element={<Seller isDarkMode={isDarkMode} />} />
                  <Route path="/thanks" element={<Thanks isDarkMode={isDarkMode} />} />
                  <Route path="/login" element={<Login isDarkMode={isDarkMode} />} />
                  <Route path="/register" element={<Register isDarkMode={isDarkMode} />} />
                  <Route path="/dashboard-seller" element={
                    <Wrapper isDarkMode={isDarkMode}>
                      <BrandsDashboard isDarkMode={isDarkMode} />
                    </Wrapper>
                  } />
                  <Route path="/dashboard-brands" element={
                    <Wrapper isDarkMode={isDarkMode}>
                      <SellerDashboard isDarkMode={isDarkMode} />
                    </Wrapper>
                  } />
                  <Route path="/profile" element={
                    <Wrapper isDarkMode={isDarkMode}>
                      <Profile isDarkMode={isDarkMode} />
                    </Wrapper>
                  } />
                  <Route path="/order" element={
                    <Wrapper isDarkMode={isDarkMode}>
                      <Order isDarkMode={isDarkMode} />
                    </Wrapper>
                  } />
                  <Route path="/order/address" element={
                    <Wrapper isDarkMode={isDarkMode}>
                      <FullAddress isDarkMode={isDarkMode} />
                    </Wrapper>
                  } />
                  <Route path="/order/products" element={
                    <Wrapper isDarkMode={isDarkMode}>
                      <SelectProduct isDarkMode={isDarkMode} />
                    </Wrapper>
                  } />
                  <Route path="/order/options" element={
                    <Wrapper isDarkMode={isDarkMode}>
                      <SelectOptions isDarkMode={isDarkMode} />
                    </Wrapper>
                  } />
                  <Route path="/admin/*" element={<AdminRoutes isDarkMode={isDarkMode} />} />
                  <Route path="/admin-login" element={<AdminLogin isDarkMode={isDarkMode} />} />
                  <Route path="/pay" element={<Payment isDarkMode={isDarkMode} />} />
                  <Route path="/location" element={<Location isDarkMode={isDarkMode} />} />
                  <Route path="/print" element={<Print isDarkMode={isDarkMode} />} />
                  <Route path="/test" element={<Test isDarkMode={isDarkMode} />} />
                  <Route path="/inventory-setup" element={<InventorySetup isDarkMode={isDarkMode} />} />
                  <Route path="/blog" element={<Blog isDarkMode={isDarkMode} />} />
                  <Route path="/blog/:slug" element={<BlogPost isDarkMode={isDarkMode} />} />
                  <Route path="/contact" element={<Contact isDarkMode={isDarkMode} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
              <Toaster position="top-right" />
            </div>
          </Router>
        </AuthProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;