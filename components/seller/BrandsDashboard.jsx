import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import OrderDetails from './OrderDetails';

const BrandsDashboard = ({ sellerId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [sellerId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process orders to extract print images
      const processedOrders = data?.map(order => {
        const printImages = [];
        
        // Extract print images from productData.prints
        if (order.productData?.prints) {
          const { frontPrint, backPrint, leftSidePrint, rightSidePrint } = order.productData.prints;
          
          if (frontPrint?.image) {
            printImages.push({ position: 'Front', image: frontPrint.image });
          }
          if (backPrint?.image) {
            printImages.push({ position: 'Back', image: backPrint.image });
          }
          if (leftSidePrint?.image) {
            printImages.push({ position: 'Left', image: leftSidePrint.image });
          }
          if (rightSidePrint?.image) {
            printImages.push({ position: 'Right', image: rightSidePrint.image });
          }
        }
        
        return {
          ...order,
          printImages
        };
      }) || [];
      
      setOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status.toLowerCase()) {
      case 'pending':
        return `${baseClasses} bg-yellow-200 text-yellow-800`;
      case 'completed':
        return `${baseClasses} bg-green-200 text-green-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-200 text-red-800`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-800`;
    }
  };

  return (
    <div className="p-6 bg-dark-1 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Orders Dashboard</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="bg-dark-2 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-dark-3">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Prints</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-dark-4">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.customerInfo?.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.productData?.selectedProduct}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {order.printImages && order.printImages.length > 0 ? (
                          order.printImages.slice(0, 2).map((print, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={print.image} 
                                alt={`${print.position} Print`} 
                                className="h-10 w-10 object-cover rounded border border-gray-700"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 text-center rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                                {print.position}
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No prints</span>
                        )}
                        {order.printImages && order.printImages.length > 2 && (
                          <div className="h-10 w-10 bg-dark-3 rounded flex items-center justify-center text-gray-400 text-xs">
                            +{order.printImages.length - 2}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(order.paymentAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-secondary hover:text-[#0BB489] transition-colors duration-200"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default BrandsDashboard; 