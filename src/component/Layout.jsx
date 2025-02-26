import React,{useState,useEffect} from 'react'
import Hero from "../component/Hero";
import Header from "../component/Header";
import Card from "../component/Card";
import Milestone from "../component/Milestone";
import About from "../component/About";
import Footer from './Footer';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
function Layout() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
   const [loggedIn,setLoggedIn] =useState(false);
    useEffect(() => {
      const fetchUserProfile = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session?.user) {
          console.error("No user session found.");
          return;
        }
        setLoggedIn(!!data.session.user.id);
      };
      
     
      fetchUserProfile();
    }, []);
    const navigateTo = ()=>{
      // const role='seller'
      navigate(`/dashboard-${role}`)
    }
useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user) return;

      const { data: userProfile, error } = await supabase
        .from("profile")
        .select("role")
        .eq("id", user.user.id)
        .single();

      if (!error && userProfile) {
        setRole(userProfile.role);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <>
     <Hero navigateTo={navigateTo} loggedIn={loggedIn} />
     <Card />
     <Milestone />
     <About  navigateTo={navigateTo} loggedIn={loggedIn}/>
     <Footer />
    </>
  )
}

export default Layout
