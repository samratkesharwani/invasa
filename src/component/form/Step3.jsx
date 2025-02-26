import React, { useEffect, useState } from 'react'
import Alert from '../Thanks'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
function Step3({formData, handleChange, nextPage, prevPage}) {
  
  
  const navigate = useNavigate();
  const [id, setId] =useState("")
  useEffect(() => {
      const fetchUserProfile = async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
        if (sessionError || !session || !session.user) {
          console.error("No user session found.");
          return;
        }
    
        const userId = session.user.id;
    
        try {
          // Fetch user profile
          const { data: userProfile, error: userProfileError } = await supabase
            .from("profile")
            .select("id")
            .eq("id", userId)
            .single();
    
          if (userProfileError) {
            throw userProfileError;
          }
    
          setId(userProfile.id);
        } catch (error) {
          console.error("Error fetching user data:", error.message);
        }
      };
    
      fetchUserProfile();
    }, [])

    const handleSubmit = async (e) => {
     e.preventDefault();
     console.log(formData);
 
    //  if (Object.values(formData).some((value) => value === "")) {
    //    alert("Please fill all the fields");
    //    return;
    //  }
 
    const { error: businessOnboardForm } = await supabase.from("businessOnboardForm").insert([

       {
          id:id,
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          contactNumber: formData.contactNumber,
          email: formData.email,
          address: formData.address,
          pincode: formData.pincode,
          city: formData.city,
          data: formData.data,
          printer: formData.printer,
          printingMethod: formData.printingMethod,
          ink: formData.ink,
          printingPrice: formData.printingPrice
      
       },
     ]);
 
     if (businessOnboardForm) {
       console.error("Brand insert error:", businessOnboardForm);
     } else{
      navigate('/thanks');
     }
     
  

   };
    
    

  return (

    <div>
      
      <div style={{ marginBottom: '-3vw' }} className=""></div>
            <section className="py-12 ">
                <div className="container">
                     
                        <div className="-mx-4 flex flex-wrap">
                            <DefaultColumn>
                                <TextInput
                                    title="Which printer you use?"
                                    name="printer"
                                    placeholder="EPSON 1800L, Procolored F13 Pro,etc"
                                    onChange={handleChange}
                                    value={formData.printer}
                                />
                            </DefaultColumn>

                            <DefaultColumn>
                                <TextInput
                                    title="Which ink you use"
                                    name="ink"
                                    placeholder="Enter ink name (brand)"
                                    onChange={handleChange}
                                    value={formData.ink}
                                />
                            </DefaultColumn>

                            <DefaultColumn>
              <SelectInput
                title="What all printing methods do you use?"
                name="printingMethod"
                options={['DTF']}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                value={formData.printingMethod}
              />
            </DefaultColumn>

                            <DefaultColumn>
                                <TextInput
                                    title="Printing Price(in sq inch)"
                                    name="printingPrice"
                                    placeholder="0.75 paise for DTF, etc"
                                    onChange={handleChange}
                                    value={formData.printingPrice}
                                />
                            </DefaultColumn>
              
                        </div>
                        <div className='flex w-full'>
        <div className='flex justify-evenly items-center'>
          <button style={{ width: '100px' }} onClick={prevPage} className='p-2 m-1 w-full md:w-1/2 xl:w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5'>
            Prev
          </button>
        </div>
        <div className='m-2'>
          <button style={{ width: '100px' }} onClick={handleSubmit}
          className="w-full md:w-1/2 xl:w-1/4 border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-secondary hover:bg-[#E8FBF6] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5"
          >
            Submit
          </button>
        </div>
      </div>
                </div>
            </section>
    </div>
  )
}

export default Step3
const TextInput = ({ title, name, placeholder, onChange,type }) => {
  return (
    <div>
      <label className="mb-[10px] block text-base font-medium text-dark text-white">{title}</label>
      <input type={type} name={name} onChange={onChange} placeholder={placeholder} className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary" />
    </div>
  );
};

  
const DefaultColumn = ({ children }) => {
  return (
    <div className="w-full px-4 md:w-1/2 lg:w-1/3">
      <div className="mb-12">{children}</div>
    </div>
  );
};
const SelectInput = ({ title, name, options, onChange, value }) => {
  return (
    <div>
      <label className="mb-2 block text-base font-medium text-white">
        {title}
      </label>
      <select name={name} onChange={onChange} value={value} className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary">
        {options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};