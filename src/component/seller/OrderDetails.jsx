import React from 'react';
import PrintViewer from '../../components/PrintViewer';

const OrderDetails = ({ order }) => {
  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Order Details</h2>
      
      {/* Product Information */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-xl text-white mb-4">Product Information</h3>
        <div className="grid grid-cols-2 gap-4 text-white">
          <div>
            <p className="font-semibold">Product:</p>
            <p>{order.productData?.selectedProduct}</p>
          </div>
          <div>
            <p className="font-semibold">Size:</p>
            <p>{order.productData?.selectedSize}</p>
          </div>
          <div>
            <p className="font-semibold">Color:</p>
            <p>{order.productData?.selectedColor}</p>
          </div>
          <div>
            <p className="font-semibold">Quantity:</p>
            <p>{order.productData?.quantity}</p>
          </div>
        </div>
      </div>

      {/* Print Details */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-xl text-white mb-4">Print Details</h3>
        <div className="grid grid-cols-2 gap-4 text-white mb-4">
          <div>
            <p className="font-semibold">Total Print Area:</p>
            <p>{order.totalPrintArea} sq inches</p>
          </div>
          <div>
            <p className="font-semibold">Price per sq inch:</p>
            <p>₹{order.printingPricePerSqInch}</p>
          </div>
          <div>
            <p className="font-semibold">Print Price:</p>
            <p>₹{order.printPrice}</p>
          </div>
        </div>

        {/* Print Images */}
        {order.printImages && order.printImages.length > 0 && (
          <div>
            <h4 className="text-lg text-white mb-4">Print Designs</h4>
            <PrintViewer prints={order.printImages} />
          </div>
        )}
      </div>

      {/* Payment Information */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-xl text-white mb-4">Payment Information</h3>
        <div className="grid grid-cols-2 gap-4 text-white">
          <div>
            <p className="font-semibold">Product Price:</p>
            <p>₹{order.productData?.price}</p>
          </div>
          <div>
            <p className="font-semibold">Print Price:</p>
            <p>₹{order.printPrice}</p>
          </div>
          <div>
            <p className="font-semibold">Shipping:</p>
            <p>₹{order.shippingCost}</p>
          </div>
          <div>
            <p className="font-semibold">Total Amount:</p>
            <p>₹{order.paymentAmount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 