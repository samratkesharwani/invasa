import React, { useState, useEffect } from "react";
import { supabase } from '../../utils/supabase';
import { useNavigate } from "react-router-dom";
import Logo from '../../imgs/logo.png';
import '../../css/tailwind.css';
import { User } from "lucide-react";
import Error from '../../component/element/Error'

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user) return;

      const { data: userProfile, error } = await supabase
        .from("profile")
        .select("role")
        .eq("id", user.user.id)
        .single();

      if (!error && userProfile) {
        setRole(userProfile.role);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) {
        setError(error.message);
    } else {
      console.log("Logged in user:", data);
      navigate(`/`);
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <>
      {error ? <Error error={error} /> : ""}
      <section className="bg-dark">
        <div className="container mx-auto">
          <div className="flex flex-wrap">
            <div className="w-full px-4">
              <div className="relative mx-auto max-w-[525px] rounded-lg bg-dark px-10 py-16 text-center">
                <div className="mb-10 text-center">
                  <h1 className="text-white text-2xl font-bold sm:text-3xl">
                    Login
                  </h1>
                </div>
                <form onSubmit={handleLogin}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="mb-5 w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="mt-10">
                    <button
                      type="submit"
                      className="mb-10 w-full rounded-md border border-primary bg-primary px-5 py-3 text-white transition hover:bg-opacity-90"
                    >
                      Login
                    </button>
                  </div>
                </form>
                <a href="/#" className="mb-2 inline-block text-dark hover:text-primary hover:underline dark:text-white">
                  Forgot Password?
                </a>
                <p className="text-body-color dark:text-dark-6">
                  <span className="pr-0.5">Not registered?</span>
                  <button onClick={goToRegister} className="text-primary hover:underline">
                    Register
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
