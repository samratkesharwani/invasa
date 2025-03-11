import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../../css/tailwind.css";
import { supabase } from "../../utils/supabase";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from '../Header'

const FormElementInput = ({}) => {
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
      
      // Redirect to thanks page
      navigate('/thanks');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-800 dark:bg-dark-2">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="py-12 bg-gray-800 dark:bg-dark-2 p-5 mt-10 rounded-lg">
        <div className="container rounded-md p-4 mx-auto">
          {error && (
            <div className="bg-gray-900 dark:bg-dark-1 border border-red-500 text-red-400 px-4 py-3 rounded relative mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white sm:text-[40px]/[48px]">
                <span className="ml-4">Onboarding Form</span>
              </h3>
              <button 
                type="button" 
                onClick={handleBackClick}
                className="flex items-center text-white hover:text-secondary"
              >
                <ArrowBackIcon /> <span className="ml-2">Back</span>
              </button>
            </div>
            
            <div className="-mx-4 flex flex-wrap">
              <DefaultColumn>
                <TextInput
                  title="Brand Name"
                  name="brandName"
                  placeholder="Enter your brand name"
                  onChange={handleChange}
                  value={formData.brandName}
                  formErrors={formErrors}
                />
              </DefaultColumn>

              <DefaultColumn>
                <TextInput
                  title="Owner Name"
                  name="ownerName"
                  placeholder="Enter owner name"
                  onChange={handleChange}
                  value={formData.ownerName}
                  formErrors={formErrors}
                />
              </DefaultColumn>

              <DefaultColumn>
                <TextInput
                  title="Contact Number"
                  name="contactNumber"
                  placeholder="Enter contact number"
                  onChange={handleChange}
                  value={formData.contactNumber}
                  formErrors={formErrors}
                />
              </DefaultColumn>

              <DefaultColumn>
                <EmailInput
                  name="email"
                  placeholder="info@example.com"
                  onChange={handleChange}
                  value={formData.email}
                  formErrors={formErrors}
                />
              </DefaultColumn>

              <DefaultColumn>
                <TextInput
                  title="Website Link"
                  name="websiteLink"
                  placeholder="Enter website URL"
                  onChange={handleChange}
                  value={formData.websiteLink}
                  formErrors={formErrors}
                />
              </DefaultColumn>

              <DefaultColumn>
                <TextInput
                  title="Theme"
                  name="theme"
                  placeholder="Enter brand theme"
                  onChange={handleChange}
                  value={formData.theme}
                  formErrors={formErrors}
                />
              </DefaultColumn>

              <DefaultColumn>
                <TextInput
                  title="Social Handles"
                  name="socialHandles"
                  placeholder="Enter social media link (IG)"
                  onChange={handleChange}
                  value={formData.socialHandles}
                  formErrors={formErrors}
                />
              </DefaultColumn>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-1/2 xl:w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-700 disabled:border-gray-700 disabled:text-gray-400"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
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

const DefaultColumn = ({ children }) => {
  return (
    <div className="w-full px-4 md:w-1/2 lg:w-1/3">
      <div className="mb-12">{children}</div>
    </div>
  );
};

const TextInput = ({ title, name, placeholder, onChange, value, formErrors }) => {
  return (
    <>
      <label className="mb-[10px] block text-base font-medium text-white">
        {title}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-gray-700 dark:bg-dark-3 rounded-md border ${formErrors && formErrors[name] ? 'border-red-500' : 'border-gray-600 dark:border-dark-5'} py-[10px] px-5 text-white outline-none transition focus:border-secondary active:border-secondary`}
      />
      {formErrors && formErrors[name] && (
        <p className="mt-1 text-sm text-red-400">{formErrors[name]}</p>
      )}
    </>
  );
};

const EmailInput = ({ name, placeholder, onChange, value, formErrors }) => {
  return (
    <>
      <label className="mb-[10px] block text-base font-medium text-white">
        Email
      </label>
      <input
        type="email"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-gray-700 dark:bg-dark-3 rounded-md border ${formErrors && formErrors[name] ? 'border-red-500' : 'border-gray-600 dark:border-dark-5'} py-[10px] px-5 text-white outline-none transition focus:border-secondary active:border-secondary`}
      />
      {formErrors && formErrors[name] && (
        <p className="mt-1 text-sm text-red-400">{formErrors[name]}</p>
      )}
    </>
  );
};
