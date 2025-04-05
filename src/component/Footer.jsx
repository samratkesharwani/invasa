import React from "react";
import logo from '../imgs/logo.png'
import { FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import IconContainer from './IconContainer';

const Footer = ({isDarkMode}) => {
  return (
    <>
      <footer className={`relative z-10 pb-10 pt-20 ${isDarkMode ? 'bg-dark' : 'bg-white border-t border-gray-200'} lg:pb-20 lg:pt-[120px]`}>
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
          
             <div className="w-full px-4 sm:w-1/2 lg:w-3/12">
              <div className="mb-10 w-full">
                <h4 className={`mb-9 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Follow Us On
                </h4>
                <div className="mb-6 flex items-center space-x-4">
                  <a
                    href="https://www.instagram.com/invasa_link/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconContainer
                      icon={<FaInstagram />}
                      isDarkMode={isDarkMode}
                      color="purple"
                      size="sm"
                      alt="Instagram"
                    />
                  </a>
                  
                  <a
                    href="https://www.youtube.com/@InvasaLink"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <IconContainer
                      icon={<FaYoutube />}
                      isDarkMode={isDarkMode}
                      color="red"
                      size="sm"
                      alt="YouTube"
                    />
                  </a>
                  
                  <a
                    href="https://www.linkedin.com/company/105442463/admin/dashboard/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconContainer
                      icon={<FaLinkedin />}
                      isDarkMode={isDarkMode}
                      color="blue"
                      size="sm"
                      alt="LinkedIn"
                    />
                  </a>
                </div>
                <p className={`text-base ${isDarkMode ? 'text-dark-6' : 'text-gray-500'}`}>
                  &copy; 2025 Invasa Link
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <span className="absolute bottom-0 left-0 z-[-1]">
            <svg
              width={217}
              height={229}
              viewBox="0 0 217 229"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M-64 140.5C-64 62.904 -1.096 1.90666e-05 76.5 1.22829e-05C154.096 5.49924e-06 217 62.904 217 140.5C217 218.096 154.096 281 76.5 281C-1.09598 281 -64 218.096 -64 140.5Z"
                fill="url(#paint0_linear_1179_5)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_1179_5"
                  x1="76.5"
                  y1={281}
                  x2="76.5"
                  y2="1.22829e-05"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3056D3" stopOpacity="0.08" />
                  <stop offset={1} stopColor="#C4C4C4" stopOpacity={0} />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="absolute right-10 top-10 z-[-1]">
            <svg
              width={75}
              height={75}
              viewBox="0 0 75 75"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M37.5 -1.63918e-06C58.2107 -2.54447e-06 75 16.7893 75 37.5C75 58.2107 58.2107 75 37.5 75C16.7893 75 -7.33885e-07 58.2107 -1.63918e-06 37.5C-2.54447e-06 16.7893 16.7893 -7.33885e-07 37.5 -1.63918e-06Z"
                fill="url(#paint0_linear_1179_4)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_1179_4"
                  x1="-1.63917e-06"
                  y1="37.5"
                  x2={75}
                  y2="37.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#13C296" stopOpacity="0.31" />
                  <stop offset={1} stopColor="#C4C4C4" stopOpacity={0} />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </div>
      </footer>
    </>
  );
};

export default Footer;

const LinkGroup = ({ children, header, isDarkMode }) => {
  return (
    <>
      <div className="w-full px-4 sm:w-1/2 lg:w-2/12">
        <div className="mb-10 w-full">
          <h4 className={`mb-9 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {header}
          </h4>
          <ul className="space-y-3">{children}</ul>
        </div>
      </div>
    </>
  );
};

const NavLink = ({ link, label, isDarkMode }) => {
  return (
    <li>
      <a
        href={link}
        className={`inline-block text-base leading-loose ${isDarkMode ? 'text-dark-6 hover:text-primary' : 'text-gray-600 hover:text-primary'}`}
      >
        {label}
      </a>
    </li>
  );
};
