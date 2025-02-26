import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import ExploreProducts from '../../component/form/ExploreProducts';
import Modal from '../../component/element/Modal';
import Seller from '../../component/form/Seller';
import OrdersComponent from './OrdersComponent'; // Make sure to import the OrdersComponent

function BrandsDashboard() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [form, setForm] = useState(false);
  const [session, setSession] = useState(null); // Define session state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      setSession(session); // Set session state

      if (sessionError || !session || !session.user) {
        console.error("No user session found.");
        return;
      }

      const userId = session.user.id;

      try {
        const { data: userProfile, error: userProfileError } = await supabase
          .from("profile")
          .select("id, name, role, email")
          .eq("id", userId)
          .single();

        if (userProfileError) {
          throw userProfileError;
        }

        const { data: businessOnboardForm, error: businessOnboardFormError } = await supabase
          .from("businessOnboardForm")
          .select("id")
          .eq("id", userId)
          .single();

        if (businessOnboardFormError) {
          throw businessOnboardFormError;
        }

        if (businessOnboardForm?.id) {
          setForm(true);
        }

        setName(userProfile.name);
        setRole(userProfile.role);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <>
      <div className="container">
        <div className="flex justify-evenly items-center">
          <h1 className="text-lg text-white mt-10">{!form ? `Please fill out the onboarding form so we can onboard you` : "Welcome! So glad you're here"}, {name}</h1>
        </div>
        {!form ? <Seller /> : ''}

        {session && <OrdersComponent sellerId={session.user.id} />} {/* Ensure session is set */}

        <div className="border-primary">
          <div className="container mt-10 rounded-lg dark:bg-dark-2 p-5 mb-10">
            <b>Orders</b>
          </div>
          <div className="rounded-lg dark:bg-dark p-5 mt-5 w-full flex items-center justify-evenly dark:bg-dark-2">
            <div className="rounded-lg p-3 grid place-items-center w-1/3 m-2 dark:bg-dark-3">
              <b className="text-sm">Total orders</b>
              <br />
              <b>3</b>
            </div>
            <div className="rounded-lg p-3 grid place-items-center w-1/3 m-2 dark:bg-dark-3">
              <b className="text-sm">Pending orders</b>
              <br />
              <b>3</b>
            </div>
            <div className="rounded-lg p-3 grid place-items-center w-1/3 m-2 dark:bg-dark-3">
              <b className="text-sm">Completed orders</b>
              <br />
              <b>3</b>
            </div>
          </div>
        </div>
        <Transaction />
      </div>
    </>
  );
}

export default BrandsDashboard;
const Transaction = () => {
  return (
    <>
      <div className="container mt-10 rounded-lg dark:bg-dark-2 p-5">
        <b>Transactions</b>
        <div className="">
          <div className="flex items-center justify-center bg-dark-3 mt-4 p-3 rounded-lg">
            <b className="w-1/4 p-2 text-sm m-2">Product</b>
            <b className="w-1/4 p-2 text-sm m-2">Order Status</b>
            <b className="w-1/4 p-2 text-sm m-2">Date</b>
            <b className="w-1/4 p-2 text-sm m-2">Amount</b>
          </div>
          <div className="flex items-center justify-center bg-dark-3 mt-2 p-1 rounded-lg">
            <b className="w-1/4 text-sm p-2 m-2">T-shirt</b>
            <b className="w-1/4 text-sm p-2 m-2">Pending</b>
            <b className="w-1/4 text-sm p-2 m-2">22/01/2025</b>
            <b className="w-1/4 text-sm p-2 m-2">566</b>
          </div>
          <div className="flex items-center justify-center bg-dark-3 mt-2 p-1 rounded-lg">
            <b className="w-1/4 text-sm p-2 m-2">T-shirt</b>
            <b className="w-1/4 text-sm p-2 m-2">Pending</b>
            <b className="w-1/4 text-sm p-2 m-2">22/01/2025</b>
            <b className="w-1/4 text-sm p-2 m-2">566</b>
          </div>
        </div>
      </div>
    </>
  );
};
