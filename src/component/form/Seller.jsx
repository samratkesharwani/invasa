import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../../css/tailwind.css";
import { supabase } from "../../utils/supabase";
import Header from "../Header";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

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
  
  // useEffect(() => {
  //   const storedData = localStorage.getItem('data');
  //   if (storedData) {
  //     setData(JSON.parse(storedData)); // Parse the stored string to an object
  //   }
  // }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   console.log(formData);

  //   if (Object.values(formData).some((value) => value === "")) {
  //     alert("Please fill all the fields");
  //     return;
  //   }

  //   const { error: brandError } = await supabase.from("brandsForm").insert([
  //     {
  //       brandName: formData.brandName,
  //       ownerName: formData.ownerName,
  //       contactNumber: formData.contactNumber,
  //       email: formData.email,
  //       websiteLink: formData.websiteLink,
  //       theme: formData.theme,
  //       socialHandles: formData.socialHandles,
  //       youSell: formData.youSell
  //     },
  //   ]);

  //   if (brandError) {
  //     console.error("Brand insert error:", brandError);
  //   }
  // };

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
    <div className="container">
      <h3 className="p-8 mb-4 text-2xl font-bold text-dark dark:text-white sm:text-[40px]/[48px]">
        <ArrowBackIcon fontSize="large" onClick={handleBackClick} /> <span className="ml-4">Onboarding Form-</span>
      </h3>
      {pageCounter === 1 && <Step1 handleChange={handleChange} formData={formData} nextPage={nextPage} />}
      {/* {pageCounter === 2 && (
        <Step2 setFormData={setFormData} formData={formData} title={'You Sell'} data={[
          "T-shirt",
          "Oversize T-shirt",
          "Hoodie",
          "Oversize Hoodie",
          "Sweatshirt",
          "Cap"
        ]} nextPage={nextPage} prevPage={previousPage} />
      )} */}
      {pageCounter === 2 && (
        <Step2 setFormData={setFormData} handleChange={handleChange} formData={formData} prevPage={previousPage} nextPage={nextPage} />
      )}
      {pageCounter === 3 && (
        <Step3 setFormData={setFormData} handleChange={handleChange} formData={formData} prevPage={previousPage} nextPage={nextPage} />
      )}
    </div>
  );
};

export default FormElementInput;
