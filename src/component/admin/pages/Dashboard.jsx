import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-dark-2 rounded-lg p-6 flex items-center shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="rounded-full p-4 bg-secondary bg-opacity-20 mr-4">
      {icon}
    </div>
    <div>
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {trend && (
        <p className="text-xs mt-1">
          <span className={trend.value >= 0 ? 'text-green-500' : 'text-red-500'}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-gray-400 ml-1">vs last month</span>
        </p>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSellers: 0,
    pendingSellers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    trends: {
      sellers: 15,
      orders: 23,
      revenue: -5
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all stats in parallel for better performance
      const [
        sellersResponse,
        pendingSellersResponse,
        ordersResponse,
        allOrdersResponse
      ] = await Promise.all([
        // Fetch total sellers
        supabase.from('businessOnboardForm').select('id'),
        
        // Fetch pending sellers
        supabase.from('businessOnboardForm').select('id').eq('status', 'pending'),
        
        // Fetch recent orders with seller info
        supabase.from('orders')
          .select(`
            id, 
            customerInfo,
            paymentAmount,
            status,
            date,
            businessOnboardForm:sellerId (businessName)
          `)
          .order('date', { ascending: false })
          .limit(5),
        
        // Fetch only payment amounts for revenue calculation
        supabase.from('orders').select('paymentAmount')
      ]);

      // Check for errors in any of the responses
      const errors = [
        sellersResponse.error, 
        pendingSellersResponse.error, 
        ordersResponse.error,
        allOrdersResponse.error
      ].filter(Boolean);
      
      if (errors.length > 0) {
        throw new Error(errors[0].message);
      }

      // Calculate total revenue
      const totalRevenue = allOrdersResponse.data?.reduce((sum, order) => 
        sum + (parseFloat(order.paymentAmount || 0)), 0
      ) || 0;

      setStats({
        ...stats,
        totalSellers: sellersResponse.data?.length || 0,
        pendingSellers: pendingSellersResponse.data?.length || 0,
        totalOrders: allOrdersResponse.data?.length || 0,
        totalRevenue,
        recentOrders: ordersResponse.data || []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-20 border border-red-800 text-red-200 p-4 rounded-lg flex items-center">
        <FiAlertCircle className="mr-2" size={20} />
        <span>Error loading dashboard data: {error}</span>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-dark-2 rounded-lg p-6 h-32 animate-pulse">
              <div className="bg-gray-700 h-4 w-1/3 rounded mb-4"></div>
              <div className="bg-gray-700 h-8 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Sellers"
            value={stats.totalSellers}
            icon={<FiUsers className="h-6 w-6 text-secondary" />}
            trend={{value: stats.trends.sellers}}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<FiShoppingBag className="h-6 w-6 text-secondary" />}
            trend={{value: stats.trends.orders}}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={<FiDollarSign className="h-6 w-6 text-secondary" />}
            trend={{value: stats.trends.revenue}}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingSellers}
            icon={<FiTrendingUp className="h-6 w-6 text-secondary" />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-dark-2 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Orders</h2>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="pb-4">Order ID</th>
                    <th className="pb-4">Customer</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-800 hover:bg-dark-3 transition-colors">
                      <td className="py-4 text-white">#{order.id.substring(0, 8)}</td>
                      <td className="py-4 text-white">
                        {order.customerInfo?.customerName || 'N/A'}
                      </td>
                      <td className="py-4 text-white">
                        ₹{parseFloat(order.paymentAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'completed' ? 'bg-green-900 text-green-200' :
                          order.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-red-900 text-red-200'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">No orders found</p>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="bg-dark-2 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Pending Seller Approvals</h2>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded mb-4 w-3/4"></div>
              <div className="h-10 bg-gray-700 rounded w-1/3"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.pendingSellers > 0 ? (
                <>
                  <p className="text-yellow-400">
                    You have {stats.pendingSellers} seller{stats.pendingSellers !== 1 ? 's' : ''} waiting for approval
                  </p>
                  <a href="/admin/sellers" className="inline-block bg-secondary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors">
                    Review Approvals
                  </a>
                </>
              ) : (
                <p className="text-green-400">No pending approvals</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 