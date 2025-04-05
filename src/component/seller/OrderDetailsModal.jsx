import React from 'react';
import { FaBox, FaUser, FaCalendarAlt, FaTshirt, FaPalette, FaRulerHorizontal, FaHashtag, FaTimes } from 'react-icons/fa';
import IconContainer from '../../component/IconContainer';

const OrderDetailsModal = ({ order, onClose, isDarkMode }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className={`${
        isDarkMode 
          ? 'bg-gray-900 border border-gray-700' 
          : 'bg-white border border-gray-300'
        } rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Order #{order.id && order.id.slice(0, 8)}
            </h2>
            <button
              onClick={onClose}
              className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} 
                p-2 rounded-full hover:bg-gray-100 hover:bg-opacity-10 transition-colors`}
            >
              <IconContainer 
                icon={<FaTimes className="m-0.5" />} 
                isDarkMode={isDarkMode} 
                size="sm" 
                color="gray" 
              />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className={`${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
              } p-5 rounded-lg border`}>
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 mr-3">
                  <IconContainer 
                    icon={<FaUser className="m-0.5" />} 
                    isDarkMode={isDarkMode} 
                    size="sm" 
                    color="teal" 
                  />
                </div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Customer Details
                </h3>
              </div>
              <div className={`space-y-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Name: <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.customerName || 'N/A'}</span></p>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email: <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.customerEmail || 'N/A'}</span></p>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Phone: <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.customerPhone || 'N/A'}</span></p>
              </div>
            </div>

            <div className={`${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
              } p-5 rounded-lg border`}>
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 mr-3">
                  <IconContainer 
                    icon={<FaCalendarAlt className="m-0.5" />} 
                    isDarkMode={isDarkMode} 
                    size="sm" 
                    color="teal" 
                  />
                </div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Order Summary
                </h3>
              </div>
              <div className={`space-y-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Date: <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                </span></p>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Status: <span className={`px-2 py-1 rounded-full text-xs font-medium 
                  ${order.status?.toLowerCase() === 'completed'
                    ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                    : order.status?.toLowerCase() === 'pending'
                    ? isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                    : isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                  }`}>
                  {order.status || 'Pending'}
                </span></p>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Amount: <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{Number(order.paymentAmount || 0).toFixed(2)}
                </span></p>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Transaction ID: <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {order.transactionId || 'N/A'}
                </span></p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className={`${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
            } p-5 rounded-lg border mb-6`}>
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-10 h-10 mr-3">
                <IconContainer 
                  icon={<FaTshirt className="m-0.5" />} 
                  isDarkMode={isDarkMode} 
                  size="sm" 
                  color="teal" 
                />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Product Details
              </h3>
            </div>
            <div className={`space-y-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product: <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {order.productData?.selectedProduct || 'N/A'}
              </span></p>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Color: <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {order.productData?.selectedColor || 'N/A'}
              </span></p>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Size: <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {order.productData?.selectedSize || 'N/A'}
              </span></p>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quantity: <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {order.productData?.quantity || 'N/A'}
              </span></p>
            </div>
          </div>

          {/* Print Designs - Optional based on data structure */}
          {order.processedPrints && order.processedPrints.length > 0 && (
            <div className={`${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
              } p-5 rounded-lg border`}>
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 mr-3">
                  <IconContainer 
                    icon={<FaPalette />} 
                    isDarkMode={isDarkMode} 
                    size="sm" 
                    color="teal" 
                  />
                </div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Print Designs
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.processedPrints.map((print, index) => (
                  <div key={index} className={`${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-700' 
                      : 'bg-white border-gray-200'
                    } border rounded-lg overflow-hidden shadow-sm`}>
                    {print.imageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={print.imageUrl} 
                          alt={`Design ${index + 1}`} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Position: {print.position}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Size: {print.designDetails?.width || 0}px × {print.designDetails?.height || 0}px
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal; 