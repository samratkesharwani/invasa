import React from 'react';

const OrderDetails = ({ order, onClose }) => {
  // Function to download print design
  const downloadPrint = async (imageUrl, printPosition) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `print-${printPosition}-${order.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading print:', error);
      alert('Failed to download print. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-2 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Order Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-dark-3 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Order Information</h3>
            <div className="space-y-2">
              <p className="text-gray-300">Order ID: <span className="text-white">{order.id}</span></p>
              <p className="text-gray-300">Date: <span className="text-white">{new Date(order.created_at).toLocaleDateString()}</span></p>
              <p className="text-gray-300">Status: <span className="text-white">{order.status}</span></p>
              <p className="text-gray-300">Total Amount: <span className="text-white">${order.total_amount}</span></p>
            </div>
          </div>

          <div className="bg-dark-3 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Customer Information</h3>
            <div className="space-y-2">
              <p className="text-gray-300">Name: <span className="text-white">{order.customer_name}</span></p>
              <p className="text-gray-300">Email: <span className="text-white">{order.customer_email}</span></p>
              <p className="text-gray-300">Phone: <span className="text-white">{order.customer_phone}</span></p>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-dark-3 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Product Details</h3>
          <div className="space-y-2">
            <p className="text-gray-300">Product: <span className="text-white">{order.productData?.selectedProduct}</span></p>
            <p className="text-gray-300">Color: <span className="text-white">{order.productData?.selectedColor}</span></p>
            <p className="text-gray-300">Size: <span className="text-white">{order.productData?.selectedSize}</span></p>
            <p className="text-gray-300">Quantity: <span className="text-white">{order.productData?.quantity}</span></p>
          </div>
        </div>

        {/* Print Designs */}
        <div className="bg-dark-3 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Print Designs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Front Print */}
            {order.productData?.prints?.frontPrint?.image && (
              <div className="bg-dark-4 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Front</h4>
                <div className="aspect-w-4 aspect-h-3 mb-3">
                  <img
                    src={order.productData.prints.frontPrint.image}
                    alt="Front Print"
                    className="object-contain rounded-lg"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">Size: <span className="text-white">
                    {order.productData.prints.frontPrint.size.width}" × 
                    {order.productData.prints.frontPrint.size.height}"
                  </span></p>
                  <p className="text-gray-300">Area: <span className="text-white">
                    {order.productData.prints.frontPrint.area} sq in
                  </span></p>
                  <button
                    onClick={() => downloadPrint(order.productData.prints.frontPrint.image, 'front')}
                    className="w-full mt-2 bg-secondary hover:bg-[#0BB489] text-white px-4 py-2 rounded transition-colors duration-200"
                  >
                    Download Print
                  </button>
                </div>
              </div>
            )}

            {/* Back Print */}
            {order.productData?.prints?.backPrint?.image && (
              <div className="bg-dark-4 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Back</h4>
                <div className="aspect-w-4 aspect-h-3 mb-3">
                  <img
                    src={order.productData.prints.backPrint.image}
                    alt="Back Print"
                    className="object-contain rounded-lg"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">Size: <span className="text-white">
                    {order.productData.prints.backPrint.size.width}" × 
                    {order.productData.prints.backPrint.size.height}"
                  </span></p>
                  <p className="text-gray-300">Area: <span className="text-white">
                    {order.productData.prints.backPrint.area} sq in
                  </span></p>
                  <button
                    onClick={() => downloadPrint(order.productData.prints.backPrint.image, 'back')}
                    className="w-full mt-2 bg-secondary hover:bg-[#0BB489] text-white px-4 py-2 rounded transition-colors duration-200"
                  >
                    Download Print
                  </button>
                </div>
              </div>
            )}

            {/* Left Side Print */}
            {order.productData?.prints?.leftSidePrint?.image && (
              <div className="bg-dark-4 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Left Sleeve</h4>
                <div className="aspect-w-4 aspect-h-3 mb-3">
                  <img
                    src={order.productData.prints.leftSidePrint.image}
                    alt="Left Sleeve Print"
                    className="object-contain rounded-lg"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">Size: <span className="text-white">
                    {order.productData.prints.leftSidePrint.size.width}" × 
                    {order.productData.prints.leftSidePrint.size.height}"
                  </span></p>
                  <p className="text-gray-300">Area: <span className="text-white">
                    {order.productData.prints.leftSidePrint.area} sq in
                  </span></p>
                  <button
                    onClick={() => downloadPrint(order.productData.prints.leftSidePrint.image, 'left-sleeve')}
                    className="w-full mt-2 bg-secondary hover:bg-[#0BB489] text-white px-4 py-2 rounded transition-colors duration-200"
                  >
                    Download Print
                  </button>
                </div>
              </div>
            )}

            {/* Right Side Print */}
            {order.productData?.prints?.rightSidePrint?.image && (
              <div className="bg-dark-4 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Right Sleeve</h4>
                <div className="aspect-w-4 aspect-h-3 mb-3">
                  <img
                    src={order.productData.prints.rightSidePrint.image}
                    alt="Right Sleeve Print"
                    className="object-contain rounded-lg"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">Size: <span className="text-white">
                    {order.productData.prints.rightSidePrint.size.width}" × 
                    {order.productData.prints.rightSidePrint.size.height}"
                  </span></p>
                  <p className="text-gray-300">Area: <span className="text-white">
                    {order.productData.prints.rightSidePrint.area} sq in
                  </span></p>
                  <button
                    onClick={() => downloadPrint(order.productData.prints.rightSidePrint.image, 'right-sleeve')}
                    className="w-full mt-2 bg-secondary hover:bg-[#0BB489] text-white px-4 py-2 rounded transition-colors duration-200"
                  >
                    Download Print
                  </button>
                </div>
              </div>
            )}

            {/* Show message if no prints */}
            {!order.productData?.prints?.frontPrint?.image && 
             !order.productData?.prints?.backPrint?.image && 
             !order.productData?.prints?.leftSidePrint?.image && 
             !order.productData?.prints?.rightSidePrint?.image && (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-400">No print designs for this order</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 