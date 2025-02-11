import React, { useState } from 'react';

function Step3({ formData, setFormData, prevPage, nextPage }) {
  const [submit, setSubmit] = useState(false);

  // Handle changes in the CustomInput component
  const handleCustomInputChange = (index, key, value) => {
    setFormData((prevData) => {
      const updatedData = prevData.data.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      );
      return { ...prevData, data: updatedData };
    });
  };

  return (
    <div className='container'>
    <div className="flex justify-between flex-wrap">
      {formData.data.map((item, index) => (
        <CustomInput
          submit={submit}
          key={index}
          handleChange={(name, value) => handleCustomInputChange(index, name, value)}
          title={item.name || `Item ${index + 1}`}
          // gsm={} // Default GSM values, modify if needed
          size={['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']} // Default sizes
        />
      ))}
      </div>
    <b style={{textAlign:'center', fontSize:'calc(8px + 0.3vw)',width:'100px'}} className='text-white'>If you don't sell a particular item, feel free to leave the corresponding fields blank.</b>

      <div className='flex w-full'>
        <div className='m-2'>
          <button style={{ width: '100px' }} onClick={prevPage} className='p-2 m-1 w-full md:w-1/2 xl:w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5'>
            Prev
          </button>
        </div>
        <div className='m-2'>
          <button style={{ width: '100px' }} onClick={() => {
            nextPage();
            console.log(formData);
            setSubmit(true);
          }} className='m-1 w-full md:w-1/2 xl:w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5'>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Step3;

const CustomInput = ({ handleChange, gsm, size, title }) => {
  return (
    <div style={{backgroundColor:"#1F2A37", margin:'10px', }} className="m-10 lg:w-1/4 w-full  bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary">
      <h1 className="mb-4 block text-xl font-semibold text-dark text-white sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]">{title}</h1>
      <MultiSelectButtons title={'Sizes'} data={size} handleChange={handleChange} />
      <TextInput type={'text'} title={'GSM'} name={'gsm'} placeholder={'180,200,200,etc'} onChange={(e) => handleChange('gsm', e.target.value)} />
      <TextInput type={'text'} title="Color" name="color" placeholder="White, Black, Etc" onChange={(e) => handleChange('color', e.target.value)} />
      <TextInput type={'text'} title="Price per piece" name="price" placeholder="Price (145-200)" onChange={(e) => handleChange('price', e.target.value)} />
    </div>
  );
};

const MultiSelectButtons = ({ title, data, handleChange }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleItemClick = (item) => {
    let newSelectedItems = selectedItems.includes(item)
      ? selectedItems.filter(selected => selected !== item)
      : [...selectedItems, item];
    setSelectedItems(newSelectedItems);
    handleChange(title.toLowerCase(), newSelectedItems);
  };

  return (
    <div>
      <label className="mb-[10px] block text-base font-medium text-dark text-white">{title}</label>
      <div className="flex flex-wrap">
        {data.map((item, index) => (
          <button key={index} onClick={() => handleItemClick(item)} className={`m-3 p-2 border ${selectedItems.includes(item) ? 'bg-primary text-white' : 'bg-transparent text-white'}`}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

const TextInput = ({ title, name, placeholder, onChange,type }) => {
  return (
    <div>
      <label className="mb-[10px] block text-base font-medium text-dark text-white">{title}</label>
      <input type={type} name={name} onChange={onChange} placeholder={placeholder} className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-[10px] px-5 text-dark-6 outline-none transition focus:border-primary active:border-primary" />
    </div>
  );
};
