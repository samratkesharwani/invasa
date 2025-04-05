import React from "react";
import Title from "./Title";
import ded from '../imgs/try.jpg'
// import color from '../imgs/color.jpg'
// import color2 from '../imgs/color2.jpg'
// import color3 from '../imgs/color3.jpg'
// import color4 from '../imgs/color4.jpg'
const Card = ({isDarkMode}) => {
  return (
    <>
    <Title title ="Why Choose Invasa Link?" isDarkMode={isDarkMode} />
      <section className="pb-10 -mt-20 pt-20 lg:pb-20 lg:pt-[120px]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center">
            {/* First row - always show these three cards */}
            <div className="w-full lg:w-1/3 px-4 mb-8">
              <SingleCard
                // image={color}
                // color="000000"
                CardTitle="Decentralized Network"
                titleHref="/#"
                btnHref="/#"
                CardDescription="Our platform connects brands with a wide network of print service providers across India, ensuring that you have access to the best local options"
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="w-full lg:w-1/3 px-4 mb-8">
              <SingleCard
                // image={color2}
                CardTitle="Automated Order Routing"
                CardDescription="Say goodbye to delays! Our intelligent system automatically assigns orders to the nearest printing partner, optimizing fulfillment and delivery times."
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="w-full lg:w-1/3 px-4 mb-8">
              <SingleCard
                // image={color3}
                CardTitle="Fast Fulfillment"
                CardDescription="We target a 2-day delivery window, with the potential for local deliveries in as little as 4 hours. Your time is valuable, and we respect that."
                isDarkMode={isDarkMode}
              />
            </div>
            
            {/* Second row - additional cards */}
            <div className="flex flex-wrap justify-center w-full">
              <div className="w-full md:w-1/2 lg:w-1/3 px-4 mb-8">
                <SingleCard
                  // image={color4}
                  CardTitle="Direct Onboarding"
                  CardDescription="Brands and POD service providers can easily onboard onto our platform, streamlining the process and reducing time to market."
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="w-full md:w-1/2 lg:w-1/3 px-4 mb-8">
                <SingleCard
                  // image={ded}
                  CardTitle="Quality Control"
                  CardDescription="With potential expansion into in-house printing operations, we aim to maintain high-quality standards and ensure that your products meet your expectations."
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Card;

const SingleCard = ({
  image,
  Button,
  CardDescription,
  CardTitle,
  titleHref,
  btnHref,
  isDarkMode,
  color
}) => {
  return (
    <div
      style={
        isDarkMode ? {backgroundColor:'#1F2A37'} :
         {backgroundColor:`#${color || 'f8fafc'}`}}
       className={`h-full overflow-hidden rounded-lg duration-300 hover:translate-y-[-5px] ${
         isDarkMode 
           ? 'shadow-lg shadow-blue-900/20 border border-gray-800' 
           : 'shadow-md hover:shadow-xl border border-gray-200'
       }`}>
      {image && <img src={image} alt="" className="w-full" />}
      <div className="p-8 text-center sm:p-6 md:p-6 xl:p-7">
        <h3>
          <p
            href={titleHref ? titleHref : "/#"}
            className={`mb-5 block text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]`}
          >
            {CardTitle}
          </p>
        </h3>
        <p className={`mb-7 text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {CardDescription}
        </p>

        {Button && (
          <a
            href={btnHref ? btnHref : "#"}
            className={`inline-block rounded-full border px-7 py-2 text-base font-medium transition ${
              isDarkMode 
                ? 'border-blue-500 text-blue-400 hover:bg-blue-800 hover:text-white' 
                : 'border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white'
            }`}
          >
            {Button}
          </a>
        )}
      </div>
    </div>
  );
};
