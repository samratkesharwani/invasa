import React, { useEffect } from "react";
import Header from './Header';
import Button from './Button';
import { useNavigate } from "react-router-dom";

const SuccessAlert2 = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <Header/>
      <div className="py-10 bg-white bg-dark">
        <div className="container">
          <div className="border-green bg-green-light-6 flex w-full rounded-lg border-l-[6px] px-7 py-8 md:p-9">
            <div className="bg-green mr-5 flex h-[34px] w-full max-w-[34px] items-center justify-center rounded-md">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_961_15637)">
                  <path
                    d="M8.99998 0.506248C4.3031 0.506248 0.506226 4.30312 0.506226 9C0.506226 13.6969 4.3031 17.5219 8.99998 17.5219C13.6969 17.5219 17.5219 13.6969 17.5219 9C17.5219 4.30312 13.6969 0.506248 8.99998 0.506248ZM8.99998 16.2562C5.00623 16.2562 1.77185 12.9937 1.77185 9C1.77185 5.00625 5.00623 1.77187 8.99998 1.77187C12.9937 1.77187 16.2562 5.03437 16.2562 9.02812C16.2562 12.9937 12.9937 16.2562 8.99998 16.2562Z"
                    fill="white"
                  />
                  <path
                    d="M11.4187 6.38437L8.07183 9.64687L6.55308 8.15625C6.29996 7.90312 5.90621 7.93125 5.65308 8.15625C5.39996 8.40937 5.42808 8.80312 5.65308 9.05625L7.45308 10.8C7.62183 10.9687 7.84683 11.0531 8.07183 11.0531C8.29683 11.0531 8.52183 10.9687 8.69058 10.8L12.3187 7.3125C12.5718 7.05937 12.5718 6.66562 12.3187 6.4125C12.0656 6.15937 11.6718 6.15937 11.4187 6.38437Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_961_15637">
                    <rect width="18" height="18" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div className="w-full">
              <h5 className="mb-3 text-lg font-semibold text-[#004434]">
                Form filled successfully!
              </h5>
              <p className="text-base leading-relaxed text-body-color">
                Our team will respond to your request as soon as possible. We appreciate your patience.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center m-3">
          {/* <Button className='m-2' title={'Home'} link={'/'}/> */}
        </div>
      </div>
    </>
  );
};

export default SuccessAlert2;
