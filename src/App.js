import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import AuthProvider ,{useAuth } from "../src/component/AuthProvider";
import Signup from "../src/component/SignUp";
import Dashboard from "../src/component/Dashboard";
import Wrapper from "./component/Wrapper";
import AdminPanel from "./component/AdminPanel";
import GeneralPosts from "./component/GeneralPosts";
import Layout from "./component/Layout";
import ExploreProducts from "./component/form/ExploreProducts";
import Seller from "./component/form/Seller";
import Thanks from "./component/Thanks";
import Login from "../src/component/auth/Login";
import Register from "../src/component/auth/Register";
import './app.css'
import BrandsDashboard from "./component/brands/BrandsDashboard";
import SellerDashboard from "./component/seller/SellerDashboard";
import SellerProfile from "./component/seller/SellerProfile";
import Header from './component/Header'
import Order from "./component/seller/order/Order"
import FullAddress from "./component/seller/order/FullAddress";
import SelectProduct from "./component/seller/order/SelectProduct";
import SelectOptions from "./component/seller/order/SelectOptions";
import AdminDashboard from './component/admin/AdminDashboard'
import Payment from "./component/Payment";
import Location from './component/Location'
const ProtectedRoute = ({ children }) => {
  const user = useAuth();
  return user ? children : <Navigate to="/login" />;
};
const h = <Header/>
function App() {
  return (
    
<>
      <Router>
          <Header/>
        <Routes>
          <Route path="/" element={<Layout/>} />
          <Route path="/explore-products" element={<ExploreProducts />} />
          <Route path="/seller" element={<Seller/>} />
          <Route path="/thanks" element={<Thanks />} />  
          <Route path="/login" element={<Login/>}  />      
          <Route path="/register" element={<Register/>}  />   
          <Route path="/dashboard-seller" element={
            <Wrapper>
              <BrandsDashboard/>
            </Wrapper>
            }/>
          <Route path="/dashboard-brands" element={
            <Wrapper>
            <SellerDashboard/>
             </Wrapper> 
            } />
            <Route path="profile" element={
              <Wrapper>
                <SellerProfile/>
              </Wrapper>
            }/>
            <Route path="order" element={
              <Wrapper>
                <Order/>
              </Wrapper>
            }/>
            <Route path="/order/address" element={
              <Wrapper>
                <FullAddress/>
              </Wrapper>
            }/>
             <Route path="/order/products" element={
                <Wrapper>
                  <SelectProduct />
                </Wrapper>
            }/>
             <Route path="/order/options" element={
                            <Wrapper>
                              <SelectOptions />
                            </Wrapper>
                        }/>
            <Route path="/admin-A7bC3x9Z" element={<AdminDashboard/>}/>
        <Route path="/pay" element={<Payment/>}/>
        <Route path="/location" element={<Location/>}/> 
        </Routes>

      </Router>
      </>
  );
}

export default App;
