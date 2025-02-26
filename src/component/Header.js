import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import logo from '../imgs/logo.png'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import tail from '../imgs/tail.png'
const Navbar = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false);
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
  const profile = ()=>{
    navigate('/profile')
  }
  return (
    
          <div className="containerflex justify-evenly items-center">
        <div className="flex justify-evenly items-center">
         <Logo/>
         <span className="w-1/3"></span>
           {
            loggedIn? 
            <AccountCircleIcon onClick={profile}/>:
           <LoginOptions/>
            }
            
          </div>
        </div>

  );
};

export default Navbar;

const ListItem = ({ children, NavLink }) => {
  return (
    <>
      <li>
        <a
          href={NavLink}
          className="flex py-2 text-base font-medium text-body-color hover:text-dark dark:text-dark-6 dark:hover:text-white lg:ml-12 lg:inline-flex"
        >
          {children}
        </a>
      </li>
    </>
  );
};

const Logo = ()=>{
  return(
    <>
     <div className="w-1/4 px-4">
                <a href="/#" className="block py-5"  
                    style={{width:'12rem'}}
                    >
                 
                  <img
                    src={logo}
                    alt="logo"
                    className=""
                  />
                </a>
              </div></>
  )
}
const LoginOptions =()=>{
  const navigate = useNavigate()
  const navigateTo=()=>{
    navigate('/register')
  }
  return(
    <>
    <div className="hidden justify-end pr-16 sm:flex lg:pr-0">
              <button
              onClick={navigateTo}
                className="rounded-lg bg-primary px-7 py-3 text-base font-medium text-white hover:bg-opacity-90"
              >
                Get Started
              </button>
            </div>
    </>
  )
}