import React from 'react'
import Hero from "../component/Hero";
import Header from "../component/Header";
import Card from "../component/Card";
import Milestone from "../component/Milestone";
import About from "../component/About";
import Footer from './Footer';
function Layout() {
  return (
    <>

      <Header />
          <Hero />
          <Card />
          <Milestone />
          <About />
          <Footer />
    </>
  )
}

export default Layout
