import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/useUser';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useUser();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;