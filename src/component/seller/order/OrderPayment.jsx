import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import QRCode from "react-qr-code";
import Payment from '../../Payment';

function OrderPayment({ handleOrderSubmit, setOrderData, orderData, handleChange }) {
  const [printingPrice, setPrintingPrice] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPrintPrice,setTotalPrintPrice]=useState(0);


  const extractNumber = (printingPrice) => {
    const match = printingPrice.match(/[+-]?([0-9]*[.])?[0-9]+/);
    if (match) {
      return parseFloat(match[0]);
    }
    return null;
  };

  const calculateProduct = (input) => {
    const match = input.match(/(\d+)\s*x\s*(\d+)/);
    if (match) {
      const num1 = parseInt(match[1], 10);
      const num2 = parseInt(match[2], 10);
      const product = num1 * num2;
      return product;
    }
    return null;
  };

  const calculateAmount = () => {
    const frontPrint = calculateProduct(orderData.productData.frontPrint);
    const backPrint = calculateProduct(orderData.productData.backPrint);
    const leftSidePrint = calculateProduct(orderData.productData.leftSidePrint);
    const rightSidePrint = calculateProduct(orderData.productData.rightSidePrint);
    const price = extractNumber(printingPrice);
    const printPrice =((frontPrint + backPrint + leftSidePrint + rightSidePrint) * price);
    setTotalPrintPrice(printPrice)
    orderData.paymentAmount=totalAmount
    return printPrice + orderData.productData.selectedProductPrice + 150;
  };

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const { data: price, error: priceError } = await supabase
          .from('businessOnboardForm')
          .select('printingPrice')
          .eq('id', orderData.sellerId)
          .single();

        if (priceError) {
          throw priceError;
        }
        setPrintingPrice(price.printingPrice);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPricing();
  }, [orderData.sellerId]);

  useEffect(() => {
    setTotalAmount(calculateAmount());
  }, [orderData, printingPrice]);


  return (
    <div className='grid place-items-center '>
    <>
    <div className="mb-4 dark:bg-dark-2 p-4 rounded-lg sm:w-full md:w-1/2 lg:w-1/2 mt-10 ">
          <div className="flex justify-between items-center p-2 m-2">
            <span className="text-white">Printing Price:</span>
            <span className="text-white">₹{totalPrintPrice}</span>
          </div>
          <div className="flex justify-between items-center p-2 m-2">
            <span className="text-white">Cloth Price:</span>
            <span className="text-white">₹{orderData.productData.selectedProductPrice}</span>
          </div>
          <div className="flex justify-between items-center p-2 m-2">
            <span className="text-white">Shipping Charges:</span>
            <span className="text-white">₹{150}</span>
          </div>
          <div className="border-t border-gray-300 my-4"></div>
          <div className="flex justify-between items-center font-bold">
            <span className="text-white">Total Amount:</span>
            <span className="text-white">₹{totalAmount}</span>
          </div>
        </div>
    </>
      <Payment amount={totalAmount} handleOrderSubmit={handleOrderSubmit} />
      {/* <QRCode value={upiString} /> */}
      {/* <button onClick={()=>{console.log(totalAmount)}}>check</button> */}
    </div>
  );
}

export default OrderPayment;