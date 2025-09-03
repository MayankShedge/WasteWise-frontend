import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AdminDashboard = () => {
    const getTabClass = ({ isActive }) =>
        isActive
            ? "bg-green-600 text-white px-4 py-2 rounded-md font-semibold"
            : "bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-300";

    return (
        // --- RESPONSIVE CHANGES APPLIED ---
        <div className="container mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
            
            {/* The tabs will now wrap on smaller screens */}
            <div className="flex flex-wrap gap-2 md:gap-4 mb-8 border-b pb-4">
                <NavLink to="/admin/dashboard/reports" className={getTabClass}>Manage Reports</NavLink>
                <NavLink to="/admin/dashboard/schedules" className={getTabClass}>Manage Schedules</NavLink>
                <NavLink to="/admin/dashboard/analytics" className={getTabClass}>View Analytics</NavLink>
                <NavLink to="/admin/dashboard/articles" className={getTabClass}>Manage Articles</NavLink>
            </div>

            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminDashboard;

