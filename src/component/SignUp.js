import { useState } from "react";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";
const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email:email, password:password });
    
  if (error) alert(error.message);
  else {
    alert("Login successful!");
    const {error:profileError} = await supabase.from('profile').insert([{id:data.user.id,name:name,email:email}])

  if (profileError) {
    console.error("Profile insert error:", profileError);
  }
  navigate("/login");

  }
    };

  return (
    <form onSubmit={handleSignup}>
      <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default Signup;
