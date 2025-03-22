import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUsers, FiShoppingBag, FiSettings, FiBarChart2, FiCheckSquare, FiBook } from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <FiBarChart2 /> },
    { path: '/admin/sellers', name: 'Sellers', icon: <FiUsers /> },
    { path: '/admin/orders', name: 'Orders', icon: <FiShoppingBag /> },
    { path: '/admin/approvals', name: 'Approvals', icon: <FiCheckSquare /> },
    { path: '/admin/blog', name: 'Blog', icon: <FiBook /> },
    { path: '/admin/settings', name: 'Settings', icon: <FiSettings /> },
  ];

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-dark-2 transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between h-16 px-4">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          ) : (
            <h1 className="text-xl font-bold text-white">AP</h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-300 hover:text-white"
          >
            {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
        <nav className="mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 ${
                location.pathname.startsWith(item.path)
                  ? 'bg-secondary text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              } transition-colors duration-200`}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span className="ml-4">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <header className="bg-dark-2 shadow-md">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              {menuItems.find(item => location.pathname.startsWith(item.path))?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-white">
                <span className="sr-only">Notifications</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="relative">
                <button className="flex items-center text-gray-300 hover:text-white">
                  <span className="h-8 w-8 rounded-full bg-gray-500"></span>
                  {isSidebarOpen && <span className="ml-2">Admin</span>}
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout; 