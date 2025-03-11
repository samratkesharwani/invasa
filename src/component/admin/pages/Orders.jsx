import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { FiDownload, FiEye, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('orders')
        .select(`
          id,
          sellerId,
          brandId,
          selectedCity,
          customerInfo,
          coordinates,
          fullAddress,
          productData,
          paymentAmount,
          transactionId,
          status,
          date,
          businessOnboardForm:sellerId (businessName, email, contactNumber)
        `)
        .order('date', { ascending: false });
      
      // Apply filter if not 'all'
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setOrders(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setProcessingAction(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Close modal if open
      if (showModal && selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      alert(`Error updating order status: ${err.message}`);
    } finally {
      setProcessingAction(false);
    }
  };

  const downloadPrintDesign = async (url) => {
    if (!url) return;
    
    try {
      // Open the image in a new tab
      window.open(url, '_blank');
    } catch (err) {
      alert(`Error downloading design: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const ViewModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-2 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-dark-2 z-10">
          <h2 className="text-xl font-semibold text-white">Order Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-gray-400 mb-2">Order ID</h3>
              <p className="text-white font-mono">{order.id}</p>
            </div>
            <div>
              <h3 className="text-gray-400 mb-2">Status</h3>
              <span className={`px-3 py-1 rounded-full text-sm inline-block ${
                order.status === 'completed' ? 'bg-green-900 text-green-200' :
                order.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                'bg-red-900 text-red-200'
              }`}>
                {order.status || 'pending'}
              </span>
            </div>
            <div>
              <h3 className="text-gray-400 mb-2">Date</h3>
              <p className="text-white">{formatDate(order.date)}</p>
            </div>
            <div>
              <h3 className="text-gray-400 mb-2">Amount</h3>
              <p className="text-white">₹{parseFloat(order.paymentAmount || 0).toLocaleString()}</p>
            </div>
          </div>
          
          {/* Customer Info */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Customer Information</h3>
            <div className="bg-dark-3 p-4 rounded-lg">
              <p className="text-white"><span className="text-gray-400">Name:</span> {order.customerInfo?.customerName || 'N/A'}</p>
              <p className="text-white"><span className="text-gray-400">Email:</span> {order.customerInfo?.customerEmail || 'N/A'}</p>
              <p className="text-white"><span className="text-gray-400">Phone:</span> {order.customerInfo?.customerPhone || 'N/A'}</p>
            </div>
          </div>
          
          {/* Seller Info */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Seller Information</h3>
            <div className="bg-dark-3 p-4 rounded-lg">
              <p className="text-white"><span className="text-gray-400">Business:</span> {order.businessOnboardForm?.businessName || 'N/A'}</p>
              <p className="text-white"><span className="text-gray-400">Email:</span> {order.businessOnboardForm?.email || 'N/A'}</p>
              <p className="text-white"><span className="text-gray-400">Phone:</span> {order.businessOnboardForm?.contactNumber || 'N/A'}</p>
            </div>
          </div>
          
          {/* Product Details */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Product Details</h3>
            <div className="bg-dark-3 p-4 rounded-lg">
              {order.productData ? (
                <div>
                  <p className="text-white"><span className="text-gray-400">Product:</span> {order.productData.productName || 'N/A'}</p>
                  <p className="text-white"><span className="text-gray-400">Size:</span> {order.productData.size || 'N/A'}</p>
                  <p className="text-white"><span className="text-gray-400">Color:</span> {order.productData.color || 'N/A'}</p>
                  <p className="text-white"><span className="text-gray-400">Quantity:</span> {order.productData.quantity || 1}</p>
                </div>
              ) : (
                <p className="text-gray-400">No product details available</p>
              )}
            </div>
          </div>
          
          {/* Print Designs */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Print Designs</h3>
            <div className="bg-dark-3 p-4 rounded-lg">
              {order.productData?.printDesigns ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(order.productData.printDesigns).map(([side, url]) => (
                    url && (
                      <div key={side} className="space-y-2">
                        <p className="text-white capitalize">{side} Design</p>
                        <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
                          <img 
                            src={url} 
                            alt={`${side} design`} 
                            className="object-contain w-full h-full"
                          />
                        </div>
                        <button
                          onClick={() => downloadPrintDesign(url)}
                          className="flex items-center text-secondary hover:text-secondary-light"
                        >
                          <FiDownload className="mr-1" /> Download
                        </button>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No print designs available</p>
              )}
            </div>
          </div>
          
          {/* Delivery Address */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Delivery Address</h3>
            <div className="bg-dark-3 p-4 rounded-lg">
              {order.fullAddress ? (
                <div>
                  <p className="text-white">{order.fullAddress.addressLine1}</p>
                  {order.fullAddress.addressLine2 && <p className="text-white">{order.fullAddress.addressLine2}</p>}
                  <p className="text-white">{order.fullAddress.city}, {order.fullAddress.state} {order.fullAddress.pincode}</p>
                </div>
              ) : (
                <p className="text-gray-400">No address information available</p>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-800">
            {order.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange(order.id, 'completed')}
                disabled={processingAction}
                className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiCheck className="mr-2" /> Mark as Completed
              </button>
            )}
            {order.status !== 'cancelled' && (
              <button
                onClick={() => handleStatusChange(order.id, 'cancelled')}
                disabled={processingAction}
                className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiX className="mr-2" /> Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Orders Management</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-secondary text-white' : 'bg-dark-3 text-gray-400'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-secondary text-white' : 'bg-dark-3 text-gray-400'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-secondary text-white' : 'bg-dark-3 text-gray-400'}`}
          >
            Completed
          </button>
          <button 
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1 rounded ${filter === 'cancelled' ? 'bg-secondary text-white' : 'bg-dark-3 text-gray-400'}`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-800 text-red-200 p-4 rounded-lg mb-6 flex items-center">
          <FiAlertCircle className="mr-2" size={20} />
          <span>Error loading orders: {error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-dark-2 rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-dark-2 rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-3">
                <tr className="text-left text-gray-400 text-sm">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-800 hover:bg-dark-3 transition-colors">
                    <td className="p-4 text-white font-mono">#{order.id.substring(0, 8)}</td>
                    <td className="p-4 text-white">{order.customerInfo?.customerName || 'N/A'}</td>
                    <td className="p-4 text-white">₹{parseFloat(order.paymentAmount || 0).toLocaleString()}</td>
                    <td className="p-4 text-white">{formatDate(order.date)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'completed' ? 'bg-green-900 text-green-200' :
                        order.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-red-900 text-red-200'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="text-secondary hover:text-secondary-light"
                        aria-label="View order details"
                      >
                        <FiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-dark-2 rounded-lg p-8 text-center">
          <p className="text-gray-400">No orders found</p>
        </div>
      )}

      {showModal && selectedOrder && (
        <ViewModal
          order={selectedOrder}
          onClose={() => {
            setShowModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default Orders; 