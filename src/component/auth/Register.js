import React, { useState } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from "react-router-dom";
import Logo from '../../imgs/logo.png'
import Loading from '../element/Loading'
import Error from '../element/Error'

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [brandName, setBrandName] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      const { error: profileError } = await supabase
        .from("profile")
        .insert([{ id: data.user.id, email, role, name, brandName }]);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    console.log("Signup successful!");
    setLoading(false);
    setSuccess(true);
    // navigate("/login");
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <>
      {error ? <Error error={error} /> : ''}
      {success ?
        <SuccessfulSubmission />
        :
        <>
          <section className="bg-dark">
            <div className="container mx-auto">
              <div className="-mx-4 flex flex-wrap">
                <div className="w-full px-4">
                  <div className="relative mx-auto max-w-[525px] overflow-hidden rounded-lg bg-dark px-10 py-16 text-center sm:px-12 md:px-[60px]">
                    <div className="mb-10 text-center md:mb-16">
                      <h1 className="text-white text-2xl font-bold sm:text-3xl">
                        Create an account
                      </h1>
                    </div>
                    <form>
                      <InputBox type="name" name="name" onChange={(e) => setName(e.target.value)} required placeholder="Name" />
                      <InputBox type="name" name="brandName" onChange={(e) => setBrandName(e.target.value)} required placeholder="Business Name" />
                      <InputBox type="email" name="email" onChange={(e) => setEmail(e.target.value)} required placeholder="Email" />
                      <InputBox type="password" name="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
                      <select
                        className="mb-10 w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-body-color outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white"
                        name="options"
                        id="options"
                        onChange={(e) => setRole(e.target.value)} required
                      >
                        <option value="" disabled selected hidden>Select an option</option>
                        <option className="bg-dark" value="seller">Seller</option>
                        <option className="bg-dark" value="brands">Brands/ Designer/ Individual</option>
                      </select>
                      <div className="mb-10">
                        <input
                          type="submit"
                          onClick={handleSignup}
                          value="Register"
                          className="w-full cursor-pointer rounded-md border border-primary bg-primary px-5 py-3 text-base font-medium text-white transition hover:bg-opacity-90"
                        />
                      </div>
                    </form>
                    <a
                      href="/#"
                      className="mb-2 inline-block text-base text-dark hover:text-primary hover:underline dark:text-white"
                    >
                      Forget Password?
                    </a>
                    <p className="text-base text-body-color dark:text-dark-6">
                      <span className="pr-0.5">Registered? </span>
                      <a
                        className="text-primary hover:underline"
                        onClick={goToLogin}
                      >
                        Login
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      }
    </>
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

const SuccessfulSubmission = () => {
  return (
    <div className="py-10 dark">
      <div className="container">
        <div className="border-green bg-green-light-6 flex w-full rounded-lg border-l-[6px] px-7 py-8 md:p-9">
          <div className="bg-green mr-5 flex h-[34px] w-full max-w-[34px] items-center justify-center rounded-md">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_961_15637)">
                <path
                  d="M8.99998 0.506248C4.3031 0.506248 0.506226 4.30312 0.506226 9C0.506226 13.6969 4.3031 17.5219 8.99998 17.5219C13.6969 17.5219 17.5219 13.6969 17.5219 9C17.5219 4.30312 13.6969 0.506248 8.99998 0.506248ZM8.99998 16.2562C5.00623 16.2562 1.77185 12.9937 1.77185 9C1.77185 5.00625 5.00623 1.77187 8.99998 1.77187C12.9937 1.77187 16.2562 5.03437 16.2562 9.02812C16.2562 12.9937 12.9937 16.2562 8.99998 16.2562Z"
                  fill="white"
                />
                <path
                  d="M11.4187 6.38437L8.07183 9.64687L6.55308 8.15625C6.29996 7.90312 5.90621 7.93125 5.65308 8.15625C5.39996 8.40937 5.42808 8.80312 5.65308 9.05625L7.45308 10.8C7.62183 10.9687 7.84683 11.0531 8.07183 11.0531C8.29683 11.0531 8.52183 10.9687 8.69058 10.8L12.3187 7.3125C12.5718 7.05937 12.5718 6.66562 12.3187 6.4125C12.0656 6.15937 11.6718 6.15937 11.4187 6.38437Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_961_15637">
                  <rect width="18" height="18" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="w-full">
            <h5 className="mb-3 text-lg font-semibold text-[#004434]">
              Form filled successfully!
            </h5>
            <p className="text-base leading-relaxed text-body-color">
              Please check your email and complete the verification process.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center m-3">
        {/* <Button className='m-2' title={'Home'} link={'/'}/> */}
      </div>
    </div>
  );
};
