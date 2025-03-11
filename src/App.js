import { BrowserRouter, Routes, Route, Navigate } from "./utils/router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Signup from "./component/SignUp";
import Dashboard from "./component/Dashboard";
import Wrapper from "./component/Wrapper";
import AdminPanel from "./component/AdminPanel";
import GeneralPosts from "./component/GeneralPosts";
import Layout from "./component/Layout";
import ExploreProducts from "./component/form/ExploreProducts";
import Seller from "./component/form/Seller";
import Thanks from "./component/Thanks";
import Login from "./component/auth/Login";
import Register from "./component/auth/Register";
import './app.css'
import BrandsDashboard from "./component/brands/BrandsDashboard";
import SellerDashboard from "./component/seller/SellerDashboard";
import SellerProfile from "./component/Profile";
import Order from "./component/seller/order/Order"
import FullAddress from "./component/seller/order/FullAddress";
import SelectProduct from "./component/seller/order/SelectProduct";
import SelectOptions from "./component/seller/order/SelectOptions";
import Payment from "./component/Payment";
import Location from './component/Location'
import Print from './component/seller/Print'
import Test from './component/seller/Test'
import InventorySetup from './component/form/InventorySetup';
import AdminRoutes from './component/admin/AdminRoutes';
import AdminLogin from './component/admin/pages/Login';
import Header from './component/Header';
import Profile from './component/Profile';
const ProtectedRoute = ({ children }) => {
  const user = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
                <Profile/>
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
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/pay" element={<Payment/>}/>
          <Route path="/location" element={<Location/>}/> 
          <Route path="/print"  element={<Print/>}/>
          <Route path='/test' element={<Test/>}/>  
          <Route path="/inventory-setup" element={<InventorySetup />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
