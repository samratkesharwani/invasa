import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import AuthProvider ,{useAuth } from "../src/component/AuthProvider";
import Signup from "../src/component/SignUp";
import Login from "../src/component/Login";
import Dashboard from "../src/component/Dashboard";
import Wrapper from "./component/Wrapper";
import AdminPanel from "./component/AdminPanel";
import GeneralPosts from "./component/GeneralPosts";
import Layout from "./component/Layout";
import ExploreProducts from "./component/form/ExploreProducts";
import Seller from "./component/form/Seller";
import Thanks from "./component/Thanks";
import './app.css'
const ProtectedRoute = ({ children }) => {
  const user = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    
    // <AuthProvider>        
      <Router>
        <Routes>
          <Route path="/" element={<Layout/>} />
          <Route path="/explore-products" element={<ExploreProducts />} />
          <Route path="/seller" element={<Seller/>} />
          {/* <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/general" element={<GeneralPosts />} /> */}
          <Route path="/thanks" element={<Thanks />} />
          {/* <Route path="/dashboard" element={
            <Wrapper>
            <Dashboard />
            </Wrapper>
            } /> */}
        </Routes>
      </Router>
    // </AuthProvider>
  );
}

export default App;
