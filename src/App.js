import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from './component/Header';
import Layout from "./component/Layout";
import "./app.css";
import { ThemeProvider } from './contexts/ThemeContext';

// Import critical components directly
import Login from "./component/auth/Login";
import Register from "./component/auth/Register";
import AdminRoutes from './component/admin/AdminRoutes';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Lazy load other components
const Wrapper = React.lazy(() => import("./component/Wrapper"));
const ExploreProducts = React.lazy(() => import("./component/form/ExploreProducts"));
const Seller = React.lazy(() => import("./component/form/Seller"));
const Thanks = React.lazy(() => import("./component/Thanks"));
const BrandsDashboard = React.lazy(() => import("./component/brands/BrandsDashboard"));
const SellerDashboard = React.lazy(() => import("./component/seller/SellerDashboard"));
const Profile = React.lazy(() => import("./component/Profile"));
const Order = React.lazy(() => import("./component/seller/order/Order"));
const FullAddress = React.lazy(() => import("./component/seller/order/FullAddress"));
const SelectProduct = React.lazy(() => import("./component/seller/order/SelectProduct"));
const SelectOptions = React.lazy(() => import("./component/seller/order/SelectOptions"));
const Payment = React.lazy(() => import("./component/Payment"));
const Location = React.lazy(() => import('./component/Location'));

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
                <React.Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Layout isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/explore-products" element={<ExploreProducts isDarkMode={isDarkMode} />} />
                    <Route path="/brand/register" element={
                      <Wrapper isDarkMode={isDarkMode}>
                        <ExploreProducts isDarkMode={isDarkMode} returnUrl="/order" />
                      </Wrapper>
                    } />
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
                    <Route path="/pay" element={<Payment isDarkMode={isDarkMode} />} />
                    <Route path="/location" element={<Location isDarkMode={isDarkMode} />} />
                    <Route path="/blog" element={<Blog isDarkMode={isDarkMode} />} />
                    <Route path="/blog/:slug" element={<BlogPost isDarkMode={isDarkMode} />} />
                    <Route path="/contact" element={<Contact isDarkMode={isDarkMode} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </React.Suspense>
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