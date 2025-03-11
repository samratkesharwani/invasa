import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import PrintViewer from '../../components/PrintViewer';

const BrandsDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('sellerId', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process orders to ensure print data is properly formatted
      const processedOrders = orders.map(order => {
        // Handle print data
        let processedPrints = [];
        
        // Try to parse printData if it exists
        if (order.printData && Array.isArray(order.printData)) {
          processedPrints = order.printData.map(print => ({
            imageUrl: print.image,
            area: print.area || 0,
            position: print.position || print.side || 'Front',
            designDetails: {
              width: print.width || (print.size ? print.size.width : 0),
              height: print.height || (print.size ? print.size.height : 0),
              x: print.x || (print.position ? print.position.x : 0),
              y: print.y || (print.position ? print.position.y : 0)
            }
          }));
        } else if (order.processedPrints) {
          // If processedPrints already exists, use it
          processedPrints = order.processedPrints;
        }
        
        return {
          ...order,
          processedPrints
        };
      });
      
      setOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProductName = (order) => {
    return order.productData?.selectedProduct || 
           order.product_name || 
           'Product';
  };

  const viewOrderDetails = (order) => {
    // Ensure print data is properly formatted before showing the modal
    let processedPrints = [];
    
    if (order.printData && Array.isArray(order.printData)) {
      processedPrints = order.printData.map(print => ({
        imageUrl: print.image,
        area: print.area || 0,
        position: print.position || print.side || 'Front',
        designDetails: {
          width: print.width || (print.size ? print.size.width : 0),
          height: print.height || (print.size ? print.size.height : 0),
          x: print.x || (print.position ? print.position.x : 0),
          y: print.y || (print.position ? print.position.y : 0)
        }
      }));
    } else if (order.processedPrints) {
      processedPrints = order.processedPrints;
    }
    
    setSelectedOrder({
      ...order,
      processedPrints
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Orders</h1>

      {loading ? (
        <div className="text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mr-3"></div>
          <span>Loading orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-white text-center p-8 bg-gray-800 rounded-lg">
          <p className="text-xl">No orders found</p>
          <p className="text-gray-400 mt-2">When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-200 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-200 uppercase tracking-wider">
                  Order Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-200 uppercase tracking-wider">
                  View Order
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-white">
                    {getProductName(order)}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {order.status || 'pending'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      View Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Order #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Customer Details
                  </h3>
                  <div className="space-y-2 text-gray-300">
                    <p>Name: {selectedOrder.customerName || 'N/A'}</p>
                    <p>Email: {selectedOrder.customerEmail || 'N/A'}</p>
                    <p>Phone: {selectedOrder.customerPhone || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Order Summary
                  </h3>
                  <div className="space-y-2 text-gray-300">
                    <p>Product: {selectedOrder.productData?.selectedProduct || selectedOrder.product_name || 'N/A'}</p>
                    <p>Size: {selectedOrder.productData?.selectedSize || selectedOrder.size || 'N/A'}</p>
                    <p>Color: {selectedOrder.productData?.selectedColor || selectedOrder.color || 'N/A'}</p>
                    <p>Quantity: {selectedOrder.productData?.quantity || selectedOrder.quantity || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Print Designs */}
              {selectedOrder.processedPrints && selectedOrder.processedPrints.length > 0 ? (
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Print Designs
                  </h3>
                  <PrintViewer prints={selectedOrder.processedPrints} />
                </div>
              ) : selectedOrder.printData && selectedOrder.printData.length > 0 ? (
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Print Designs
                  </h3>
                  <div className="text-gray-300">
                    <p>Print data available but needs processing. Please refresh the page.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Print Designs
                  </h3>
                  <div className="text-gray-300">
                    <p>No print designs available for this order.</p>
                  </div>
                </div>
              )}

              {/* Payment Details */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Payment Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-gray-300">
                  <div>
                    <p className="font-medium">Product Price:</p>
                    <p>{formatCurrency(selectedOrder.productPrice)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Print Price:</p>
                    <p>{formatCurrency(selectedOrder.printPrice)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Shipping:</p>
                    <p>{formatCurrency(selectedOrder.shippingCost)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Total Amount:</p>
                    <p>{formatCurrency(selectedOrder.paymentAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandsDashboard; 