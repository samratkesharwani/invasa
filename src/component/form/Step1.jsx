import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../css/tailwind.css";
import { supabase } from "../../utils/supabase";
import Header from "../Header";

function Step1({ nextPage, handleChange, formData }) {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);

  const apiKey = process.env.REACT_APP_OPEN_CAGE_KEY;

  const handleGeocode = async () => {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const { lat, lng } = response.data.results[0].geometry;
      setCoordinates({ lat, lng });
      return { lat, lng };
    } catch (error) {
      console.error('Error fetching geocode data:', error);
    }
  }; 

  const handleNextClick = async () => {
   await handleGeocode().then(()=>{
    setAddress(formData.address)
    formData.coordinates = coordinates;
    console.log(coordinates);
    console.log(formData);
    }
    ).catch(err=>console.log(err))
  };

  return (
    <>
      <Header />
      <div style={{ marginBottom: '-3vw' }} className=""></div>
      <section className="py-12">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <DefaultColumn>
              <TextInput
                title="Business Name"
                name="businessName"
                placeholder="Enter your brand name"
                onChange={handleChange}
                value={formData.businessName}
              />
            </DefaultColumn>

            <DefaultColumn>
              <TextInput
                title="Owner Name"
                name="ownerName"
                placeholder="Enter owner name"
                onChange={handleChange}
                value={formData.ownerName}
              />
            </DefaultColumn>

            <DefaultColumn>
              <TextInput
                title="Contact Number"
                name="contactNumber"
                placeholder="Enter contact number"
                onChange={handleChange}
                value={formData.contactNumber}
              />
            </DefaultColumn>

            <DefaultColumn>
              <EmailInput
                name="email"
                placeholder="info@example.com"
                onChange={handleChange}
                value={formData.email}
              />
            </DefaultColumn>

            <DefaultColumn>
              <TextInput
                title="Address"
                name="address"
                placeholder="Address"
                onChange={handleChange}
                value={formData.address}
              />
            </DefaultColumn>

            <DefaultColumn>
              <TextInput
                title="City"
                name="city"
                placeholder="City"
                onChange={handleChange}
                value={formData.city}
              />
            </DefaultColumn>

            <DefaultColumn>
              <TextInput
                title="Pincode"
                name="pincode"
                placeholder="Pincode"
                onChange={handleChange}
                value={formData.pincode}
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

const TextInput = ({ title, name, placeholder, onChange, value }) => {
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
        placeholder={placeholder}
        className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary"
      />
    </>
  );
};

const EmailInput = ({ name, placeholder, onChange, value }) => {
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
        placeholder={placeholder}
        className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary"
      />
    </>
  );
};
