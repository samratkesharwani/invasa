import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import IconContainer from '../component/IconContainer';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { supabase } from '../utils/supabase';

const Contact = ({ isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Phone validation (optional field)
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    
    try {
      // Submit form data to Supabase without requiring authentication
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'General Inquiry',
          phone: formData.phone || null,
          message: formData.message
        }]);
      
      if (error) {
        console.error('Submission error:', error);
        throw new Error(error.message);
      }
      
      toast.success('Your message has been sent successfully!');
      setFormData({
        name: '',
        email: '',
        subject: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message || 'Please try again later'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen py-12 ${isDarkMode ? 'bg-gray-900' : 'bg-[#f5f9fa]'}`}>
      <Helmet>
        <title>Contact Us - Invasa Link</title>
        <meta name="description" content="Get in touch with Invasa Link - We're here to help with any questions or inquiries." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Get in Touch
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Have questions or need assistance? We're here to help. Fill out the form below and our team will get back to you shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className={`rounded-3xl overflow-hidden shadow-lg backdrop-blur-sm p-8 ${
            isDarkMode 
              ? 'shadow-xl bg-black bg-opacity-60 border border-gray-800' 
              : 'shadow-md bg-white border border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Contact Information
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <IconContainer
                  icon={<FaPhone />}
                  isDarkMode={isDarkMode}
                  color="purple"
                  size="md"
                  alt="Phone"
                />
                <div className="ml-4">
                  <h3 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Phone</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>+91 95958 62561</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <IconContainer
                  icon={<FaEnvelope />}
                  isDarkMode={isDarkMode}
                  color="purple"
                  size="md"
                  alt="Email"
                />
                <div className="ml-4">
                  <h3 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>admin@invasalink.in</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <IconContainer
                  icon={<FaMapMarkerAlt />}
                  isDarkMode={isDarkMode}
                  color="purple"
                  size="md"
                  alt="Location"
                />
                <div className="ml-4">
                  <h3 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Location</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Pune, Maharashtra<br />
                    India
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/invasa_link/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconContainer
                    icon={<FaInstagram />}
                    isDarkMode={isDarkMode}
                    color="purple"
                    size="sm"
                    alt="Instagram"
                  />
                </a>
                
                <a
                  href="https://www.youtube.com/@InvasaLink"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <IconContainer
                    icon={<FaYoutube />}
                    isDarkMode={isDarkMode}
                    color="red"
                    size="sm"
                    alt="YouTube"
                  />
                </a>
                
                <a
                  href="https://www.linkedin.com/company/105442463/admin/dashboard/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconContainer
                    icon={<FaLinkedin />}
                    isDarkMode={isDarkMode}
                    color="blue"
                    size="sm"
                    alt="LinkedIn"
                  />
                </a>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className={`rounded-3xl overflow-hidden shadow-lg backdrop-blur-sm p-8 ${
            isDarkMode 
              ? 'shadow-xl bg-black bg-opacity-60 border border-gray-800' 
              : 'shadow-md bg-white border border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Send Us a Message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="name" 
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white focus:ring-purple-500 focus:border-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600 focus:border-purple-600'
                  } focus:outline-none focus:ring-2`}
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label 
                  htmlFor="email" 
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Your Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white focus:ring-purple-500 focus:border-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600 focus:border-purple-600'
                  } focus:outline-none focus:ring-2`}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor="phone" 
                    className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white focus:ring-purple-500 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600 focus:border-purple-600'
                    } focus:outline-none focus:ring-2`}
                    placeholder="Phone number (optional)"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="subject" 
                    className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white focus:ring-purple-500 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600 focus:border-purple-600'
                    } focus:outline-none focus:ring-2`}
                    placeholder="How can we help you?"
                  />
                </div>
              </div>
              
              <div>
                <label 
                  htmlFor="message" 
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Your Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white focus:ring-purple-500 focus:border-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600 focus:border-purple-600'
                  } focus:outline-none focus:ring-2`}
                  placeholder="Please describe your inquiry in detail..."
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-4 rounded-lg font-medium text-white transition-all duration-300 ${
                    loading 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : isDarkMode
                        ? 'bg-gradient-to-r from-[#00E0A4] to-[#0BB489] hover:from-[#0BB489] hover:to-[#00E0A4] text-black'
                        : 'bg-gradient-to-r from-[#00E0A4] to-[#0BB489] hover:from-[#0BB489] hover:to-[#00E0A4] text-black'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 