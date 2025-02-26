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
    <div className="container">
      <div className="flex justify-between flex-wrap">
        {formData.data.map((item, index) => {
          // Determine if GSM should be shown based on the product name
          const isAccessory = item.name === 'Tote Bag' || item.name === 'Cap';
          const sizeOptions = isAccessory ? ['One Size'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

          // Common GSM values (only for applicable products)
          const gsmOptions = ['150', '180', '200', '220', '240', '280'];
          // Common colors
          const colorOptions = [
            'White', 'Black', 'Navy', 'Red', 'Blue',
            'Gray', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange',
          ];

          return (
            <CustomInput
              submit={submit}
              key={index}
              handleChange={(name, value) =>
                handleCustomInputChange(index, name, value)
              }
              title={item.name || `Item ${index + 1}`}
              size={sizeOptions}
              gsm={gsmOptions}
              color={colorOptions}
              showGSM={!isAccessory} // Show GSM only if not an accessory
            />
          );
        })}
      </div>
      <b
        style={{
          textAlign: 'center',
          fontSize: 'calc(10px + 0.3vw)',
          width: '100%',
        }}
        className="text-white"
      >
        If you don't sell a particular item, feel free to leave the corresponding fields blank.
      </b>

      <div className="flex w-full">
        <div className="m-2">
          <button
            style={{ width: '100px' }}
            onClick={prevPage}
            className="p-2 m-1 w-full md:w-1/2 xl:w-1/4 bg-secondary border-secondary border rounded-md text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489]"
          >
            Prev
          </button>
        </div>
        <div className="m-2">
          <button
            style={{ width: '100px' }}
            onClick={() => {
              nextPage();
              console.log(formData);
              setSubmit(true);
            }}
            className="m-1 w-full md:w-1/2 xl:w-1/4 bg-secondary border-secondary border rounded-md text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Step3;

const CustomInput = ({ handleChange, size, gsm, color, title, showGSM }) => {
  return (
    <div
      style={{ backgroundColor: '#1F2A37', margin: '10px' }}
      className="pb-10 m-10 lg:w-1/4 w-full rounded-md border border-stroke dark:border-dark-3 py-4 px-5 text-white"
    >
      <h1 className="mb-4 text-xl font-semibold">
        {title}
      </h1>

      {/* Size Selection */}
      <MultiSelectButtons
        title="Size"
        data={size}
        handleChange={handleChange}
      />

      {/* GSM Selection (conditionally rendered) */}
      {showGSM && (
        <MultiSelectButtons
          title="GSM"
          data={gsm}
          handleChange={handleChange}
        />
      )}

      {/* Color Selection */}
      <MultiSelectButtons
        title="Color"
        data={color}
        handleChange={handleChange}
      />

      {/* Price Input */}
      <TextInput
        type="text"
        title="Price per piece"
        name="price"
        placeholder="Price"
        onChange={(e) => handleChange('price', e.target.value)}
      />

      {/* Quantity Input */}
      <TextInput
        type="number"
        title="Quantity"
        name="quantity"
        placeholder="Quantity (e.g., 50, 100, 200)"
        onChange={(e) => handleChange('quantity', e.target.value)}
      />
    </div>
  );
};

const MultiSelectButtons = ({ title, data, handleChange }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleItemClick = (item) => {
    const newSelectedItems = selectedItems.includes(item)
      ? selectedItems.filter((selected) => selected !== item)
      : [...selectedItems, item];
    setSelectedItems(newSelectedItems);
    handleChange(title.toLowerCase(), newSelectedItems);
  };

  return (
    <div>
      <label className="mb-2 block text-base font-medium">
        {title}
      </label>
      <div className="flex flex-wrap">
        {data.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            className={`m-2 px-4 py-2 rounded-md border ${
              selectedItems.includes(item)
                ? 'bg-primary text-white'
                : 'bg-transparent text-white'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

const TextInput = ({ title, name, placeholder, onChange, type }) => {
  return (
    <div>
      <label className="mb-2 block text-base font-medium">
        {title}
      </label>
      <input
        type={type}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-2 px-4 text-white focus:border-primary"
      />
    </div>
  );
};
