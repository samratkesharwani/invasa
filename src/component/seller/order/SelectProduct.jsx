import React, { useState, useEffect } from 'react';
// Import your images here if needed
import { supabase } from '../../../utils/supabase';
import { useNavigate } from 'react-router-dom';

function SelectProduct({ setOrderData, orderData, handleChange, stepDec, stepInc }) {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: productData, error: productDataError } = await supabase
          .from('businessOnboardForm')
          .select('data')
          .single();

        if (productDataError) {
          throw productDataError;
        }

        if (Array.isArray(productData.data)) {
          // Filter products with quantity greater than 1
          const filteredData = productData.data.filter(
            (item) => Number(item.quantity) > 1
          );
          setData(filteredData);
        } else {
          console.error('Error: Fetched data is not an array.');
        }
        console.log('Fetched Data:', productData);
      } catch (error) {
        console.error('Error fetching products:', error.message);
      }
    };

    fetchProducts();
  }, []);

  const imgStyle = '';
  const divImgStyle =
    'w-[200px] rounded-lg bg-dark-3 p-5 m-2 hover:opacity-55';
  const bImg = 'text-sm';

  const handleProductSelection = (product, price) => {
    setOrderData((prevState) => ({
      ...prevState,
      productData: {
        ...prevState.productData,
        selectedProduct: product,
        selectedProductPrice: Number(price)
      },
    }));
    console.log(orderData);
    if(orderData.productData.selectedProductPrice){

      stepInc(); // Move to next step after selecting a product
    }else{
      alert('try again there was some issue')
    }
  };

  return (
    <>
      <div className="m-4 pb-5 rounded-lg dark:bg-dark-2">
        <div className="container flex items-center justify-evenly w-full">
          <h1 className="text-white text-lg text-center mt-10 mb-10 w-full">
            Select Products
          </h1>
        </div>
        <div className="grid place-items-center">
          <div className="flex items-center justify-evenly flex-wrap">
            {data.map((item, index) => (
              <div
                key={index}
                onClick={() => handleProductSelection(item.name, item.price)}
                className={divImgStyle}
              >
                <img
                  className={imgStyle}
                  src={require(`../../../imgs/${item.name
                    .toLowerCase()
                    .replace(/[\s-]/g, '')}.png`)}
                  alt={item.name.toLowerCase().replace(/[\s-]/g, '')}
                />
                <br />
                <b className={bImg}>{item.name}</b>
                <br />
                <b className={bImg}>Price - {item.price}</b>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={stepDec}
          className="mr-10 ml-10 mt-10 p-2 w-1/4 bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489]"
        >
          Prev
        </button>
      </div>
    </>
  );
}

export default SelectProduct;
