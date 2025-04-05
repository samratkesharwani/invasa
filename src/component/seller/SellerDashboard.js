import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import ExploreProducts from '../../component/form/ExploreProducts';
import OrderDetailsModal from './OrderDetailsModal';
import { FaBox, FaClock, FaWallet, FaSearch, FaPlus, FaUser, FaRegBell, FaRegStar, FaExclamationTriangle, FaEye } from 'react-icons/fa';
import IconContainer from '../../component/IconContainer';

function BuyerDashboard({ isDarkMode }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [form, setForm] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [totalSpent, setTotalSpent] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
      if (sessionError || !session || !session.user) {
          throw new Error("No user session found. Please log in again.");
      }
  
      const userId = session.user.id;
  
        // Fetch user profile
        const { data: userProfile, error: userProfileError } = await supabase
          .from("profile")
          .select("id, name, role, email")
          .eq("id", userId)
          .single();
  
        if (userProfileError) {
          throw userProfileError;
        }
  
        // Fetch brands onboard form
        const { data: brandsOnboardForm, error: brandsOnboardFormError } = await supabase
          .from("brandsOnboardForm")
          .select("id")
          .eq("id", userId)
          .single();
  
        // Set form state if user ID is found
        if (brandsOnboardForm?.id) {
          setForm(true);
        }
       
        setName(userProfile.name);
        setRole(userProfile.role);

        // Fetch orders with detailed information
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("sellerId", userId);
        
        if (ordersError) {
          throw ordersError;
        }
        
        let total = orders.length;
        let pending = orders.filter(order => order.status?.toLowerCase() === "pending").length;
        let completed = orders.filter(order => order.status?.toLowerCase() === "completed").length;
        
        // Calculate total spent
        let spent = orders.reduce((sum, order) => {
          const amount = parseFloat(order.paymentAmount || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        
        setTotalOrders(total);
        setPendingOrders(pending);
        setCompletedOrders(completed);
        setTransactions(orders);
        setTotalSpent(spent);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserProfile();
  }, []);
  
  const navigateToOrder = () => {
    navigate('/order');
  };

  const navigateToCreateOrder = () => {
    navigate('/order');
  };

  // Filter transactions based on search term and status
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === "" || 
      (transaction.id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.selectedCity?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.paymentAmount?.toString().includes(searchTerm));
    
    const matchesStatus = filterStatus === "all" || 
      (transaction.status?.toLowerCase() === filterStatus.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    if (amount === "NaN") return "₹NaN";
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-[#f5f9fa]'} mt-10 grid place-items-center mx-auto`}>
      {/* Enhanced Header Section with Glass Effect */}
      <div className={`${isDarkMode 
        ? 'bg-black bg-opacity-60 backdrop-blur-lg border-gray-800' 
        : 'bg-white backdrop-blur-lg border-gray-200'} border-b w-[90%] rounded-2xl`}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="relative">
                <div className="absolute inset-0 bg-[#00E0A4] opacity-10 blur-xl rounded-full"></div>
                <div className="flex items-center justify-center w-12 h-12">
                  <IconContainer
                    icon={<FaUser className="m-1.5" />}
                    isDarkMode={isDarkMode}
                    size="md"
                    color="teal"
                  />
                </div>
              </div>
              <div className="ml-6">
                <h1 className={`text-3xl font-bold ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent' 
                    : 'text-gray-900'
                }`}>
                  Welcome back, {name || "there"}!
                </h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mt-2 text-lg`}>
                  Your personal shopping dashboard
                </p>
              </div>
            </div>
            <button 
              onClick={navigateToCreateOrder} 
              className="bg-gradient-to-r from-[#00E0A4] to-[#0BB489] hover:from-[#0BB489] hover:to-[#00E0A4] text-black font-semibold py-3 px-8 rounded-xl flex items-center text-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(0,224,164,0.3)]"
            >
              <FaPlus className="mr-3" /> Create Order
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Enhanced Spacing and Glass Effect */}
      <div className="container mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full"></div>
              <div className="relative animate-spin rounded-full h-20 w-20 border-4 border-[#00E0A4] border-t-transparent"></div>
            </div>
          </div>
        ) : error ? (
          <div className={`${isDarkMode 
            ? 'bg-black bg-opacity-60 backdrop-blur-lg text-red-200 border-red-800' 
            : 'bg-white text-red-600 border-red-300'} p-8 rounded-2xl mb-8 shadow-lg border`}>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 mr-6">
                <IconContainer
                  icon={<FaRegBell />}
                  isDarkMode={isDarkMode}
                  size="md"
                  color="red"
                />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Error</h3>
                <p className="text-lg">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {!form ? (
              <div className={`${isDarkMode 
                ? 'bg-black bg-opacity-60 backdrop-blur-lg border-gray-800' 
                : 'bg-white backdrop-blur-lg border-gray-200'} 
                rounded-2xl p-10 mb-12 shadow-lg border`}>
                <div className="flex items-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full"></div>
                    <div className="flex items-center justify-center w-12 h-12">
                      <IconContainer
                        icon={<FaUser />}
                        isDarkMode={isDarkMode}
                        size="md"
                        color="teal"
                      />
                    </div>
                  </div>
                  <div className="ml-8">
                    <h2 className={`text-3xl font-bold ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent' 
                        : 'text-gray-900'
                    }`}>Complete Your Profile</h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-700'} text-lg mt-2`}>Unlock a personalized shopping experience</p>
                  </div>
                </div>
                <div className={`${isDarkMode 
                  ? 'bg-black bg-opacity-50 border-gray-800' 
                  : 'bg-gray-50 border-gray-200'} p-8 rounded-xl border`}>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-lg mb-8 leading-relaxed`}>
                    Take a moment to complete your profile and discover tailored recommendations, exclusive offers, and a seamless shopping experience designed just for you.
                  </p>
                  <ExploreProducts isDarkMode={isDarkMode} />
                </div>
              </div>
            ) : (
              <>
                {/* Quick Stats with Glass Effect */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <StatCard 
                    icon={<FaBox className="m-1.5" />} 
                    label="Total Orders" 
                    value={totalOrders}
                    isDarkMode={isDarkMode}
                  />
                  <StatCard 
                    icon={<FaClock className="m-1.5" />} 
                    label="Pending Orders" 
                    value={pendingOrders}
                    isDarkMode={isDarkMode}
                  />
                  <StatCard 
                    icon={<FaWallet className="m-1.5" />} 
                    label="Total Spent" 
                    value={formatCurrency(totalSpent)}
                    isDarkMode={isDarkMode}
                  />
                </div>
                
                {/* Transactions Table */}
                <div className={isDarkMode ? "bg-black bg-opacity-60 backdrop-blur-lg border border-gray-800 rounded-2xl p-6 mt-6 overflow-hidden" : "bg-white border border-gray-200 rounded-2xl p-6 mt-6 shadow-lg overflow-hidden"}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className={isDarkMode ? "text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent" : "text-xl md:text-2xl font-bold text-gray-900"}>
                      Recent Orders
                    </h2>
                    
                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaSearch className={isDarkMode ? "text-gray-500" : "text-gray-400"} />
                        </div>
                        <input
                          type="text"
                          placeholder="Search orders..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`pl-10 pr-4 py-2 w-full rounded-xl ${
                            isDarkMode
                              ? "bg-dark-1 border-gray-700 text-gray-300 focus:border-[#00E0A4]"
                              : "bg-gray-50 border-gray-200 text-gray-700 focus:border-[#00E0A4]"
                          } border outline-none focus:ring-2 focus:ring-[#00E0A4] focus:ring-opacity-50`}
                        />
                      </div>
                      
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={`py-2 px-4 rounded-xl ${
                          isDarkMode
                            ? "bg-dark-1 border-gray-700 text-gray-300"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        } border outline-none focus:ring-2 focus:ring-[#00E0A4] focus:ring-opacity-50 w-full sm:w-auto`}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {filteredTransactions.length === 0 ? (
                    <div className={isDarkMode ? "text-center py-8 bg-dark-1 bg-opacity-50 rounded-xl" : "text-center py-8 bg-gray-50 rounded-xl"}>
                      <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>No orders found matching your criteria</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Order ID
                              </th>
                              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Date
                              </th>
                              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                City
                              </th>
                              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Amount
                              </th>
                              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Status
                              </th>
                              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredTransactions.map((transaction) => (
                              <tr 
                                key={transaction.id} 
                                className={isDarkMode ? "hover:bg-gray-900 transition-colors" : "hover:bg-gray-50 transition-colors"}
                              >
                                <td className={`px-4 py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                  #{transaction.id}
                                </td>
                                <td className={`px-4 py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                  {formatDate(transaction.date)}
                                </td>
                                <td className={`px-4 py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                  {transaction.selectedCity || 'N/A'}
                                </td>
                                <td className={`px-4 py-4 text-sm font-medium ${isDarkMode ? "text-[#00E0A4]" : "text-[#0BB489]"}`}>
                                  {formatCurrency(transaction.paymentAmount)}
                                </td>
                                <td className="px-4 py-4">
                                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    transaction.status?.toLowerCase() === 'pending' ? (isDarkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800') : 
                                    transaction.status?.toLowerCase() === 'completed' ? (isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800') : 
                                    transaction.status?.toLowerCase() === 'cancelled' ? (isDarkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800') :
                                    transaction.status?.toLowerCase() === 'processing' ? (isDarkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800') :
                                    (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')
                                  }`}>
                                    {transaction.status || 'Unknown'}
                                  </span>
                                </td>
                                <td className={`px-4 py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(transaction);
                                      navigate(`/order/${transaction.id}`);
                                    }}
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

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {filteredTransactions.map((transaction) => (
                          <div 
                            key={transaction.id} 
                            className={`rounded-xl p-4 ${isDarkMode ? "bg-gray-900 bg-opacity-40" : "bg-gray-50"} transition-all`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                  #{transaction.id}
                                </span>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  {formatDate(transaction.date)}
                                </p>
                              </div>
                              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                                transaction.status?.toLowerCase() === 'pending' ? (isDarkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800') : 
                                transaction.status?.toLowerCase() === 'completed' ? (isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800') : 
                                transaction.status?.toLowerCase() === 'cancelled' ? (isDarkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800') :
                                transaction.status?.toLowerCase() === 'processing' ? (isDarkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800') :
                                (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')
                              }`}>
                                {transaction.status || 'Unknown'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>City</p>
                                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                  {transaction.selectedCity || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Amount</p>
                                <p className={`text-sm font-medium ${isDarkMode ? "text-[#00E0A4]" : "text-[#0BB489]"}`}>
                                  {formatCurrency(transaction.paymentAmount)}
                                </p>
                              </div>
                            </div>

                            {transaction.customerInfo?.customerName && (
                              <div className="mb-3">
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Customer</p>
                                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                  {transaction.customerInfo.customerName}
                                </p>
                              </div>
                            )}

                            <button
                              onClick={() => {
                                setSelectedOrder(transaction);
                                navigate(`/order/${transaction.id}`);
                              }}
                              className="w-full mt-2 py-2 px-4 bg-secondary bg-opacity-10 hover:bg-opacity-20 rounded-lg text-secondary text-sm font-medium transition-colors duration-200 flex items-center justify-center"
                            >
                              <FaEye className="mr-2" /> View Details
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, isDarkMode }) => (
  <div className={`${isDarkMode 
    ? 'bg-black bg-opacity-60 border-gray-800' 
    : 'bg-white border-gray-200'} 
    rounded-xl p-6 shadow-md border transition duration-300 hover:shadow-lg`}>
    <div className="flex items-center">
      <div className="flex items-center justify-center w-12 h-12 mr-4">
        <IconContainer
          icon={icon}
          isDarkMode={isDarkMode}
          size="md"
          color="teal"
        />
      </div>
      <div>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{label}</p>
        <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  </div>
);

export default BuyerDashboard;
