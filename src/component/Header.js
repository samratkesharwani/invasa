import React, { useState } from "react";
import logo from '../imgs/logo.png'
import tail from '../imgs/tail.png'
const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className={`flex w-full items-center bg-white dark:bg-dark`}>
      <div className="container">
        <div className="relative -mx-4 flex items-center justify-between">
          <div className="w-60 max-w-full px-4">
            <a href="/#" className="block py-5"  
                style={{width:'12rem'}}
                >
             
              <img
                src={logo}
                alt="logo"
                className="hidden dark:block"
              />
            </a>
          </div>
          <div className="flex w-full items-center justify-between px-4">
           
           
          </div>
        </div>
      </div>
    </header>
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
