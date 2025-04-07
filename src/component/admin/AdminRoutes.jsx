import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Sellers from './pages/Sellers';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import BlogList from '../../admin/pages/BlogList';
import BlogPostEditor from '../../admin/components/BlogPostEditor';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === 'admin';

  if (!user || !isAdmin) {
    return <Navigate to="/admin-login" />;
  }

  return children;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="sellers" element={<Sellers />} />
                <Route path="orders" element={<Orders />} />
                <Route path="settings" element={<Settings />} />
                
                {/* Blog Management Routes */}
                <Route path="blog" element={<BlogList />} />
                <Route path="blog/new" element={<BlogPostEditor />} />
                <Route path="blog/edit/:id" element={<BlogPostEditor />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AdminRoutes; 