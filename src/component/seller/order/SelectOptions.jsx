import React, { useEffect, useState } from 'react';
import Modal from '../../element/Modal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../utils/supabase';

function SelectOptions({ setOrderData, orderData, handleChange, stepDec, stepInc }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedGSM, setSelectedGSM] = useState(null);
  const [data, setData] = useState(null);
  const [driveLink, setDriveLink] = useState('');
  const [frontPrint, setFrontPrint] = useState('');
  const [backPrint, setBackPrint] = useState('');
  const [leftSidePrint, setLeftSidePrint] = useState('');
  const [rightSidePrint, setRightSidePrint] = useState('');

  const style = (isSelected) =>
    `w-[50px] m-3 text-sm grid place-items-center border ${
      isSelected ? 'bg-white text-black' : 'border-blue-400'
    } border-solid w-[40px] h-[40px] p-2 rounded-lg hover:opacity-55 cursor-pointer`;
  const divStyle = 'flex flex-wrap items-center m-5';

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data: options, error: optionsError } = await supabase
          .from('businessOnboardForm')
          .select('data')
          .single();

        if (optionsError) {
          throw optionsError;
        }

        if (Array.isArray(options.data)) {
          const products = options.data;
          // Find the selected product
          const selectedProduct = products.find(
            (item) => item.name === orderData.productData.selectedProduct
          );

          if (selectedProduct) {
            // Process GSM, Color, and Size to be arrays if they are strings
            const processedProduct = { ...selectedProduct };

            if (processedProduct.gsm && typeof processedProduct.gsm === 'string') {
              processedProduct.gsm = processedProduct.gsm
                .split(',')
                .map((gsmValue) => gsmValue.trim());
            }

            if (processedProduct.color && typeof processedProduct.color === 'string') {
              processedProduct.color = processedProduct.color
                .split(',')
                .map((colorValue) => colorValue.trim());
            }

            if (processedProduct.size && typeof processedProduct.size === 'string') {
              processedProduct.size = processedProduct.size
                .split(',')
                .map((sizeValue) => sizeValue.trim());
            }

            setData(processedProduct); // Data now holds the selected product's details
            console.log('Selected Product Options:', processedProduct);
          } else {
            console.error('Selected product not found in data.');
          }
        } else {
          console.error('Error: Fetched data is not an array.');
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchOptions();
  }, [orderData.productData.selectedProduct]);

  const handleNext = () => {
    if (!selectedSize || !selectedColor || !selectedGSM) {
      alert('Please select size, color, and GSM before proceeding.');
      return;
    }
    // Update orderData with selected options
    setOrderData((prevOrderData) => ({
      ...prevOrderData,
      productData: {
        ...prevOrderData.productData,
        selectedSize,
        selectedColor,
        selectedGSM,
        driveLink,
        frontPrint,
        backPrint,
        leftSidePrint,
        rightSidePrint,
      },
    }));
    console.log(orderData);

    stepInc();
  };

  return (
    <div className="m-5 pl-10 pr-10 pb-5 rounded-lg dark:bg-dark-2">
      <div className="container grid place-items-center w-full">
        <h1 className="text-white text-lg text-center mt-10 mb-5 w-full">
          Select Options
        </h1>
        <b className="mb-10">
          Product Selected: {orderData.productData.selectedProduct}
        </b>
      </div>
      {data ? (
        <>
          {/* Color Selection */}
          <div className="w-full sm:w-1/2 md:w-1/4 mb-10">
            <b className="text-sm mb-10">Color</b>
            <div className="w-full flex flex-wrap items-center justify-evenly mt-5">
              {data.color && data.color.length > 0 ? (
                data.color.map((color) => (
                  <div
                    key={color}
                    className={`border ${
                      selectedColor === color
                        ? 'border-2 border-red-500'
                        : 'border-2 border-blue-400'
                    } border-solid w-[40px] h-[40px] rounded-full hover:opacity-55 cursor-pointer`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))
              ) : (
                <p className="text-white">No colors available</p>
              )}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <b className="text-sm">Size</b>
            <div className={divStyle}>
              {data.size && data.size.length > 0 ? (
                data.size.map((size) => (
                  <div
                    key={size}
                    className={style(selectedSize === size)}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </div>
                ))
              ) : (
                <p className="text-white">No sizes available</p>
              )}
            </div>

            {/* GSM Selection */}
            <b className="text-sm">GSM</b>
            <div className={divStyle}>
              {data.gsm && data.gsm.length > 0 ? (
                data.gsm.map((gsmValue) => (
                  <div
                    key={gsmValue}
                    className={style(selectedGSM === gsmValue)}
                    onClick={() => setSelectedGSM(gsmValue)}
                  >
                    {gsmValue}
                  </div>
                ))
              ) : (
                <p className="text-white">No GSMs available</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-white">Loading product options...</p>
      )}

      {/* Drive Link Input */}
      <div className="flex items-center justify-evenly w-full -mt-10 -mb-10">
        <h1 className="text-white text-lg text-left mt-10 mb-10 w-full">
          Paste the drive link
        </h1>
        <span className="w-1/3">
          <Modal />
        </span>
      </div>
      <input
        type="text"
        placeholder="Paste the drive link"
        value={driveLink}
        onChange={(e) => setDriveLink(e.target.value)}
        className="w-full bg-transparent rounded-md border border-stroke py-[10px] px-5 text-white outline-none transition focus:border-primary active:border-primary"
      />
      <div className='lg:flex sm:grid items-center justify-evenly'>
        <div className='grid items-center sm:w-full md:w-1/2 lg:w-1/2 m-2'>
          <h1 className="text-white text-lg text-left mt-10 mb-10 w-full">
            Front print size in sq.inch
          </h1>
          <input
            type="text"
            placeholder="Front print size in sq.inch(12X16,.....)"
            value={frontPrint}
            onChange={(e) => setFrontPrint(e.target.value)}
            className="w-full bg-transparent rounded-md border border-stroke py-[10px] px-5 text-white outline-none transition focus:border-primary active:border-primary"
          />
        </div>
        <div className='grid items-center sm:w-full md:w-1/2 lg:w-1/2 m-2'>
          <h1 className="text-white text-lg text-left mt-10 mb-10 w-full">
            Back print size in sq.inch
          </h1>
          <input
            type="text"
            placeholder="Back print size in sq.inch(12X16,.....)"
            value={backPrint}
            onChange={(e) => setBackPrint(e.target.value)}
            className="w-full bg-transparent rounded-md border border-stroke py-[10px] px-5 text-white outline-none transition focus:border-primary active:border-primary"
          />
        </div>
        <div className='grid items-center sm:w-full md:w-1/2 lg:w-1/2 m-2'>
          <h1 className="text-white text-lg text-left mt-10 mb-10 w-full">
            Left side print size in sq.inch
          </h1>
          <input
            type="text"
            placeholder="Left side print size in sq.inch(4X6,.....)"
            value={leftSidePrint}
            onChange={(e) => setLeftSidePrint(e.target.value)}
            className="w-full bg-transparent rounded-md border border-stroke py-[10px] px-5 text-white outline-none transition focus:border-primary active:border-primary"
          />
                </div>
        <div className='grid items-center sm:w-full md:w-1/2 lg:w-1/2 m-2'>
          <h1 className="text-white text-lg text-left mt-10 mb-10 w-full">
            Right side print size in sq.inch
          </h1>
          <input
            type="text"
            placeholder="Right side print size in sq.inch(4X6,.....)"
            value={rightSidePrint}
            onChange={(e) => setRightSidePrint(e.target.value)}
            className="w-full bg-transparent rounded-md border border-stroke py-[10px] px-5 text-white outline-none transition focus:border-primary active:border-primary"
          />
        </div>
      </div>
      {/* Navigation Buttons */}
      <div className="flex mt-5">
        <button
          onClick={stepDec}
          className="mr-5 p-2 w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489]"
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          className="p-2 w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489]"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default SelectOptions;
