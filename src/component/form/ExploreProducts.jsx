import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../../css/tailwind.css";
import { supabase } from "../../utils/supabase";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from '../Header'

const FormElementInput = ({ isDarkMode = false, returnUrl = '/thanks' }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsPageLoading(true);
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session || !session.user) {
          console.error("No user session found.");
          setError("Authentication error. Please log in again.");
          setIsPageLoading(false);
          return;
        }
        
        const userId = session.user.id;
        
        const { data: userProfile, error: userProfileError } = await supabase
          .from("profile")
          .select("id")
          .eq("id", userId)
          .single();
        
        if (userProfileError) {
          throw userProfileError;
        }
        
        setUserId(userProfile.id);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        setError("Error loading user data. Please try again.");
      } finally {
        setIsPageLoading(false);
      }
    }
    
    fetchUserProfile();
  }, []);

  const [formData, setFormData] = useState({
    brandName: "",
    ownerName: "",
    contactNumber: "",
    websiteLink: "",
    theme: "",
    socialHandles: "",
    email: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Brand Name validation
    if (!formData.brandName.trim()) {
      errors.brandName = "Brand name is required";
      isValid = false;
    } else if (formData.brandName.trim().length < 2) {
      errors.brandName = "Brand name must be at least 2 characters";
      isValid = false;
    }
    
    // Owner Name validation
    if (!formData.ownerName.trim()) {
      errors.ownerName = "Owner name is required";
      isValid = false;
    } else if (formData.ownerName.trim().length < 2) {
      errors.ownerName = "Owner name must be at least 2 characters";
      isValid = false;
    }
    
    // Contact Number validation
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = "Contact number is required";
      isValid = false;
    } else if (!/^[0-9]{10,15}$/.test(formData.contactNumber.replace(/[^0-9]/g, ''))) {
      errors.contactNumber = "Please enter a valid contact number (10-15 digits)";
      isValid = false;
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }
    
    // Website Link validation
    if (formData.websiteLink.trim() && !/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(formData.websiteLink)) {
      errors.websiteLink = "Please enter a valid website URL";
      isValid = false;
    }
    
    // Theme validation
    if (!formData.theme.trim()) {
      errors.theme = "Theme is required";
      isValid = false;
    }
    
    // Social Handles validation
    if (!formData.socialHandles.trim()) {
      errors.socialHandles = "Social handle is required";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous general error
    setError("");
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    try {
      const { error: brandError } = await supabase.from("brandsOnboardForm").insert([
        {
          id: userId,
          brandName: formData.brandName,
          ownerName: formData.ownerName,
          contactNumber: formData.contactNumber,
          email: formData.email,
          websiteLink: formData.websiteLink,
          theme: formData.theme,
          socialHandles: formData.socialHandles,
        },
      ]);
      
      if (brandError) {
        throw brandError;
      }
      
      // Show success message
      alert("Brand registration successful! You can now complete your order.");
      
      // Redirect to the return URL or thanks page
      navigate(returnUrl);
    } catch (error) {
      console.error("Brand insert error:", error);
      setError("Error submitting form. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  }

  if (isPageLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-2' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg`}>Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className={`py-12 p-5 mt-10 rounded-lg ${isDarkMode ? 'bg-dark-2' : 'bg-gray-50'}`}>
        <div className="container rounded-md p-4 mx-auto">
          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-100 text-red-700 border border-red-400">
              <p>{error}</p>
            </div>
          )}
          
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBackClick} 
              className={`mr-4 p-2 rounded-full hover:bg-opacity-10 ${isDarkMode ? 'hover:bg-gray-300' : 'hover:bg-gray-700'}`}
            >
              <ArrowBackIcon className={isDarkMode ? 'text-white' : 'text-gray-800'} />
            </button>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Brand Onboarding Form</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="-mx-4 flex flex-wrap">
              <DefaultColumn isDarkMode={isDarkMode}>
                <TextInput
                  title="Brand Name"
                  name="brandName"
                  placeholder="Enter your brand name"
                  onChange={handleChange}
                  value={formData.brandName}
                  formErrors={formErrors}
                  isDarkMode={isDarkMode}
                />
              </DefaultColumn>

              <DefaultColumn isDarkMode={isDarkMode}>
                <TextInput
                  title="Owner Name"
                  name="ownerName"
                  placeholder="Enter owner name"
                  onChange={handleChange}
                  value={formData.ownerName}
                  formErrors={formErrors}
                  isDarkMode={isDarkMode}
                />
              </DefaultColumn>

              <DefaultColumn isDarkMode={isDarkMode}>
                <TextInput
                  title="Contact Number"
                  name="contactNumber"
                  placeholder="Enter your contact number"
                  onChange={handleChange}
                  value={formData.contactNumber}
                  formErrors={formErrors}
                  isDarkMode={isDarkMode}
                />
              </DefaultColumn>

              <DefaultColumn isDarkMode={isDarkMode}>
                <EmailInput
                  name="email"
                  placeholder="Enter your email address"
                  onChange={handleChange}
                  value={formData.email}
                  formErrors={formErrors}
                  isDarkMode={isDarkMode}
                />
              </DefaultColumn>

              <DefaultColumn isDarkMode={isDarkMode}>
                <TextInput
                  title="Website Link (optional)"
                  name="websiteLink"
                  placeholder="Enter your website URL"
                  onChange={handleChange}
                  value={formData.websiteLink}
                  formErrors={formErrors}
                  isDarkMode={isDarkMode}
                />
              </DefaultColumn>

              <DefaultColumn isDarkMode={isDarkMode}>
                <TextInput
                  title="Theme"
                  name="theme"
                  placeholder="Enter your brand theme"
                  onChange={handleChange}
                  value={formData.theme}
                  formErrors={formErrors}
                  isDarkMode={isDarkMode}
                />
              </DefaultColumn>

              <DefaultColumn isDarkMode={isDarkMode}>
                <TextInput
                  title="Social Handle"
                  name="socialHandles"
                  placeholder="Enter your Instagram handle"
                  onChange={handleChange}
                  value={formData.socialHandles}
                  formErrors={formErrors}
                  isDarkMode={isDarkMode}
                />
              </DefaultColumn>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full md:w-1/2 xl:w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default FormElementInput;

const DefaultColumn = ({ children, isDarkMode }) => {
  return (
    <div className="w-full px-4 md:w-1/2 lg:w-1/3">
      <div className={`mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{children}</div>
    </div>
  );
};

const TextInput = ({ title, name, placeholder, onChange, value, formErrors, isDarkMode = false }) => {
  return (
    <div>
      <label
        htmlFor={name}
        className={`mb-3 block text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
      >
        {title}
      </label>
      <div className="relative">
        <input
          type="text"
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full rounded-md border border-form-stroke py-3 px-5 text-base font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-[#F5F7FD] ${
            isDarkMode 
              ? 'bg-dark-3 border-dark-3 text-white placeholder-gray-400' 
              : 'bg-white border-[#E9EDF4] text-body-color placeholder-body-color'
          } ${formErrors[name] ? 'border-red-500' : ''}`}
        />
      </div>
      {formErrors[name] && <p className="text-red-500 text-sm mt-1">{formErrors[name]}</p>}
    </div>
  );
};

const EmailInput = ({ name, placeholder, onChange, value, formErrors, isDarkMode = false }) => {
  return (
    <div>
      <label
        htmlFor={name}
        className={`mb-3 block text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
      >
        Email Address
      </label>
      <div className="relative">
        <input
          type="email"
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full rounded-md border border-form-stroke py-3 px-5 text-base font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-[#F5F7FD] ${
            isDarkMode 
              ? 'bg-dark-3 border-dark-3 text-white placeholder-gray-400' 
              : 'bg-white border-[#E9EDF4] text-body-color placeholder-body-color'
          } ${formErrors[name] ? 'border-red-500' : ''}`}
        />
      </div>
      {formErrors[name] && <p className="text-red-500 text-sm mt-1">{formErrors[name]}</p>}
    </div>
  );
};
