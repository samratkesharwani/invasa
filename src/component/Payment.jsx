import React from 'react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentComponent = ({ amount, handleOrderSubmit }) => {
  const handlePayment = async () => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      const response = await fetch('https://backendforinvasa.vercel.app/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amount }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const order = await response.json();

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Replace with your actual Razorpay key id
        amount: order.amount,
        currency: 'INR',
        name: 'Invasa Link',
        description: 'Print on demand order transaction',
        order_id: order.id,
        handler:async function (response) {
          alert('Payment Successful!')
          await handleOrderSubmit()  // Call the handleSubmit function passed as a prop
          console.log(response);
        },
        theme: {
          color: '#F37254',
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      alert('Oops! Something went wrong.\nPayment Failed');
      console.error('Payment Error:', error);
    }
  };

  return (
    <div>
      <button
        className='bg-secondary border-secondary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#0BB489] hover:border-[#0BB489] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5'
        onClick={handlePayment}
      >
        Pay Now
      </button>
    </div>
  );
};

export default PaymentComponent;
