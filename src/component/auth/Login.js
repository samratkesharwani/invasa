import React, { useState, useEffect } from "react";
import { supabase } from '../../utils/supabase';
import { useNavigate } from "react-router-dom";
import Logo from '../../imgs/logo.png';
import '../../css/tailwind.css';
import { User, Loader } from "lucide-react";
import Error from '../../component/element/Error';

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

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
        navigate('/');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        setError(error.message);
      } else {
        console.log("Logged in user:", data);
        navigate(`/`);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
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
        setError(error.message);
      } else {
        setError('');
        alert("Password reset link sent to your email!");
      }
    } catch (err) {
      setError("Failed to send reset password email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Error error={error} />}
      <section className="bg-dark min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center">
            <div className="w-full px-4 max-w-[525px]">
              <div className="relative mx-auto rounded-lg bg-dark px-8 py-12 sm:px-10 shadow-lg border border-gray-800">
                <div className="mb-8 text-center">
                  <h1 className="text-white text-2xl font-bold sm:text-3xl">
                    Welcome Back
                  </h1>
                  <p className="text-gray-400 mt-2">Sign in to your account</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="text-white text-sm font-medium block mb-1">Email</label>
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
                    <label htmlFor="password" className="text-white text-sm font-medium block mb-1">Password</label>
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
                      className="text-sm text-primary hover:underline"
                      disabled={loading}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className="w-full rounded-md border border-primary bg-primary px-5 py-3 text-white transition hover:bg-opacity-90 flex items-center justify-center disabled:opacity-70"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin h-5 w-5 mr-2" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </div>
                </form>
                
                <div className="mt-8 text-center">
                  <p className="text-gray-400">
                    <span className="pr-0.5">Not registered yet?</span>{" "}
                    <button 
                      onClick={goToRegister} 
                      className="text-primary hover:underline font-medium"
                      disabled={loading}
                    >
                      Create an account
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
