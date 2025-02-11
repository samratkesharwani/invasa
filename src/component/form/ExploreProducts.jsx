import React, { useState } from "react";
import {useNavigate} from 'react-router-dom';
import "../../css/tailwind.css";
import { supabase } from "../../utils/supabase";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from '../Header'

const FormElementInput = () => {
 const navigate = useNavigate();

  const [formData, setFormData] = useState({
    brandName: "",
    ownerName: "",
    contactNumber: "",
    websiteLink: "",
    theme: "",
    socialHandles: "",
    email: "",
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    if (Object.values(formData).some((value) => value === "")) {
      alert("Please fill all the fields");
      return;
    }

    const { error: brandError } = await supabase.from("brandsForm").insert([
      {
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
      console.error("Brand insert error:", brandError);
    }else{
      navigate('/thanks');
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  }

  return (
    <>
  <Header/>
            <section className="py-12 bg-dark">
            <div className="container border border-primary rounded-md p-4 mx-auto">

                    <form onSubmit={handleSubmit}>
                    <h3 className="p-8 mb-4 text-2xl font-bold text-dark text-white sm:text-[40px]/[48px]">
        <ArrowBackIcon fontSize="large" onClick={handleBackClick} /> <span className="ml-4">Onboarding Form-</span>
      </h3>
                        <div className="-mx-4 flex flex-wrap">
                            <DefaultColumn>
                                <TextInput
                                    title="Brand Name"
                                    name="brandName"
                                    placeholder="Enter your brand name"
                                    onChange={handleChange}
                                    value={formData.brandName}
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
                                    title="Website Link"
                                    name="websiteLink"
                                    placeholder="Enter website URL"
                                    onChange={handleChange}
                                    value={formData.websiteLink}
                                />
                            </DefaultColumn>

                            <DefaultColumn>
                                <TextInput
                                    title="Theme"
                                    name="theme"
                                    placeholder="Enter brand theme"
                                    onChange={handleChange}
                                    value={formData.theme}
                                />
                            </DefaultColumn>

                            <DefaultColumn>
                                <TextInput
                                    title="Social Handles"
                                    name="socialHandles"
                                    placeholder="Enter social media link (IG)"
                                    onChange={handleChange}
                                    value={formData.socialHandles}
                                />
                            </DefaultColumn>
                        </div>

                        <button
                            type="submit"
                            className="w-full md:w-1/2 xl:w-1/4 border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-secondary hover:bg-[#E8FBF6] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5"
                        >
                            Submit
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

const TextInput = ({ title, name, placeholder, onChange, value }) => {
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
        className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary"
      />
    </>
  );
};

const EmailInput = ({ name, placeholder, onChange, value }) => {
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
        className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary"
      />
    </>
  );
};
