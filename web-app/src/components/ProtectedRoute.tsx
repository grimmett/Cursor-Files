import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login...');
    return <Navigate to="/auth/login" replace />;
  }

  console.log('Authenticated, showing protected content...');
  return <Outlet />;
};

export default ProtectedRoute;
