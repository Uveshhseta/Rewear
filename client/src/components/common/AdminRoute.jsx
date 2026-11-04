import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal text-white">
        <div className="w-10 h-10 border-4 border-sage border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in -> go to dedicated Admin Login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Logged in as regular customer -> block access and redirect to home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

