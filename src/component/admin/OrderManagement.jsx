import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 10;

  // Fetch orders with pagination
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Build the query
        let query = supabase
          .from('orders')
          .select('*, businesses(businessName)')
          .order('created_at', { ascending: false });
        
        // Apply status filter if not 'all'
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        // Apply search term if provided
        if (searchTerm) {
          query = query.or(`id.ilike.%${searchTerm}%,customerInfo->>customerName.ilike.%${searchTerm}%`);
        }
        
        // Get total count for pagination
        const { count, error: countError } = await query.count();
        
        if (countError) {
          throw countError;
        }
        
        // Calculate total pages
        const calculatedTotalPages = Math.ceil(count / ordersPerPage);
        setTotalPages(calculatedTotalPages || 1);
        
        // Adjust current page if it exceeds the new total
        if (currentPage > calculatedTotalPages) {
          setCurrentPage(1);
        }
        
        // Apply pagination
        const from = (currentPage - 1) * ordersPerPage;
        const to = from + ordersPerPage - 1;
        
        const { data, error } = await query
          .range(from, to);
        
        if (error) {
          throw error;
        }
        
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [statusFilter, searchTerm, currentPage]);

  // Handle order status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Update selected order if modal is open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  // View order details
  const viewOrderDetails = async (order) => {
    try {
      // Fetch complete order details with related data
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          businesses(businessName, email, contactNumber)
        `)
        .eq('id', order.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      setSelectedOrder(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Failed to load order details');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    return `₹${parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'processing':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is applied via the useEffect
  };

  // Handle pagination
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
        
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder="Search by order ID or customer name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r"
          >
            Search
          </button>
        </form>
      </div>
      
      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded ${statusFilter === 'all' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          All
        </button>
        <button 
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded ${statusFilter === 'pending' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setStatusFilter('processing')}
          className={`px-4 py-2 rounded ${statusFilter === 'processing' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Processing
        </button>
        <button 
          onClick={() => setStatusFilter('completed')}
          className={`px-4 py-2 rounded ${statusFilter === 'completed' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Completed
        </button>
        <button 
          onClick={() => setStatusFilter('cancelled')}
          className={`px-4 py-2 rounded ${statusFilter === 'cancelled' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Cancelled
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-xl">No orders found</p>
          {searchTerm && <p className="mt-2">Try a different search term</p>}
          {statusFilter !== 'all' && <p className="mt-2">Try a different status filter</p>}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{formatDate(order.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{order.customerInfo?.customerName || 'N/A'}</div>
                      <div className="text-sm text-gray-400">{order.customerInfo?.customerContact || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{order.businesses?.businessName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{formatCurrency(order.paymentAmount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => viewOrderDetails(order)}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        View
                      </button>
                      
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusChange(order.id, 'processing')}
                          className="text-yellow-400 hover:text-yellow-300 mr-3"
                        >
                          Process
                        </button>
                      )}
                      
                      {order.status === 'processing' && (
                        <button 
                          onClick={() => handleStatusChange(order.id, 'completed')}
                          className="text-green-400 hover:text-green-300 mr-3"
                        >
                          Complete
                        </button>
                      )}
                      
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <button 
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          className="text-red-400 hover:text-red-300"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-400">
              Showing {orders.length} of {totalPages * ordersPerPage} orders
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-700 text-gray-500' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
              >
                First
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-700 text-gray-500' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
              >
                Prev
              </button>
              
              <div className="px-3 py-1 bg-gray-700 rounded">
                Page {currentPage} of {totalPages}
              </div>
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-700 text-gray-500' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
              >
                Next
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-700 text-gray-500' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
              >
                Last
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Order Information</h3>
                <div className="bg-gray-700 p-4 rounded">
                  <p><span className="text-gray-400">Order ID:</span> {selectedOrder.id}</p>
                  <p><span className="text-gray-400">Date:</span> {formatDate(selectedOrder.created_at)}</p>
                  <p><span className="text-gray-400">Status:</span> 
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p><span className="text-gray-400">Amount:</span> {formatCurrency(selectedOrder.paymentAmount)}</p>
                  <p><span className="text-gray-400">Transaction ID:</span> {selectedOrder.transactionId || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                <div className="bg-gray-700 p-4 rounded">
                  <p><span className="text-gray-400">Name:</span> {selectedOrder.customerInfo?.customerName || 'N/A'}</p>
                  <p><span className="text-gray-400">Contact:</span> {selectedOrder.customerInfo?.customerContact || 'N/A'}</p>
                  <p><span className="text-gray-400">City:</span> {selectedOrder.selectedCity || 'N/A'}</p>
                  <p><span className="text-gray-400">Address:</span> {selectedOrder.fullAddress?.address || 'N/A'}</p>
                  <p><span className="text-gray-400">Pincode:</span> {selectedOrder.fullAddress?.pincode || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Seller Information</h3>
              <div className="bg-gray-700 p-4 rounded">
                <p><span className="text-gray-400">Business Name:</span> {selectedOrder.businesses?.businessName || 'N/A'}</p>
                <p><span className="text-gray-400">Email:</span> {selectedOrder.businesses?.email || 'N/A'}</p>
                <p><span className="text-gray-400">Contact:</span> {selectedOrder.businesses?.contactNumber || 'N/A'}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Product Information</h3>
              <div className="bg-gray-700 p-4 rounded">
                <p><span className="text-gray-400">Product:</span> {selectedOrder.productData?.selectedProduct || 'N/A'}</p>
                <p><span className="text-gray-400">Size:</span> {selectedOrder.productData?.selectedSize || 'N/A'}</p>
                <p><span className="text-gray-400">Color:</span> {selectedOrder.productData?.selectedColor || 'N/A'}</p>
                <p><span className="text-gray-400">GSM:</span> {selectedOrder.productData?.selectedGSM || 'N/A'}</p>
                <p><span className="text-gray-400">Price:</span> {formatCurrency(selectedOrder.productData?.selectedProductPrice)}</p>
                
                {selectedOrder.productData?.driveLink && (
                  <p>
                    <span className="text-gray-400">Drive Link:</span> 
                    <a 
                      href={selectedOrder.productData.driveLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-400 hover:underline"
                    >
                      View Files
                    </a>
                  </p>
                )}
              </div>
            </div>
            
            {/* Print Designs */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Print Designs</h3>
              <div className="bg-gray-700 p-4 rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOrder.productData?.prints?.frontPrint?.image && (
                    <div>
                      <h4 className="font-medium mb-2">Front Print</h4>
                      <img 
                        src={selectedOrder.productData.prints.frontPrint.image} 
                        alt="Front Print" 
                        className="max-w-full h-auto rounded border border-gray-600"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        Size: {selectedOrder.productData.prints.frontPrint.size.width}" × {selectedOrder.productData.prints.frontPrint.size.height}"
                      </p>
                    </div>
                  )}
                  
                  {selectedOrder.productData?.prints?.backPrint?.image && (
                    <div>
                      <h4 className="font-medium mb-2">Back Print</h4>
                      <img 
                        src={selectedOrder.productData.prints.backPrint.image} 
                        alt="Back Print" 
                        className="max-w-full h-auto rounded border border-gray-600"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        Size: {selectedOrder.productData.prints.backPrint.size.width}" × {selectedOrder.productData.prints.backPrint.size.height}"
                      </p>
                    </div>
                  )}
                  
                  {selectedOrder.productData?.prints?.leftSidePrint?.image && (
                    <div>
                      <h4 className="font-medium mb-2">Left Sleeve Print</h4>
                      <img 
                        src={selectedOrder.productData.prints.leftSidePrint.image} 
                        alt="Left Sleeve Print" 
                        className="max-w-full h-auto rounded border border-gray-600"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        Size: {selectedOrder.productData.prints.leftSidePrint.size.width}" × {selectedOrder.productData.prints.leftSidePrint.size.height}"
                      </p>
                    </div>
                  )}
                  
                  {selectedOrder.productData?.prints?.rightSidePrint?.image && (
                    <div>
                      <h4 className="font-medium mb-2">Right Sleeve Print</h4>
                      <img 
                        src={selectedOrder.productData.prints.rightSidePrint.image} 
                        alt="Right Sleeve Print" 
                        className="max-w-full h-auto rounded border border-gray-600"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        Size: {selectedOrder.productData.prints.rightSidePrint.size.width}" × {selectedOrder.productData.prints.rightSidePrint.size.height}"
                      </p>
                    </div>
                  )}
                </div>
                
                {!selectedOrder.productData?.prints?.frontPrint?.image && 
                 !selectedOrder.productData?.prints?.backPrint?.image && 
                 !selectedOrder.productData?.prints?.leftSidePrint?.image && 
                 !selectedOrder.productData?.prints?.rightSidePrint?.image && (
                  <p className="text-center py-4">No print designs available</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              {selectedOrder.status === 'pending' && (
                <button 
                  onClick={() => handleStatusChange(selectedOrder.id, 'processing')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                >
                  Mark as Processing
                </button>
              )}
              
              {selectedOrder.status === 'processing' && (
                <button 
                  onClick={() => handleStatusChange(selectedOrder.id, 'completed')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Mark as Completed
                </button>
              )}
              
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                <button 
                  onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Cancel Order
                </button>
              )}
              
              <button 
                onClick={() => setShowModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement; 