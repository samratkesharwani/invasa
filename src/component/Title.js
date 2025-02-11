import React from "react";

const PageTitle1 = ({title,description}) => {
  return (
    <section className="bg-white py-[70px] dark:bg-dark">
      <div className="mx-auto px-4 sm:container">
        <div className="border-b border-stroke dark:border-dark-3">
          <h2 className="mb-2 text-2xl font-semibold text-dark dark:text-white">
          {title}
          </h2>
          {/* <p className="text-sm font-medium text-body-color dark:text-dark-6">
            {description}
          </p> */}
        </div>
      </div>
    </section>
  );
};

export default PageTitle1;
