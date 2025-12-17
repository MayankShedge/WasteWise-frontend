import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

// This is similar to AdminRoute, but just checks if a user is logged in
const PrivateRoute = () => {
    const { userInfo } = useAuth();
    return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
