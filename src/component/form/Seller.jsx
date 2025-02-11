import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Step1 from "./Step1";
import Step2 from "./Step2";
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
    data: [
      {
        name: 'T-shirt',
        size: [],
        gsm: '',
        color: '',
        price: ''
      },
      {
        name: 'Oversize T-shirt',
        size: [],
        gsm: '',
        color: '',
        price: ''
      },
      {
        name: 'Hoodie',
        size: [],
        gsm: '',
        color: '',
        price: ''
      },
      {
        name: 'Oversize Hoodie',
        size: [],
        gsm: '',
        color: '',
        price: ''
      },
      {
        name: 'Sweatshirt',
        size: [],
        gsm: '',
        color: '',
        price: ''
      },
      {
        name: 'cap',
        size: [],
        gsm: '',
        color: '',
        price: ''
      },
      {
        name: 'tote bag',
        size: [],
        gsm: '',
        color: '',
        price: ''
      },
      // Add other products similarly
    ],
    printer:'',
    printingMethod:'',
    ink:'',
    printingPrice:''
  });
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1);
  };

  const nextPage = () => {
    setPageCounter(prev => (prev === 1 ? 2 : prev === 2 ? 3 : prev));
  };

  const previousPage = () => {
    setPageCounter(prev => (prev === 2 ? 1 : prev === 3 ? 2 : prev));
  };

  return (
    <>
    <Header/>
                <section className="py-12 bg-dark">
    <div className="container border border-primary rounded-md">
      <h3 className="p-8 mb-4 text-2xl font-bold text-dark text-white sm:text-[40px]/[48px]">
        <ArrowBackIcon fontSize="large" onClick={handleBackClick} /> <span className="ml-4">Onboarding Form-</span>
      </h3>
      {pageCounter === 1 && <Step1 handleChange={handleChange} formData={formData} nextPage={nextPage} />}
      
      {pageCounter === 2 && (
        <Step2 setFormData={setFormData} handleChange={handleChange} formData={formData} prevPage={previousPage} nextPage={nextPage} />
      )}
      {pageCounter === 3 && (
        <Step3 setFormData={setFormData} handleChange={handleChange} formData={formData} prevPage={previousPage} nextPage={nextPage} />
      )}
    </div>
    </section>
    </>
  );
};

export default FormElementInput;
