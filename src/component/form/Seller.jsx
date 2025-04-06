import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Step1 from "./Step1";
import Step3 from "./Step3";
import Header from '../Header'

const FormElementInput = ({ isDarkMode = false }) => {
  const [pageCounter, setPageCounter] = useState(1);
  const [data, setData] = useState({});
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    contactNumber: "",
    email: "",
    address: "",
    pincode: "",
    city: "",
    status:'pending',
    coordinates: null,
    printer:'',
    printingMethod:'',
    ink:'',
    printingPrice:''
  });
  
  const handleChange = (nameOrEvent, value) => {
    // Handle both event objects and direct name/value pairs
    if (typeof nameOrEvent === 'object' && nameOrEvent.target) {
      const { name, value } = nameOrEvent.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [nameOrEvent]: value }));
    }
  };

  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  const nextPage = () => {
    setPageCounter(prev => prev === 1 ? 2 : prev);
  };

  const previousPage = () => {
    setPageCounter(prev => prev === 2 ? 1 : prev);
  };
 
  // For debugging purposes
  useEffect(() => {
    console.log("Current form data:", formData);
  }, [formData]);

  return (
    <>
      <section className={`py-12 p-5 mt-10 rounded-lg ${isDarkMode ? 'bg-dark-2' : 'bg-gray-50'}`}>
        <div className="container">
          <h3 className={`p-8 mb-6 text-2xl font-bold sm:text-[32px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Seller Onboarding Form</span> 
          </h3>
          {pageCounter === 1 && <Step1 handleChange={handleChange} formData={formData} nextPage={nextPage} isDarkMode={isDarkMode} />}
          {pageCounter === 2 && (
            <Step3 setFormData={setFormData} handleChange={handleChange} formData={formData} prevPage={previousPage} nextPage={nextPage} isDarkMode={isDarkMode} />
          )}
        </div>
      </section>
    </>
  );
};

export default FormElementInput;
