import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminAnalyticsPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { userInfo } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await api.get('/api/stats', config);
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        if (userInfo && userInfo.isAdmin) {
            fetchStats();
        }
    }, [userInfo]);

    if (loading) return <p className="text-center p-8">Loading analytics...</p>;
    if (!stats) return <p className="text-center p-8 text-red-500">Could not load analytics data.</p>;

    const barChartData = {
        labels: stats.dailyScans.map(d => new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [{
            label: 'Scans per Day',
            data: stats.dailyScans.map(d => d.count),
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1,
        }],
    };

    const pieChartData = {
        labels: stats.categoryStats.map(c => c.category),
        datasets: [{
            label: 'Waste Category Breakdown',
            data: stats.categoryStats.map(c => c.count),
            backgroundColor: [
                'rgba(59, 130, 246, 0.7)', 
                'rgba(34, 197, 94, 0.7)',  
                'rgba(168, 85, 247, 0.7)', 
                'rgba(239, 68, 68, 0.7)',   
                'rgba(45, 130, 130, 0.7)'
            ],
            borderColor: '#ffffff',
            borderWidth: 2,
        }],
    };

    return (
        // --- RESPONSIVE CHANGES APPLIED ---
        <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Analytics Overview</h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-4xl sm:text-5xl font-bold">{stats.keyMetrics.totalUsers}</h3>
                    <p className="mt-2 text-md sm:text-lg">Total Users</p>
                </div>
                <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-4xl sm:text-5xl font-bold">{stats.keyMetrics.totalScans}</h3>
                    <p className="mt-2 text-md sm:text-lg">Total Scans</p>
                </div>
                <div className="bg-yellow-500 text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-4xl sm:text-5xl font-bold">{stats.keyMetrics.totalReports}</h3>
                    <p className="mt-2 text-md sm:text-lg">Total Reports</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4">Weekly Scan Activity</h3>
                    <Bar data={barChartData} />
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4">Waste Category Breakdown</h3>
                    <div className="w-full max-w-xs sm:max-w-sm mx-auto">
                        <Pie data={pieChartData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;

