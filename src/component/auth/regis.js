import React, { useState } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";
import Logo from "../../imgs/logo.png";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [brandName, setBrandName] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      console.log(error.message);
    } else {
      console.log("Signup successful!");
      const { error: profileError } = await supabase.from("profile").insert([
        { id: data.user.id, email, role, name, brandName },
      ]);
      if (profileError) {
        console.error("Profile insert error:", profileError);
      }
      // navigate("/login");
    }
    console.log(email, role, brandName, data);
  };

  return (
    <section className="py-20 bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <img src={Logo} alt="logo" className="mx-auto h-12" />
          <h2 className="mt-4 text-xl font-bold">Sign Up</h2>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <input 
            type="text" 
            placeholder="Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
          <input 
            type="text" 
            placeholder="Business Name" 
            value={brandName} 
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            required
          >
            <option value="" disabled hidden>Select an option</option>
            <option value="seller">Seller</option>
            <option value="brands">Brands/Designer/Individual</option>
          </select>
          <button 
            type="submit" 
            className="w-full p-3 rounded-md bg-blue-600 hover:bg-blue-700 transition text-white font-bold"
          >
            Register
          </button>
        </form>
        <div className="text-center text-sm">
          <a href="/#" className="text-gray-400 hover:text-blue-500">Forgot Password?</a>
          <p className="mt-2">Already registered? <a href="/login" className="text-blue-500 hover:underline">Login</a></p>
        </div>
      </div>
    </section>
  );
};

export default Signin;

const InputBox = ({ type, placeholder, name, onChange }) => {
  return (
    <div className="mb-6">
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white"
      />
    </div>
  );
};
