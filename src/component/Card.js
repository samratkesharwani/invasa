import React from "react";
import Title from "./Title";
import fulfillment from "../imgs/fulfillment.jpg";
import network from "../imgs/network.jpg";
import onboard from "../imgs/onboard.jpg";
import quality from "../imgs/quality.jpg";
import routing from "../imgs/routing.jpg";
import ded from '../imgs/try.jpg'
import color from '../imgs/color.jpg'
import color2 from '../imgs/color2.jpg'
import color3 from '../imgs/color3.jpg'
import color4 from '../imgs/color4.jpg'
const Card = () => {
  return (
    <>
    <Title title ="Why Choose Invasa Link?" />
      <section className="bg-gray-2 pb-10 -mt-20 pt-20 dark:bg-dark lg:pb-20 lg:pt-[120px]">
        <div className="container">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <SingleCard
            style={{borderRadius:"20px", }}
              image={color}
              CardTitle="Decentralized Network"
              titleHref="/#"
              btnHref="/#"
              CardDescription="Our platform connects brands with a wide network of print service providers across India, ensuring that you have access to the best local options"
            //   Button="View Details"
            />
            <SingleCard
              image={color2}
              CardTitle="Automated Order Routing"
              CardDescription="Say goodbye to delays! Our intelligent system automatically assigns orders to the nearest printing partner, optimizing fulfillment and delivery times."
            />
            <SingleCard
              image={color3}
              CardTitle="Fast Fulfillment"
              CardDescription="We target a 2-day delivery window, with the potential for local deliveries in as little as 4 hours. Your time is valuable, and we respect that."
            /><SingleCard
              image={color4}
              CardTitle="Direct Onboarding"
              CardDescription="Brands and POD service providers can easily onboard onto our platform, streamlining the process and reducing time to market."
            /><SingleCard
              image={ded}
              CardTitle="Quality Control"
              CardDescription="With potential expansion into in-house printing operations, we aim to maintain high-quality standards and ensure that your products meet your expectations."
            />
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
}) => {
  return (
    <>
      {/*  */}
      <div className="mb-10 overflow-hidden rounded-lg  shadow-1 duration-300 hover:shadow-3 dark:bg-dark-2 dark:shadow-card dark:hover:shadow-3">
        <img src={image} alt="" className="w-full" />
        <div className="p-8 text-center sm:p-9 md:p-7 xl:p-9">
          <h3>
            <p
              href={titleHref ? titleHref : "/#"}
              className="mb-4 block text-xl font-semibold text-white sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]"
            >
              {CardTitle}
            </p>
          </h3>
          <p className="mb-7 text-base leading-relaxed text-body-color text-dark-6">
            {CardDescription}
          </p>

          {Button && (
            <a
              href={btnHref ? btnHref : "#"}
              className="inline-block rounded-full border border-gray-3 px-7 py-2 text-base font-medium text-body-color transition hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3 dark:text-dark-6"
            >
              {Button}
            </a>
          )}
        </div>
      </div>
      {/*  */}
    </>
  );
};
