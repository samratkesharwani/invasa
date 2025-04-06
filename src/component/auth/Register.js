import React, { useState } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";
import Logo from '../../imgs/logo.png'
import Loading from '../element/Loading'
import Error from '../element/Error'
import { Loader } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const Signin = () => {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [brandName, setBrandName] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // Clear error after 5 seconds
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!brandName.trim()) {
      errors.brandName = "Business name is required";
    }
    
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
    
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    if (!role) {
      errors.role = "Please select your role";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");

    try {
      // First, sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
            brandName,
            role
          }
        }
      });

      if (signUpError) {
        console.error("Sign up error:", signUpError);
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      console.log("Sign up response:", data);

      // If user was created successfully, create profile entry
      if (data?.user) {
        try {
          // Create profile entry
          const { error: profileError } = await supabase
            .from("profile") // Changed from "profiles" to "profile" to match actual table name
            .insert([{ 
              id: data.user.id, 
              email, 
              role, 
              name, 
              brandName: brandName // Changed from brand_name to brandName to match actual column name
            }]);

          if (profileError) {
            console.error("Profile creation error:", profileError);
            setError(`Profile creation failed: ${profileError.message}`);
            setLoading(false);
            return;
          }
          
          console.log("Profile created successfully!");
          setLoading(false);
          setSuccess(true);
        } catch (profileErr) {
          console.error("Profile creation exception:", profileErr);
          setError("Failed to create profile. Please contact support.");
          setLoading(false);
        }
      } else {
        setError("User registration failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Registration exception:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigate('/login');
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (formErrors[field]) {
      setFormErrors({...formErrors, [field]: ''});
    }
  };

  return (
    <>
      {error && <Error error={error} />}
      {success ? (
        <SuccessfulSubmission goToLogin={goToLogin} isDarkMode={isDarkMode} />
      ) : (
        <>
          <section className={`min-h-screen flex items-center justify-center py-10 ${isDarkMode ? 'bg-[#111928]' : 'bg-[#f8f9fa]'}`}>
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center">
                <div className="w-full px-4 max-w-[600px]">
                  <div className={`relative mx-auto rounded-lg px-8 py-12 sm:px-10 shadow-lg ${
                    isDarkMode 
                      ? 'bg-gray-800/80 border border-gray-700' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="mb-8 text-center">
                      <h1 className={`text-2xl font-bold sm:text-3xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Create an account
                      </h1>
                      <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Join our platform today</p>
                    </div>
                    <form onSubmit={handleSignup} className="space-y-5">
                      <div>
                        <label htmlFor="name" className={`text-sm font-medium block mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          placeholder="Enter your full name"
                          className={`mb-1 w-full rounded-md border px-5 py-3 text-base outline-none focus-visible:shadow-none transition-colors ${
                            formErrors.name 
                              ? 'border-red-500' 
                              : isDarkMode 
                                ? 'border-gray-600 bg-gray-700/50 text-white focus:border-primary' 
                                : 'border-gray-300 bg-white text-gray-900 focus:border-primary'
                          }`}
                          onChange={handleInputChange(setName, 'name')}
                          value={name}
                          disabled={loading}
                        />
                        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="brandName" className={`text-sm font-medium block mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Business Name</label>
                        <input
                          id="brandName"
                          type="text"
                          name="brandName"
                          placeholder="Enter your business name"
                          className={`mb-1 w-full rounded-md border px-5 py-3 text-base outline-none focus-visible:shadow-none transition-colors ${
                            formErrors.brandName 
                              ? 'border-red-500' 
                              : isDarkMode 
                                ? 'border-gray-600 bg-gray-700/50 text-white focus:border-primary' 
                                : 'border-gray-300 bg-white text-gray-900 focus:border-primary'
                          }`}
                          onChange={handleInputChange(setBrandName, 'brandName')}
                          value={brandName}
                          disabled={loading}
                        />
                        {formErrors.brandName && <p className="text-red-500 text-xs mt-1">{formErrors.brandName}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className={`text-sm font-medium block mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          className={`mb-1 w-full rounded-md border px-5 py-3 text-base outline-none focus-visible:shadow-none transition-colors ${
                            formErrors.email 
                              ? 'border-red-500' 
                              : isDarkMode 
                                ? 'border-gray-600 bg-gray-700/50 text-white focus:border-primary' 
                                : 'border-gray-300 bg-white text-gray-900 focus:border-primary'
                          }`}
                          onChange={handleInputChange(setEmail, 'email')}
                          value={email}
                          disabled={loading}
                        />
                        {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                      </div>

                      <div>
                        <label htmlFor="password" className={`text-sm font-medium block mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                        <input
                          id="password"
                          type="password"
                          name="password"
                          placeholder="Create a password"
                          className={`mb-1 w-full rounded-md border px-5 py-3 text-base outline-none focus-visible:shadow-none transition-colors ${
                            formErrors.password 
                              ? 'border-red-500' 
                              : isDarkMode 
                                ? 'border-gray-600 bg-gray-700/50 text-white focus:border-primary' 
                                : 'border-gray-300 bg-white text-gray-900 focus:border-primary'
                          }`}
                          onChange={handleInputChange(setPassword, 'password')}
                          value={password}
                          disabled={loading}
                        />
                        {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                        {password && !formErrors.password && (
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Password must be at least 6 characters</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className={`text-sm font-medium block mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
                        <input
                          id="confirmPassword"
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm your password"
                          className={`mb-1 w-full rounded-md border px-5 py-3 text-base outline-none focus-visible:shadow-none transition-colors ${
                            formErrors.confirmPassword 
                              ? 'border-red-500' 
                              : isDarkMode 
                                ? 'border-gray-600 bg-gray-700/50 text-white focus:border-primary' 
                                : 'border-gray-300 bg-white text-gray-900 focus:border-primary'
                          }`}
                          onChange={handleInputChange(setConfirmPassword, 'confirmPassword')}
                          value={confirmPassword}
                          disabled={loading}
                        />
                        {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                      </div>

                      <div>
                        <label htmlFor="role" className={`text-sm font-medium block mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your Role</label>
                        <select
                          id="role"
                          name="role"
                          className={`w-full rounded px-5 py-3 appearance-none border ${
                            formErrors.role 
                              ? 'border-red-500' 
                              : isDarkMode 
                                ? 'border-gray-600 bg-gray-700/50 text-white focus:border-primary ' 
                                : 'border-gray-300 bg-white text-black focus:border-primary'
                          }`}
                          onChange={handleInputChange(setRole, 'role')}
                          value={role}
                          disabled={loading}
                          style={isDarkMode ? {backgroundColor: '#374151'} : {}}
                        >
                          <option className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`} value="">Select your role</option>
                          <option className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`} value="seller">Seller - Printing Service Provider</option>
                          <option className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`} value="brands">Brand - Designer/Company/Individual</option>
                        </select>
                        {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
                      </div>

                      <div className="mb-6">
                        <button
                          type="submit"
                          className={`w-full rounded-md bg-primary px-5 py-3 text-base font-semibold text-white transition hover:bg-opacity-90 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="flex items-center justify-center">
                              <Loader className="animate-spin h-5 w-5 mr-2" />
                              Processing...
                            </span>
                          ) : (
                            "Sign Up"
                          )}
                        </button>
                      </div>

                    </form>

                    <div className="mt-8 text-center">
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        <span className={`${isDarkMode ? 'text-white' : 'text-black'} pr-0.5`}>Already have an account?</span>{" "}
                        <button 
                          onClick={goToLogin} 
                          className="text-primary hover:underline font-medium"
                          disabled={loading}
                        >
                          Sign in
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default Signin;

const SuccessfulSubmission = ({ goToLogin, isDarkMode }) => {
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 px-4 ${isDarkMode ? 'bg-gray-900/70' : 'bg-gray-800/50'}`}>
      <div className={`max-w-md w-full rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-6 h-6 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <div className="text-center mb-2">
            <h5 className={`text-lg font-semibold ${isDarkMode ? 'text-green-400' : 'text-[#004434]'}`}>
              Account created successfully!
            </h5>
          </div>
          <p className={`text-base leading-relaxed mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Please check your email and complete the verification process to activate your account.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={goToLogin}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
