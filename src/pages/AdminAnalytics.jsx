import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const AdminAnalyticsPage = () => {
    const [stats, setStats] = useState(null);
    const [feedbackAnalytics, setFeedbackAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const { userInfo } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                
                // Fetch existing stats
                const { data: statsData } = await api.get('/api/stats', config);
                setStats(statsData);

                // Try to fetch new feedback analytics (optional)
                try {
                    const { data: feedbackData } = await api.get('/api/feedback/analytics', config);
                    setFeedbackAnalytics(feedbackData);
                } catch (feedbackError) {
                    console.log('Feedback analytics not available yet - that\'s okay!');
                    setFeedbackAnalytics(null);
                }
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        
        if (userInfo && userInfo.isAdmin) {
            fetchData();
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
                'rgba(37, 99, 235, 0.8)',   
                'rgba(16, 185, 129, 0.8)',  
                'rgba(139, 92, 246, 0.8)',  
                'rgba(239, 68, 68, 0.8)',   
                'rgba(251, 191, 36, 0.8)',  
                'rgba(34, 197, 94, 0.8)',   
                'rgba(107, 114, 128, 0.8)', 
            ],
            borderColor: '#ffffff',
            borderWidth: 2,
        }],
    };

    const accuracyChartData = feedbackAnalytics ? {
        labels: feedbackAnalytics.accuracyByCategory.map(c => c._id),
        datasets: [{
            label: 'Accuracy %',
            data: feedbackAnalytics.accuracyByCategory.map(c => c.accuracy.toFixed(1)),
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
        }],
    } : null;

    const methodChartData = feedbackAnalytics ? {
        labels: feedbackAnalytics.methodPerformance.map(m => m._id.replace(/\s+/g, '\n')),
        datasets: [{
            label: 'Accuracy %',
            data: feedbackAnalytics.methodPerformance.map(m => m.accuracy.toFixed(1)),
            backgroundColor: [
                'rgba(59, 130, 246, 0.7)',
                'rgba(168, 85, 247, 0.7)',
                'rgba(34, 197, 94, 0.7)',
                'rgba(239, 68, 68, 0.7)',
                'rgba(245, 158, 11, 0.7)',
                'rgba(156, 163, 175, 0.7)'
            ],
            borderColor: '#ffffff',
            borderWidth: 2,
        }],
    } : null;

    return (
        <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Analytics Overview</h2>

            {/* Enhanced Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
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
                {/* NEW: Feedback metric (if available) */}
                {feedbackAnalytics && (
                    <div className="bg-purple-500 text-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-4xl sm:text-5xl font-bold">
                            {feedbackAnalytics.summary.overallAccuracy}%
                        </h3>
                        <p className="mt-2 text-md sm:text-lg">AI Accuracy</p>
                        <p className="text-xs mt-1">
                            {feedbackAnalytics.summary.totalFeedback} feedbacks
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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

            {feedbackAnalytics && (
                <>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-12">🤖 AI Model Performance</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Category Accuracy */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4">
                                Accuracy by Waste Category
                            </h3>
                            {accuracyChartData && <Bar data={accuracyChartData} />}
                        </div>

                        {/* Method Performance */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4">
                                AI Method Performance
                            </h3>
                            {methodChartData && (
                                <div className="w-full max-w-sm mx-auto">
                                    <Pie data={methodChartData} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Common Misclassifications Table */}
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4">
                            🎯 Common Misclassifications
                        </h3>
                        {feedbackAnalytics.misclassifications.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-2 text-left">AI Predicted</th>
                                            <th className="px-4 py-2 text-left">User Corrected</th>
                                            <th className="px-4 py-2 text-left">Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feedbackAnalytics.misclassifications.map((item, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="px-4 py-2">{item._id.predicted}</td>
                                                <td className="px-4 py-2">{item._id.actual}</td>
                                                <td className="px-4 py-2 font-semibold">{item.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500">No misclassifications data yet. Keep using the app!</p>
                        )}
                    </div>
                </>
            )}

            {/* No feedback message */}
            {!feedbackAnalytics && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mt-8">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">🚀 AI Performance Tracking</h3>
                    <p className="text-blue-700">
                        Start using the feedback system in the scanner to see AI performance analytics here!
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminAnalyticsPage;
