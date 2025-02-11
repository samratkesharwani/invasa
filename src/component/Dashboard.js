import React, { useEffect, useState } from "react";
import { useAuth } from "../component/AuthProvider";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";
import CreatePost from "./CreatePost";
const Dashboard = () => {
  const [fullName, setFullName] = useState(null);
  const [loading, setLoading] = useState(true);
  const authUser = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const gettingInfo = async () => {
      const { data: user, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Auth error:", error);
        setLoading(false);
        return;
      }
      // console.log("User:", user.user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("name")
        .eq("id", user.user.id)
        .single();
        if (profileError && profileError.message.includes("invalid input syntax for type uuid: \"undefined\"")) {
          console.error("User ID is undefined");
          // Handle the error appropriately
      }
      if (profileError) {
        console.error("Profile fetch error:", profileError);
      } else {
        setFullName(profile.name);
      }
      setLoading(false);
    };
    gettingInfo();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (!authUser) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome, {authUser.email}!</h1>
      <h2>{fullName}</h2>
      <CreatePost />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
