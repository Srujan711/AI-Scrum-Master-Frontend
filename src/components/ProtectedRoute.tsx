import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'admin' | 'scrum_master' | 'product_owner' | 'developer';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireRole,
  redirectTo = '/login',
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Redirect to dashboard if user is authenticated but trying to access public routes
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check role-based access
  if (requireRole && user) {
    const hasRole = checkUserRole(user, requireRole);
    if (!hasRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. This page requires{' '}
              <span className="font-semibold">{requireRole}</span> role.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

// Helper function to check user role
const checkUserRole = (user: any, requiredRole: string): boolean => {
  switch (requiredRole) {
    case 'admin':
      return user.is_admin || false;
    case 'scrum_master':
      return user.is_scrum_master || false;
    case 'product_owner':
      return user.is_product_owner || false;
    case 'developer':
      // All authenticated users can be developers
      return true;
    default:
      return false;
  }
};