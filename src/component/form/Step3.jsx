import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

function Step3({formData, handleChange, nextPage, prevPage}) {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation patterns
  const patterns = {
    printer: /^[a-zA-Z0-9\s-,]{3,50}$/,
    ink: /^[a-zA-Z0-9\s-,]{3,50}$/,
    printingPrice: /^(?:0\.[0-9]{1,2}|[1-9][0-9]*(?:\.[0-9]{1,2})?)\s*(?:paise|rupees?)?$/i
  };

  // Error messages
  const errorMessages = {
    printer: "Printer name must be 3-50 characters and can contain letters, numbers, spaces, and hyphens",
    ink: "Ink name must be 3-50 characters and can contain letters, numbers, spaces, and hyphens",
    printingPrice: "Please enter a valid price (e.g., '0.75 paise' or '0.75')",
    printingMethod: "Please select a printing method"
  };

  const validateField = (name, value) => {
    if (!value || value.trim() === '') {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (patterns[name]) {
      if (!patterns[name].test(value)) {
        return errorMessages[name];
      }
    }

    // Additional validation for printing price
    if (name === 'printingPrice') {
      const numericValue = parseFloat(value.match(/[\d.]+/)[0]);
      if (isNaN(numericValue) || numericValue <= 0 || numericValue > 100) {
        return "Price must be a positive number less than or equal to 100";
      }
    }

    return '';
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    handleChange(name, value);
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    handleFieldChange(e);
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
      if (sessionError || !session || !session.user) {
        console.error("No user session found.");
        return;
      }
  
      const userId = session.user.id;
  
      try {
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
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const fields = ['printer', 'ink', 'printingMethod', 'printingPrice'];
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    try {
      const { error: businessOnboardForm } = await supabase
        .from("businessOnboardForm")
        .insert([{
          id: id,
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          contactNumber: formData.contactNumber,
          email: formData.email,
          address: formData.address,
          pincode: formData.pincode,
          city: formData.city,
          printer: formData.printer,
          printingMethod: formData.printingMethod,
          ink: formData.ink,
          printingPrice: formData.printingPrice
        }]);

      if (businessOnboardForm) {
        console.error("Brand insert error:", businessOnboardForm);
        setErrors(prev => ({
          ...prev,
          submit: "Error submitting form. Please try again."
        }));
      } else {
        navigate('/thanks');
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors(prev => ({
        ...prev,
        submit: "Error submitting form. Please try again."
      }));
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
                title="Which printer do you use?"
                name="printer"
                placeholder="EPSON 1800L, Procolored F13 Pro, etc"
                onChange={handleFieldChange}
                onBlur={handleBlur}
                value={formData.printer}
                error={touched.printer && errors.printer}
              />
            </DefaultColumn>

            <DefaultColumn>
              <TextInput
                title="Which ink do you use?"
                name="ink"
                placeholder="Enter ink name (brand)"
                onChange={handleFieldChange}
                onBlur={handleBlur}
                value={formData.ink}
                error={touched.ink && errors.ink}
              />
            </DefaultColumn>

            <DefaultColumn>
              <SelectInput
                title="What printing methods do you use?"
                name="printingMethod"
                options={['DTF']}
                onChange={handleSelectChange}
                value={formData.printingMethod}
                error={touched.printingMethod && errors.printingMethod}
              />
            </DefaultColumn>

            <DefaultColumn>
              <TextInput
                title="Printing Price (in sq inch)"
                name="printingPrice"
                placeholder="0.75 paise for DTF, etc"
                onChange={handleFieldChange}
                onBlur={handleBlur}
                value={formData.printingPrice}
                error={touched.printingPrice && errors.printingPrice}
              />
            </DefaultColumn>
          </div>

          {errors.submit && (
            <div className="mb-4 text-red-500 text-center">
              {errors.submit}
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <button
              onClick={prevPage}
              className="w-full md:w-1/2 xl:w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5"
            >
              Previous
            </button>
            <button
              onClick={handleSubmit}
              className="w-full md:w-1/2 xl:w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5"
            >
              Submit
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default Step3;

const TextInput = ({ title, name, placeholder, onChange, onBlur, value, error }) => {
  return (
    <div>
      <label className="mb-[10px] block text-base font-medium text-dark text-white">
        {title}
      </label>
      <input
        type="text"
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        placeholder={placeholder}
        className={`w-full bg-transparent rounded-md border ${
          error ? 'border-red-500' : 'border-stroke dark:border-dark-3'
        } py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
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

const SelectInput = ({ title, name, options, onChange, value, error }) => {
  return (
    <div>
      <label className="mb-[10px] block text-base font-medium text-dark text-white">
        {title}
      </label>
      <select
        name={name}
        onChange={onChange}
        value={value}
        className={`w-full bg-transparent rounded-md border ${
          error ? 'border-red-500' : 'border-stroke dark:border-dark-3'
        } py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary`}
      >
        <option value="">Select a method</option>
        {options.map((option, index) => (
          <option key={index} value={option} className="bg-transparent text-dark-6">
            {option}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};