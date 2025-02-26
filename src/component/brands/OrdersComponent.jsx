import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Dialog } from '@headlessui/react';

const OrdersComponent = ({ sellerId }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: ordersData, error } = await supabase
          .from('orders')
          .select('*')
          .eq('sellerId', sellerId);

        if (error) {
          throw error;
        }

        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err.message);
      }
    };

    fetchOrders();
  }, [sellerId]);

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const markAsReadyToDeliver = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', selectedOrder.id);

      if (error) {
        throw error;
      }

      // Refresh orders list
      const { data: updatedOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('sellerId', sellerId);

      setOrders(updatedOrders);
      closeModal();
    } catch (err) {
      console.error('Error updating order status:', err.message);
    }
  };

  return (
    <div className="container mt-10 rounded-lg dark:bg-dark-2 p-5">
      <b>Orders</b>
      <div className="">
        {orders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <div>
            {orders.map((order) => (
              <div key={order.id} className="border-b py-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-medium">{order.productData.selectedProduct}</span>
                  <button
                    onClick={() => openModal(order)}
                    className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700"
                  >
                    View Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedOrder && (
        <Dialog open={isModalOpen} onClose={closeModal} className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <Dialog.Title className="text-xl font-bold mb-4">Order Details</Dialog.Title>
            <div className="mb-4">
              <p className="text-gray-800"><strong>Product:</strong> {selectedOrder.productData.selectedProduct}</p>
              <p className="text-gray-800"><strong>Price:</strong> ₹{selectedOrder.productData.selectedProductPrice}</p>
              <p className="text-gray-800"><strong>Customer:</strong> {selectedOrder.customerInfo.customerName}</p>
              <p className="text-gray-800"><strong>Contact:</strong> {selectedOrder.customerInfo.customerContact}</p>
              <p className="text-gray-800"><strong>Address:</strong> {selectedOrder.fullAddress.address}, {selectedOrder.fullAddress.pincode}</p>
              <p className="text-gray-800"><strong>Status:</strong> {selectedOrder.status}</p>
            </div>
            <button
              onClick={markAsReadyToDeliver}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:bg-green-700"
            >
              Mark as Ready to Deliver
            </button>
            <button
              onClick={closeModal}
              className="w-full mt-4 bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:bg-gray-400"
            >
              Close
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default OrdersComponent;
