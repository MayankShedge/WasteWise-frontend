import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const { userInfo } = useAuth();

    // If user is logged in AND is an admin, render the requested page (Outlet).
    // Otherwise, redirect them to the home page.
    return userInfo && userInfo.isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;