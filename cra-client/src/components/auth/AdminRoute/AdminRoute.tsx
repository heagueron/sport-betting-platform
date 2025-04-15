import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  redirectPath = '/',
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to home if not authenticated or not an admin
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Render children if authenticated and is admin
  return <>{children}</>;
};

export default AdminRoute;
