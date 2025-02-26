import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Navigate } from "react-router-dom";
import Loading from '../component/element/Loading'
function Wrapper({ children }) {
  const [authenticated, setAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setAuthenticated(!!session);
      setLoading(false);
    };

    getSession();

    // Listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthenticated(!!session);
      }
    );

    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div><Loading/>
    <div className="container dark:bg-dark-2 p-5 rounded-lg grid place-items-center lg:w-1/2 sm:w-full md:w-1/2">
    <label class="block text-md font-medium mb-5 text-left">If you keep seeing the loading screen these can be the possible reasons:</label>
        <ol class="list-decimal pl-5 text-sm">
          <li class="mb-5 text-left">Poor Network (please check network)</li>
          <li class="mb-5 text-left">Not logged in (please go login)</li>
          <li class="mb-5 text-left">Trying to access wrong url</li>
          <li class="mb-5 text-left">If the listed issues don't matches with yours please contact us on the following email: Invasalink@gmail.com for faster replies instagram is prefered</li>
        </ol>
    </div>
    </div>;
  }

  return authenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default Wrapper;
