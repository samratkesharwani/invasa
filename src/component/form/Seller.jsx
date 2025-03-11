import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Step1 from "./Step1";
import Step3 from "./Step3";
import Header from '../Header'

const FormElementInput = () => {
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
    coordinates:'',
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

  return (
    <>
      <section className="py-12 dark:bg-dark-2 p-5 mt-10 rounded-lg">
        <div className="container">
          <h3 className="p-8 mb-4 text-2xl font-bold text-dark text-white sm:text-[40px]/[48px]">
            {/* <ArrowBackIcon fontSize="large" onClick={handleBackClick} />  */}
            <span className="ml-4">Onboarding Form-</span> 
          </h3>
          {pageCounter === 1 && <Step1 handleChange={handleChange} formData={formData} nextPage={nextPage} />}
          {pageCounter === 2 && (
            <Step3 setFormData={setFormData} handleChange={handleChange} formData={formData} prevPage={previousPage} nextPage={nextPage} />
          )}
        </div>
      </section>
    </>
  );
};

export default FormElementInput;
