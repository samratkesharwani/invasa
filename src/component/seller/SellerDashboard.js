import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import ExploreProducts from '../../component/form/ExploreProducts';
import { FaBox, FaClock, FaWallet, FaSearch, FaPlus, FaUser, FaRegBell, FaRegStar, FaExclamationTriangle } from 'react-icons/fa';

function BuyerDashboard() {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Enhanced Header Section with Glass Effect */}
      <div className="bg-black bg-opacity-60 backdrop-blur-lg border-b border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="relative">
                <div className="absolute inset-0 bg-[#00E0A4] opacity-10 blur-xl rounded-full"></div>
                <div className="relative bg-black bg-opacity-50 p-4 rounded-full border border-[#00E0A4]">
                  <FaUser className="text-[#00E0A4] text-2xl" />
                </div>
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Welcome back, {name || "there"}!
                </h1>
                <p className="text-gray-400 mt-2 text-lg">
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
          <div className="bg-black bg-opacity-60 backdrop-blur-lg text-red-200 p-8 rounded-2xl mb-8 shadow-2xl border border-red-800">
            <div className="flex items-center">
              <div className="bg-red-900 bg-opacity-50 p-4 rounded-full mr-6">
                <FaRegBell className="text-red-200 text-2xl" />
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
              <div className="bg-black bg-opacity-60 backdrop-blur-lg rounded-2xl p-10 mb-12 shadow-2xl border border-gray-800">
                <div className="flex items-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full"></div>
                    <div className="relative bg-black bg-opacity-50 p-5 rounded-full border border-[#00E0A4]">
                      <FaUser className="text-[#00E0A4] text-3xl" />
                    </div>
                  </div>
                  <div className="ml-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Complete Your Profile</h2>
                    <p className="text-gray-400 text-lg mt-2">Unlock a personalized shopping experience</p>
                  </div>
                </div>
                <div className="bg-black bg-opacity-50 p-8 rounded-xl border border-gray-800">
                  <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    Take a moment to complete your profile and discover tailored recommendations, exclusive offers, and a seamless shopping experience designed just for you.
                  </p>
                  <ExploreProducts />
                </div>
              </div>
            ) : (
              <>
                {/* Quick Stats with Glass Effect */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="bg-black bg-opacity-60 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-800 transition-all duration-300 hover:transform hover:scale-105 group">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full"></div>
                        <div className="relative bg-black bg-opacity-50 p-5 rounded-full border border-[#00E0A4]">
                          <FaBox className="text-[#00E0A4] text-2xl" />
                        </div>
                      </div>
                      <div className="ml-6">
                        <p className="text-gray-400 text-lg">Total Orders</p>
                        <h3 className="text-4xl font-bold text-white mt-2">{totalOrders}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black bg-opacity-60 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-800 transition-all duration-300 hover:transform hover:scale-105 group">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full"></div>
                        <div className="relative bg-black bg-opacity-50 p-5 rounded-full border border-[#00E0A4]">
                          <FaClock className="text-[#00E0A4] text-2xl" />
                        </div>
                      </div>
                      <div className="ml-6">
                        <p className="text-gray-400 text-lg">In Progress</p>
                        <h3 className="text-4xl font-bold text-white mt-2">{pendingOrders}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black bg-opacity-60 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-800 transition-all duration-300 hover:transform hover:scale-105 group">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full"></div>
                        <div className="relative bg-black bg-opacity-50 p-5 rounded-full border border-[#00E0A4]">
                          <FaWallet className="text-[#00E0A4] text-2xl" />
                        </div>
                      </div>
                      <div className="ml-6">
                        <p className="text-gray-400 text-lg">Total Spent</p>
                        <h3 className="text-4xl font-bold text-white mt-2">{formatCurrency(totalSpent)}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Orders Section with Enhanced Glass Effect */}
                <div className="bg-black bg-opacity-60 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden mb-12 border border-gray-800">
                  <div className="p-8 border-b border-gray-800">
                    <div className="flex items-center">
                      <div className="relative mr-6">
                        <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full"></div>
                        <div className="relative bg-black bg-opacity-50 p-4 rounded-full border border-[#00E0A4]">
                          <FaBox className="text-[#00E0A4] text-2xl" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">My Orders</h2>
                        <p className="text-gray-400 text-lg mt-2">View and manage your purchases</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 border-b border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaSearch className="text-gray-400 text-lg" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search orders..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-black bg-opacity-50 text-white text-lg pl-12 pr-6 py-4 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#00E0A4] border border-gray-800 focus:border-[#00E0A4] transition-all duration-300"
                        />
                      </div>
                      
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-black bg-opacity-50 text-white text-lg px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00E0A4] w-full md:w-auto border border-gray-800 focus:border-[#00E0A4] transition-all duration-300"
                      >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  
                  {filteredTransactions.length === 0 ? (
                    <div className="p-20 text-center">
                      <div className="relative inline-block mb-8">
                        <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full"></div>
                        <div className="relative bg-black bg-opacity-50 p-10 rounded-full border border-[#00E0A4]">
                          <FaBox className="text-[#00E0A4] text-6xl" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">No Orders Found</h3>
                      <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
                        We couldn't find any orders matching your criteria. Start your shopping journey by creating a new order.
                      </p>
                      <button 
                        onClick={navigateToCreateOrder}
                        className="bg-gradient-to-r from-[#00E0A4] to-[#0BB489] hover:from-[#0BB489] hover:to-[#00E0A4] text-black font-semibold py-4 px-10 rounded-xl inline-flex items-center text-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(0,224,164,0.3)]"
                      >
                        <FaPlus className="mr-3" /> Create Order
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-400 bg-black bg-opacity-50">
                            <th className="p-6 text-lg font-semibold">Order ID</th>
                            <th className="p-6 text-lg font-semibold">Transaction ID</th>
                            <th className="p-6 text-lg font-semibold">City</th>
                            <th className="p-6 text-lg font-semibold">Date</th>
                            <th className="p-6 text-lg font-semibold">Amount</th>
                            <th className="p-6 text-lg font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.map((transaction, index) => (
                            <tr key={index} className="border-t border-gray-800 hover:bg-black hover:bg-opacity-50 transition-colors duration-300">
                              <td className="p-6 text-lg text-gray-300">
                                {transaction.id ? transaction.id.slice(0, 8) : `#${index + 1}`}
                              </td>
                              <td className="p-6 text-lg text-gray-300">
                                {transaction.transactionId || "N/A"}
                              </td>
                              <td className="p-6 text-lg text-gray-300">
                                {transaction.selectedCity || "Pune"}
                              </td>
                              <td className="p-6 text-lg text-gray-300">
                                {formatDate(transaction.date)}
                              </td>
                              <td className="p-6 text-lg font-medium text-white">
                                {transaction.paymentAmount === "NaN" ? "₹NaN" : formatCurrency(transaction.paymentAmount)}
                              </td>
                              <td className="p-6">
                                <span className={`px-4 py-2 text-sm rounded-xl ${
                                  transaction.status?.toLowerCase() === "completed" ? "bg-green-900 bg-opacity-50 text-green-300 border border-green-700" :
                                  transaction.status?.toLowerCase() === "pending" ? "bg-yellow-900 bg-opacity-50 text-yellow-300 border border-yellow-700" :
                                  "bg-gray-800 bg-opacity-50 text-gray-300 border border-gray-700"
                                }`}>
                                  {transaction.status || "Unknown"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Coming Soon Section with Enhanced Glass Effect */}
                <div className="bg-black bg-opacity-60 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
                  <div className="p-8 border-b border-gray-800">
                    <div className="flex items-center">
                      <div className="relative mr-6">
                        <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full"></div>
                        <div className="relative bg-black bg-opacity-50 p-4 rounded-full border border-[#00E0A4]">
                          <FaRegStar className="text-[#00E0A4] text-2xl" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Recommended For You</h2>
                        <p className="text-gray-400 text-lg mt-2">Personalized product suggestions</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-20 text-center">
                    <div className="relative inline-block mb-8">
                      <div className="absolute inset-0 bg-[#00E0A4] opacity-20 blur-xl rounded-full"></div>
                      <div className="relative bg-black bg-opacity-50 p-10 rounded-full border border-[#00E0A4]">
                        <FaExclamationTriangle className="text-[#00E0A4] text-6xl" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Coming Soon!</h3>
                    <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
                      We're crafting personalized product recommendations based on your preferences and order history. 
                      Stay tuned for an enhanced shopping experience!
                    </p>
                    <button 
                      onClick={navigateToCreateOrder}
                      className="bg-gradient-to-r from-[#00E0A4] to-[#0BB489] hover:from-[#0BB489] hover:to-[#00E0A4] text-black font-semibold py-4 px-10 rounded-xl inline-flex items-center text-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(0,224,164,0.3)]"
                    >
                      <FaPlus className="mr-3" /> Create Order Now
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BuyerDashboard;
