import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import ExploreProducts from '../../component/form/ExploreProducts';

function BrandsDashboard() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [form, setForm] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
      if (sessionError || !session || !session.user) {
        console.error("No user session found.");
        return;
      }
  
      const userId = session.user.id;
  
      try {
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
  
        if (brandsOnboardFormError) {
          throw brandsOnboardFormError;
        }
  
        // Set form state if user ID is found
        if (brandsOnboardForm?.id) {
          setForm(true);
        }
       
        setName(userProfile.name);
        setRole(userProfile.role);

        // Fetch and count orders by status
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("id, status")
          .eq("brandId", userId);
        
        if (ordersError) {
          throw ordersError;
        }
        
        let total = 0;
        let pending = 0;
        let completed = 0;
        
        orders.forEach(order => {
          total += 1;
          if (order.status === "Pending") {
            pending += 1;
          } else if (order.status === "Completed") {
            completed += 1;
          }
        });
        
        setTotalOrders(total);
        setPendingOrders(pending);
        setCompletedOrders(completed);
        
        // Fetch transactions
        const { data: transactions, error: transactionsError } = await supabase
          .from("orders")
          .select("*")
          .eq("brandId", userId);
        
        if (transactionsError) {
          throw transactionsError;
        }
        
        setTransactions(transactions);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };
  
    fetchUserProfile();
  }, []);
  
  const navigateToOrder = () => {
    navigate('/order');
  };

  return (
    <>
      <div className="container">
        <div className="flex justify-evenly items-center">
          <h1 className="text-lg text-white mt-10">
            {!form ? `Please fill out the onboarding form so we can onboard you` : "Welcome! So glad you're here"}, {name}
          </h1>
        </div>
        {!form ? <ExploreProducts /> : ''}
        <div className="border-primary">
          <button onClick={navigateToOrder} className='mt-10 w-full bg-dark-3 rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#1F2A37] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5'>
            Create a order +
          </button>
          <div className="rounded-lg dark:bg-dark p-5 mt-5 w-full flex items-center justify-evenly dark:bg-dark-2">
            <div className="rounded-lg p-3 grid place-items-center w-1/3 m-2 dark:bg-dark-3">
              <b className="text-sm">Total orders</b>
              <br/><b>{totalOrders}</b>
            </div>
            <div className="rounded-lg p-3 grid place-items-center w-1/3 m-2 dark:bg-dark-3">
              <b className="text-sm">Pending orders</b>
              <br/><b>{pendingOrders}</b>
            </div>
            <div className="rounded-lg p-3 grid place-items-center w-1/3 m-2 dark:bg-dark-3">
              <b className="text-sm">Completed orders</b>
              <br/><b>{completedOrders}</b>
            </div>
          </div>
        </div>
        <Transaction transactions={transactions} />
      </div>
    </>
  );
}

export default BrandsDashboard;

const Transaction = ({ transactions }) => {
  return (
    <>
      <div className="container mt-10 rounded-lg dark:bg-dark-2 p-5">
        <b>Transactions</b>
        <div className="">
          {transactions.map((transaction, index) => (
            <div key={index} className="flex items-center justify-center bg-dark-3 mt-2 p-1 rounded-lg">
              <b className="w-1/4 text-sm p-2 m-2">{transaction.productData.selectedProduct}</b>
              <b className="w-1/4 text-sm p-2 m-2">{transaction.status}</b>
              <b className="w-1/4 text-sm p-2 m-2">{transaction.date}</b>
              <b className="w-1/4 text-sm p-2 m-2">{transaction.paymentAmount}</b>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
