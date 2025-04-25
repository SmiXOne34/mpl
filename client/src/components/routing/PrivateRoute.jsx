import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Box, Typography } from '@mui/material';

/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * 
 * @param {Object} props - Component props
 * @param {string[]} props.roles - Allowed roles for this route
 */
const PrivateRoute = ({ roles }) => {
  const { isAuthenticated, loading, user } = useSelector(state => state.auth);
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check if user has required role
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  // Render the protected component
  return <Outlet />;
};

export default PrivateRoute;