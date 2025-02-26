import React, { useState,useEffect } from "react";
import '../css/tailwind.css'
import {useNavigate} from 'react-router-dom'
import printing from '../imgs/image.png'
import Button from './Button'
import {supabase} from '../utils/supabase'

const Hero = ({navigateTo,loggedIn}) => {
  const navigate= useNavigate();
  const navigateRegister = ()=>{
    navigate('/register')
  }
  return (
    <>
      {/* <Navbar /> */}
      <div className="relative  pb-[110px] pt-[120px] bg-dark lg:pt-[150px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4 lg:w-5/12">
              <div className="hero-content">
                <h1 className="mb-5 text-4xl font-bold !leading-[1.208]  text-white sm:text-[42px] lg:text-[40px] xl:text-5xl">
                Clothing under hours using print on demand
                </h1>
                <p className="mb-8 max-w-[480px] text-base text-body-color text-dark-6">
                At Invasa Link, we revolutionize the way brands connect with printing service providers. Our decentralized platform ensures that your print needs are met efficiently and effectively, with a focus on speed and quality.
                </p>
               
                <div className="clients pt-16">
                 
                  <div className="flex items-center space-x-4">
                  {  loggedIn?
                  <>
                  <button onClick={navigateTo} className='bg-primary border-primary border rounded-full inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:bg-[#1B44C8] hover:border-[#1B44C8] disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5 active:bg-[#1B44C8] active:border-[#1B44C8]'>
        Go To Dashboard
      </button>
                  </>
                  :
                  <>
  {/* <h6 className="font-thin mb-3 flex items-center text-lg text-body-color dark:text-dark-6">
                      Onboard with us
                      <span className="ml-3 inline-block h-px w-8 bg-body-color"></span>
                    </h6> */}

                   <button
              onClick={navigateRegister}
                className="'cursor:arrow rounded-lg bg-primary px-7 py-3 text-base font-medium text-white hover:bg-opacity-90"
              >
                Get Started
              </button>
                  </>


                      }
                    </div>
                </div>
              </div>
            </div>
          


  
 

            <div className="hidden px-4 lg:block lg:w-1/12"></div>
            <div className="w-full px-4 lg:w-6/12">
              <div className="lg:ml-auto lg:text-right">
                <div className="relative z-10 inline-block pt-11 lg:pt-0">
                  <img
                  style={{width: "50rem", borderTopLeftRadius:"50px", borderTopRightRadius:"20px", borderBottomLeftRadius:"20px", }}
                    src={printing}
                    alt="hero"
                    className="max-w-full lg:ml-auto"
                  />
                  <span className="absolute -bottom-8 -left-8 z-[-1]">
                    <svg
                      width="93"
                      height="93"
                      viewBox="0 0 93 93"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="2.5" cy="2.5" r="2.5" fill="#3056D3" />
                      <circle cx="2.5" cy="24.5" r="2.5" fill="#3056D3" />
                      <circle cx="2.5" cy="46.5" r="2.5" fill="#3056D3" />
                      <circle cx="2.5" cy="68.5" r="2.5" fill="#3056D3" />
                      <circle cx="2.5" cy="90.5" r="2.5" fill="#3056D3" />
                      <circle cx="24.5" cy="2.5" r="2.5" fill="#3056D3" />
                      <circle cx="24.5" cy="24.5" r="2.5" fill="#3056D3" />
                      <circle cx="24.5" cy="46.5" r="2.5" fill="#3056D3" />
                      <circle cx="24.5" cy="68.5" r="2.5" fill="#3056D3" />
                      <circle cx="24.5" cy="90.5" r="2.5" fill="#3056D3" />
                      <circle cx="46.5" cy="2.5" r="2.5" fill="#3056D3" />
                      <circle cx="46.5" cy="24.5" r="2.5" fill="#3056D3" />
                      <circle cx="46.5" cy="46.5" r="2.5" fill="#3056D3" />
                      <circle cx="46.5" cy="68.5" r="2.5" fill="#3056D3" />
                      <circle cx="46.5" cy="90.5" r="2.5" fill="#3056D3" />
                      <circle cx="68.5" cy="2.5" r="2.5" fill="#3056D3" />
                      <circle cx="68.5" cy="24.5" r="2.5" fill="#3056D3" />
                      <circle cx="68.5" cy="46.5" r="2.5" fill="#3056D3" />
                      <circle cx="68.5" cy="68.5" r="2.5" fill="#3056D3" />
                      <circle cx="68.5" cy="90.5" r="2.5" fill="#3056D3" />
                      <circle cx="90.5" cy="2.5" r="2.5" fill="#3056D3" />
                      <circle cx="90.5" cy="24.5" r="2.5" fill="#3056D3" />
                      <circle cx="90.5" cy="46.5" r="2.5" fill="#3056D3" />
                      <circle cx="90.5" cy="68.5" r="2.5" fill="#3056D3" />
                      <circle cx="90.5" cy="90.5" r="2.5" fill="#3056D3" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;

const SingleImage = ({ href, imgSrc }) => {
  return (
    <>
      <a href={href} className="flex w-full items-center justify-center">
        <img src={imgSrc} alt="brand image" className="h-10 w-full" />
      </a>
    </>
  );
};

