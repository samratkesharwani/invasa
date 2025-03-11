import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../css/tailwind.css";
import { supabase } from "../../utils/supabase";
import Header from "../Header";

function Step1({ nextPage, handleChange, formData }) {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const apiKey = process.env.REACT_APP_OPEN_CAGE_KEY;

  // Validation patterns
  const patterns = {
    businessName: /^[a-zA-Z0-9\s&'-]{3,50}$/,
    ownerName: /^[a-zA-Z\s]{2,50}$/,
    contactNumber: /^[6-9]\d{9}$/,
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
    pincode: /^[1-9][0-9]{5}$/,
    city: /^[a-zA-Z\s]{2,50}$/,
  };

  // Error messages
  const errorMessages = {
    businessName: "Business name must be 3-50 characters long and can contain letters, numbers, spaces, &, ', and -",
    ownerName: "Owner name must be 2-50 characters and contain only letters and spaces",
    contactNumber: "Please enter a valid 10-digit Indian mobile number",
    email: "Please enter a valid email address",
    address: "Address is required and must be at least 5 characters long",
    pincode: "Please enter a valid 6-digit pincode",
    city: "City name must be 2-50 characters and contain only letters and spaces",
  };

  const validateField = (name, value) => {
    if (!value || value.trim() === '') {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (patterns[name]) {
      if (!patterns[name].test(value)) {
        return errorMessages[name];
      }
    } else if (name === 'address' && value.length < 5) {
      return errorMessages.address;
    }

    return '';
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    handleChange(e);
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    if (name === 'address') {
      setAddress(value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleGeocode = async () => {
    if (!formData.address) {
      setErrors(prev => ({ ...prev, address: 'Address is required' }));
      return null;
    }

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formData.address)}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      if (response.data.results && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry;
        setCoordinates({ lat, lng });
        return { lat, lng };
      } else {
        setErrors(prev => ({ ...prev, address: 'Could not find coordinates for this address' }));
        return null;
      }
    } catch (error) {
      console.error('Error fetching geocode data:', error);
      setErrors(prev => ({ ...prev, address: 'Error getting location coordinates' }));
      return null;
    }
  }; 

  const validateForm = () => {
    const newErrors = {};
    const fields = ['businessName', 'ownerName', 'contactNumber', 'email', 'address', 'city', 'pincode'];
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextClick = async () => {
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    const coords = await handleGeocode();
    if (coords) {
      formData.coordinates = coords;
      nextPage();
    }
  };

  return (
    <>
      <div style={{ marginBottom: '-3vw' }} className=""></div>
      <section className="py-12">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <DefaultColumn>
              <TextInput
                title="Business Name"
                name="businessName"
                placeholder="Enter your brand name"
                onChange={handleFieldChange}
                onBlur={handleBlur}
                value={formData.businessName}
                error={touched.businessName && errors.businessName}
              />
            </DefaultColumn>

            <DefaultColumn>
              <TextInput
                title="Owner Name"
                name="ownerName"
                placeholder="Enter owner name"
                onChange={handleFieldChange}
                onBlur={handleBlur}
                value={formData.ownerName}
                error={touched.ownerName && errors.ownerName}
              />
            </DefaultColumn>

            <DefaultColumn>
              <TextInput
                title="Contact Number"
                name="contactNumber"
                placeholder="Enter 10-digit mobile number"
                onChange={handleFieldChange}
                onBlur={handleBlur}
                value={formData.contactNumber}
                error={touched.contactNumber && errors.contactNumber}
              />
            </DefaultColumn>

            <DefaultColumn>
              <EmailInput
                name="email"
                placeholder="info@example.com"
                onChange={handleFieldChange}
                onBlur={handleBlur}
                value={formData.email}
                error={touched.email && errors.email}
              />
            </DefaultColumn>

            <DefaultColumn>
              <TextInput
                title="Address"
                name="address"
                placeholder="Full address"
                onChange={handleFieldChange}
                onBlur={handleBlur}
                value={formData.address}
                error={touched.address && errors.address}
              />
            </DefaultColumn>

            <DefaultColumn>
              <TextInput
                title="City"
                name="city"
                placeholder="City name"
                onChange={handleFieldChange}
                onBlur={handleBlur}
                value={formData.city}
                error={touched.city && errors.city}
              />
            </DefaultColumn>

            <DefaultColumn>
              <TextInput
                title="Pincode"
                name="pincode"
                placeholder="6-digit pincode"
                onChange={handleFieldChange}
                onBlur={handleBlur}
                value={formData.pincode}
                error={touched.pincode && errors.pincode}
              />
            </DefaultColumn>
          </div>

          <button
            onClick={handleNextClick}
            className="w-full md:w-1/2 xl:w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5"
          >
            Next
          </button>
        </div>
      </section>
    </>
  );
}

export default Step1;

const DefaultColumn = ({ children }) => {
  return (
    <div className="w-full px-4 md:w-1/2 lg:w-1/3">
      <div className="mb-12">{children}</div>
    </div>
  );
};

const TextInput = ({ title, name, placeholder, onChange, onBlur, value, error }) => {
  return (
    <>
      <label className="mb-[10px] block text-base font-medium text-dark text-white">
        {title}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full bg-transparent rounded-md border ${error ? 'border-red-500' : 'border-stroke dark:border-dark-3'} py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </>
  );
};

const EmailInput = ({ name, placeholder, onChange, onBlur, value, error }) => {
  return (
    <>
      <label className="mb-[10px] block text-base font-medium text-dark text-white">
        Email
      </label>
      <input
        type="email"
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full bg-transparent rounded-md border ${error ? 'border-red-500' : 'border-stroke dark:border-dark-3'} py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </>
  );
};