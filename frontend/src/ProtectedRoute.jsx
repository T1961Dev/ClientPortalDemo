import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Import the AuthContext

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // Get the current user from context

  if (!user) {
    return <Navigate to="/dashboard" />; // Redirect to auth if no user is logged in
  }

  if (user.role !== 'admin') {
    return <Navigate to="/auth" />; // Redirect to dashboard if user is not an admin
  }

  return children; // Render the protected route if the user is an admin
};

export default ProtectedRoute;
