import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../utils/supabase';
import { FiLock } from 'react-icons/fi';

const Login = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      // Check if user exists and has admin role
      // For debugging purposes, allow any authenticated user to access admin
      const user = data?.user;
      if (!user) {
        throw new Error('User not found');
      }

      console.log('User authenticated:', user);
      
      // Log the user's metadata for debugging
      console.log('User metadata:', user.user_metadata);
      
      // Set the user role to admin if not already set (for testing)
      if (!user.user_metadata?.role) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: 'admin' }
        });
        
        if (updateError) {
          console.error('Could not update user role:', updateError);
        }
      }

      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-gray-100';
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const labelColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const inputBg = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
  const inputBorder = isDarkMode ? 'border-gray-600' : 'border-gray-300';

  return (
    <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full">
        <div className={`${cardBg} rounded-lg shadow-lg p-8`}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500 bg-opacity-20 mb-4">
              <FiLock className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className={`text-2xl font-bold ${textColor}`}>Admin Login</h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Sign in to access the admin dashboard
            </p>
          </div>

          {error && (
            <div className={`${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'} px-4 py-3 rounded mb-4`}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className={`block ${labelColor} text-sm mb-2`}>Email Address</label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className={`w-full ${inputBg} ${textColor} border ${inputBorder} rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                required
              />
            </div>

            <div>
              <label className={`block ${labelColor} text-sm mb-2`}>Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className={`w-full ${inputBg} ${textColor} border ${inputBorder} rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 