import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios.js';
import socket from '../socket.js';

const AdminDashboard = () => {

    const { userInfo } = useAuth();
    const [newReportsCount, setNewReportsCount] = useState(0);

    useEffect(() => {
        const fetchNewCount = async () => {
            if (!userInfo) return;
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await api.get('/api/reports', config);
                const count = data.filter(r => r.status === 'new').length;
                setNewReportsCount(count);
            } catch (err) {
                console.error('Failed to fetch report count:', err.message);
            }
        };
        fetchNewCount();
    }, [userInfo]);

    useEffect(() => {
        if (!userInfo?.isAdmin) return;

        socket.connect();
        socket.emit('join', 'admin-room');  

        socket.on('reportStatusUpdated', ({ status }) => {
            if (status !== 'new') {
                setNewReportsCount(prev => Math.max(0, prev - 1));
            }
        });

        socket.on('newReportSubmitted', () => {
            setNewReportsCount(prev => prev + 1);
        });

        return () => {
            socket.off('reportStatusUpdated');
            socket.off('newReportSubmitted');
            socket.disconnect();
        };
    }, [userInfo]);

    const getTabClass = ({ isActive }) =>
        isActive
            ? "bg-green-600 text-white px-4 py-2 rounded-md font-semibold"
            : "bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-300";

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
            
            <div className="flex flex-wrap gap-2 md:gap-4 mb-8 border-b pb-4">
                <NavLink to="/admin/dashboard/reports" className={getTabClass}>
                    <span className="flex items-center gap-2">
                        Manage Reports
                        {newReportsCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                {newReportsCount}
                            </span>
                        )}
                    </span>
                </NavLink>
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

