import React from "react";

const PageTitle1 = ({title, description, isDarkMode}) => {
  return (
    <section className={`py-[70px] ${isDarkMode ? 'bg-dark' : 'bg-[#f5f9fa]'}`}>
      <div className="mx-auto px-4 sm:container">
        <div className={`border-b ${isDarkMode ? 'border-stroke dark:border-dark-3' : 'border-gray-200'}`}>
          <h2 className={`mb-2 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {title}
          </h2>
          {/* <p className={`text-sm font-medium ${isDarkMode ? 'text-dark-6' : 'text-gray-600'}`}>
            {description}
          </p> */}
        </div>
      </div>
    </section>
  );
};

export default PageTitle1;
