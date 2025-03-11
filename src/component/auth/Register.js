import React, { useState } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";
import Logo from '../../imgs/logo.png'
import Loading from '../element/Loading'
import Error from '../element/Error'
import { Loader } from "lucide-react";

const Signin = () => {
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
        <SuccessfulSubmission goToLogin={goToLogin} />
      ) : (
        <>
          <section className="bg-dark min-h-screen flex items-center justify-center py-10">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center">
                <div className="w-full px-4 max-w-[600px]">
                  <div className="relative mx-auto rounded-lg bg-dark px-8 py-12 sm:px-10 shadow-lg border border-gray-800">
                    <div className="mb-8 text-center">
                      <h1 className="text-white text-2xl font-bold sm:text-3xl">
                        Create an account
                      </h1>
                      <p className="text-gray-400 mt-2">Join our platform today</p>
                    </div>
                    <form onSubmit={handleSignup} className="space-y-5">
                      <div>
                        <label htmlFor="name" className="text-white text-sm font-medium block mb-1">Full Name</label>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          placeholder="Enter your full name"
                          className={`mb-1 w-full rounded-md border ${formErrors.name ? 'border-red-500' : 'border-stroke'} bg-transparent px-5 py-3 text-base text-white outline-none focus:border-primary focus-visible:shadow-none transition-colors`}
                          onChange={handleInputChange(setName, 'name')}
                          value={name}
                          disabled={loading}
                        />
                        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="brandName" className="text-white text-sm font-medium block mb-1">Business Name</label>
                        <input
                          id="brandName"
                          type="text"
                          name="brandName"
                          placeholder="Enter your business name"
                          className={`mb-1 w-full rounded-md border ${formErrors.brandName ? 'border-red-500' : 'border-stroke'} bg-transparent px-5 py-3 text-base text-white outline-none focus:border-primary focus-visible:shadow-none transition-colors`}
                          onChange={handleInputChange(setBrandName, 'brandName')}
                          value={brandName}
                          disabled={loading}
                        />
                        {formErrors.brandName && <p className="text-red-500 text-xs mt-1">{formErrors.brandName}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="text-white text-sm font-medium block mb-1">Email</label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          className={`mb-1 w-full rounded-md border ${formErrors.email ? 'border-red-500' : 'border-stroke'} bg-transparent px-5 py-3 text-base text-white outline-none focus:border-primary focus-visible:shadow-none transition-colors`}
                          onChange={handleInputChange(setEmail, 'email')}
                          value={email}
                          disabled={loading}
                        />
                        {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                      </div>

                      <div>
                        <label htmlFor="password" className="text-white text-sm font-medium block mb-1">Password</label>
                        <input
                          id="password"
                          type="password"
                          name="password"
                          placeholder="Create a password"
                          className={`mb-1 w-full rounded-md border ${formErrors.password ? 'border-red-500' : 'border-stroke'} bg-transparent px-5 py-3 text-base text-white outline-none focus:border-primary focus-visible:shadow-none transition-colors`}
                          onChange={handleInputChange(setPassword, 'password')}
                          value={password}
                          disabled={loading}
                        />
                        {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                        {password && !formErrors.password && (
                          <p className="text-xs text-gray-400 mt-1">Password must be at least 6 characters</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="text-white text-sm font-medium block mb-1">Confirm Password</label>
                        <input
                          id="confirmPassword"
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm your password"
                          className={`mb-1 w-full rounded-md border ${formErrors.confirmPassword ? 'border-red-500' : 'border-stroke'} bg-transparent px-5 py-3 text-base text-white outline-none focus:border-primary focus-visible:shadow-none transition-colors`}
                          onChange={handleInputChange(setConfirmPassword, 'confirmPassword')}
                          value={confirmPassword}
                          disabled={loading}
                        />
                        {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                      </div>

                      <div>
                        <label htmlFor="role" className="text-white text-sm font-medium block mb-1">Your Role</label>
                        <select
                          id="role"
                          className={`mb-1 w-full rounded-md border ${formErrors.role ? 'border-red-500' : 'border-stroke'} bg-transparent px-5 py-3 text-base text-white outline-none focus:border-primary focus-visible:shadow-none transition-colors`}
                          name="options"
                          onChange={handleInputChange(setRole, 'role')}
                          value={role}
                          disabled={loading}
                        >
                          <option value="" disabled hidden>Select your role</option>
                          <option className="bg-dark" value="seller">Seller</option>
                          <option className="bg-dark" value="brands">Brands/ Designer/ Individual</option>
                        </select>
                        {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
                      </div>

                      <div className="mt-2">
                        <button
                          type="submit"
                          className="w-full cursor-pointer rounded-md border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition hover:bg-opacity-90 flex items-center justify-center disabled:opacity-70"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader className="animate-spin h-5 w-5 mr-2" />
                              Creating Account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </button>
                      </div>
                    </form>

                    <div className="mt-8 text-center">
                      <p className="text-gray-400">
                        <span className="pr-0.5">Already have an account?</span>{" "}
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

const InputBox = ({ type, placeholder, name, onChange }) => {
  return (
    <div className="mb-6">
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white"
      />
    </div>
  );
};

const SuccessfulSubmission = ({ goToLogin }) => {
  return (
    <div className="py-10 bg-dark min-h-screen flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4">
        <div className="border-green bg-green-light-6 flex flex-col w-full rounded-lg border-l-[6px] px-7 py-8 md:p-9 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-green mr-5 flex h-[34px] w-full max-w-[34px] items-center justify-center rounded-md">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_961_15637)">
                  <path
                    d="M8.99998 0.506248C4.3031 0.506248 0.506226 4.30312 0.506226 9C0.506226 13.6969 4.3031 17.5219 8.99998 17.5219C13.6969 17.5219 17.5219 13.6969 17.5219 9C17.5219 4.30312 13.6969 0.506248 8.99998 0.506248ZM8.99998 16.2562C5.00623 16.2562 1.77185 12.9937 1.77185 9C1.77185 5.00625 5.00623 1.77187 8.99998 1.77187C12.9937 1.77187 16.2562 5.03437 16.2562 9.02812C16.2562 12.9937 12.9937 16.2562 8.99998 16.2562Z"
                    fill="white"
                  />
                  <path
                    d="M11.4187 6.38437L8.07183 9.64687L6.55308 8.15625C6.29996 7.90312 5.90621 7.93125 5.65308 8.15625C5.39996 8.40937 5.42808 8.80312 5.65308 9.05625L7.45308 10.8C7.62183 10.9687 7.84683 11.0531 8.07183 11.0531C8.29683 11.0531 8.52183 10.9687 8.69058 10.8L12.3187 7.3125C12.5718 7.05937 12.5718 6.66562 12.3187 6.4125C12.0656 6.15937 11.6718 6.15937 11.4187 6.38437Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_961_15637">
                    <rect width="18" height="18" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <h5 className="text-lg font-semibold text-[#004434]">
              Account created successfully!
            </h5>
          </div>
          <p className="text-base leading-relaxed text-body-color mb-6">
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
