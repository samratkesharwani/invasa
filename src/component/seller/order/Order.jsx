import React, { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import Button from '../../Button'
import { useNavigate } from "react-router-dom";
import BackButton from "../../element/BackButton";
import FullAddress from "./FullAddress";
import SelectProduct from "./SelectProduct";
import SelectOptions from "./SelectOptions";
import OrderPayment from "./OrderPayment";

const Order = () => {
  const navigate= useNavigate()
  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState({
    sellerId:"",
    brandId:"",
    selectedCity: "",
    customerInfo: { 
      customerName: "",
      customerContact: "",
    },
    coordinates:"",
    fullAddress: {
      address: "",
      pincode: "",
    },
    productData: {
      selectedProduct: "",
      selectedProductPrice:0,
      selectedSize: "",
      selectedGSM: "",
      selectedColor: "",
      driveLink: "",
      frontPrint:"",
        backPrint:"",
        leftSidePrint:"",
        rightSidePrint:""
    },
    paymentAmount:"",
    transactionId:"",
    status:"pending"
  });
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prevState) => {
      if (name in prevState.customerInfo) {
        return {
          ...prevState,
          customerInfo: {
            ...prevState.customerInfo,
            [name]: value,
          },
        };
      }
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  const handleOrderSubmit = async (e) => {
    // e.preventDefault();
    // if (Object.values(orderData).some((value) => value === "")) {
    //   alert("Please fill all the fields");
    //   return;
    // }

    const { error: orderError } = await supabase.from("orders").insert([
      {
        sellerId: orderData.sellerId,
        brandId: orderData.brandId,
        selectedCity: orderData.selectedCity,
        customerInfo: orderData.customerInfo,
        coordinates: orderData.coordinates,
        fullAddress: orderData.fullAddress,
        productData: orderData.productData,
        paymentAmount: orderData.paymentAmount,
        transactionId: orderData.transactionId,
        status: orderData.status
      }
    ]);
    

    if (orderError) {
      console.error("Order submission failed:", orderError);
    } else {
      alert("Order submitted successfully");
      navigate('/')
    }
  };

  const stepInc = () => {
    setStep(step + 1);
    console.log(step);
  }

  const stepDec = () => {
    setStep(step - 1);
    console.log(step);
  }

  return (
    <div>
      {step === 1 && <ChooseCity setOrderData={setOrderData} orderData={orderData} handleChange={handleChange} stepDec={stepDec} stepInc={stepInc} />}
      {step === 2 && <FullAddress setOrderData={setOrderData} orderData={orderData} handleChange={handleChange} stepDec={stepDec} stepInc={stepInc} />}
      {step === 3 && <SelectProduct setOrderData={setOrderData} orderData={orderData} handleChange={handleChange} stepDec={stepDec} stepInc={stepInc} />}
      {step === 4 && <SelectOptions setOrderData={setOrderData} orderData={orderData} handleChange={handleChange} stepDec={stepDec} step={step} setStep={setStep} stepInc={stepInc} />}
      {step === 5 && <OrderPayment handleOrderSubmit={handleOrderSubmit} setOrderData={setOrderData} orderData={orderData} handleChange={handleChange} stepDec={stepDec} step={step} setStep={setStep} stepInc={stepInc} />}
    </div>
  );
};

const ChooseCity = ({ stepInc, setOrderData, orderData }) => {
  const handleCitySelection = (city) => {
    setOrderData({ ...orderData, selectedCity: city });
    stepInc(); // Move to next step after selecting a city
  };

  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from("businessOnboardForm")
          .select("city, status");

        if (error) {
          throw error;
        }
        
        setCities([...new Set(data.map((item) => item.city))]);
        console.log(data.map((item) => item.city));
        console.log(data.status)
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchCities();
  }, []);

  return (
    <div className="container grid place-items-center">
      <div className="flex items-center justify-evenly w-full">
        <BackButton />
        <h1 className="text-white text-lg text-center mt-10 mb-10 w-full">
          Select the city
        </h1>
      </div>
      {/* City selection buttons */}
      <div className="flex items-center">
        {cities.map((city, index) => (
          <button
            key={index}
            onClick={() => handleCitySelection(city)}
            className="w-[100px] h-[100px] bg-dark-3 p-5 rounded-lg m-4 text-center text-sm text-white hover:bg-[#1F2A37]"
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Order;
