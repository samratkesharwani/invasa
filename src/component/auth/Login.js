import React, { useState, useEffect } from "react";
import { supabase } from '../../utils/supabase';
import { useNavigate } from "react-router-dom";
import Logo from '../../imgs/logo.png';
import '../../css/tailwind.css';
import { User, Loader, AlertCircle } from "lucide-react";
import Error from '../../component/element/Error';

const Signin = ({ isDarkMode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [verificationMessage, setVerificationMessage] = useState('');
  const navigate = useNavigate();

  // Check for hash parameters that might indicate a redirect from email verification
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      setVerificationMessage('Email verification successful! You can now log in.');
      
      // Extract email from hash if possible
      const params = new URLSearchParams(hash.substring(1));
      const decodedHash = decodeURIComponent(hash);
      if (decodedHash.includes('email=')) {
        const emailMatch = decodedHash.match(/email=([^&]*)/);
        if (emailMatch && emailMatch[1]) {
          setEmail(decodeURIComponent(emailMatch[1]));
        }
      }
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (data?.session) {
          console.log("User already has an active session:", data.session);
          
          // Fetch user profile to get role
          const { data: userProfile, error: profileError } = await supabase
            .from("profile") // Changed from "profiles" to "profile" to match actual table name
            .select("role")
            .eq("id", data.session.user.id)
            .single();

          if (!profileError && userProfile) {
            console.log("User profile found:", userProfile);
            navigate('/');
          } else {
            console.error("Error fetching user profile:", profileError);
          }
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };

    checkSession();
  }, [navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (verificationMessage) {
      const timer = setTimeout(() => {
        setVerificationMessage('');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [verificationMessage]);

  const validateForm = () => {
    const errors = {};
    
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }
    
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      console.log("Attempting login with:", { email, password });
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        console.error("Login error:", error);
        
        // Handle specific error cases
        if (error.message.includes("Email not confirmed")) {
          setError("Please verify your email before logging in. Check your inbox for the verification link.");
        } else if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(error.message);
        }
      } else if (data?.user) {
        console.log("Login successful:", data);
        
        // Fetch user profile to get role
        try {
          const { data: userProfile, error: profileError } = await supabase
            .from("profile") // Changed from "profiles" to "profile" to match actual table name
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
          } else {
            console.log("User profile:", userProfile);
          }
          
          // Navigate to home page regardless of profile fetch success
          navigate('/');
        } catch (profileErr) {
          console.error("Profile fetch exception:", profileErr);
          // Still navigate to home page even if profile fetch fails
          navigate('/');
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login exception:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        console.error("Password reset error:", error);
        setError(error.message);
      } else {
        setError('');
        alert("Password reset link sent to your email!");
      }
    } catch (err) {
      console.error("Password reset exception:", err);
      setError("Failed to send reset password email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Error error={error} />}
      
      {verificationMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center z-50">
          <AlertCircle className="mr-2 h-5 w-5" />
          {verificationMessage}
        </div>
      )}
      
      <section className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark' : 'bg-[#f5f9fa]'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center">
            <div className="w-full px-4 max-w-[525px]">
              <div className={`relative mx-auto rounded-lg px-8 py-12 sm:px-10 shadow-lg ${
                isDarkMode ? 'bg-dark border border-gray-800' : 'bg-white border border-gray-200'
              }`}>
                <div className="mb-8 text-center">
                  <h1 className={`text-2xl font-bold sm:text-3xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Welcome Back
                  </h1>
                  <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sign in to your account</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="email" className={`text-sm font-medium block mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      className={`mb-1 w-full rounded-md border ${formErrors.email ? 'border-red-500' : 'border-stroke'} bg-transparent px-5 py-3 text-base text-white outline-none focus:border-primary focus-visible:shadow-none transition-colors`}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formErrors.email) {
                          setFormErrors({...formErrors, email: ''});
                        }
                      }}
                      value={email}
                      disabled={loading}
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="password" className={`text-sm font-medium block mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Password</label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      className={`mb-1 w-full rounded-md border ${formErrors.password ? 'border-red-500' : 'border-stroke'} bg-transparent px-5 py-3 text-base text-white outline-none focus:border-primary focus-visible:shadow-none transition-colors`}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (formErrors.password) {
                          setFormErrors({...formErrors, password: ''});
                        }
                      }}
                      value={password}
                      disabled={loading}
                    />
                    {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} hover:text-primary`}
                      disabled={loading}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className={`w-full rounded-md border border-primary bg-primary px-5 py-3 text-white transition hover:bg-opacity-90 flex items-center justify-center disabled:opacity-70`}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader className="animate-spin h-5 w-5 mr-2" />
                      ) : (
                        <User className="h-5 w-5 mr-2" />
                      )}
                      {loading ? "Signing in..." : "Sign In"}
                    </button>
                  </div>
                </form>
                
                <div className="mt-8 text-center">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className={`${isDarkMode ? 'text-white' : 'text-black'} pr-0.5`}>Not registered yet?</span>{" "}
                    <button 
                      onClick={goToRegister} 
                      className={`text-primary hover:underline font-medium`}
                      disabled={loading}
                    >
                      Create an Account
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
