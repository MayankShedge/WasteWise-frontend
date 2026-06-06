import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { badges } from '../utils/badgeDefn.js'; 
import socket from '../socket.js';  

const getStatusStyle = (status) => {
  switch (status) {
    case 'new':         return 'bg-yellow-100 text-yellow-800';
    case 'in progress': return 'bg-blue-100 text-blue-800';
    case 'resolved':    return 'bg-green-100 text-green-800';
    default:            return 'bg-gray-100 text-gray-800';
  }
};

const getStatusEmoji = (status) => {
  switch (status) {
    case 'new':         return '🟡';
    case 'in progress': return '🔵';
    case 'resolved':    return '✅';
    default:            return '⚪';
  }
};

const ProfilePage = () => {
    const [history, setHistory] = useState([]);
    const [reports, setReports]       = useState([]);        
    const [toast, setToast]           = useState(null); 
    const [loading, setLoading] = useState(true);
    const [reportsLoading, setReportsLoading] = useState(true);
    const [error, setError] = useState('');
    const { userInfo } = useAuth();

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userInfo) return;

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                const { data } = await api.get('/api/history', config);
                setHistory(data);
            } catch (err) {
                setError('Failed to load your scan history.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [userInfo]);

    useEffect(() => {
        const fetchMyReports = async () => {
            if (!userInfo) return;
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                
                const { data } = await api.get('/api/reports/my-reports', config);
                setReports(data);
            } catch (err) {
                // silently fail — user may not have submitted any reports
                console.log('Could not fetch reports:', err.message);
            } finally {
                setReportsLoading(false);
            }
        };
        fetchMyReports();
    }, [userInfo]);

    useEffect(() => {
        if (!userInfo) return;

        socket.connect();
        socket.emit('join', userInfo._id);

        socket.on('reportStatusUpdated', ({ reportId, status, message }) => {
            // Update report in local state without re-fetching
            setReports(prev =>
                prev.map(r => r._id === reportId ? { ...r, status } : r)
            );

            // Show toast notification
            setToast(message);
            setTimeout(() => setToast(null), 5000);
        });

        return () => {
            socket.off('reportStatusUpdated');
            socket.disconnect();
        };
    }, [userInfo]);

    const stats = history.reduce((acc, scan) => {
        acc.total = (acc.total || 0) + 1;
        acc[scan.category] = (acc[scan.category] || 0) + 1;
        return acc;
    }, {});


    if (loading) return <p className="text-center p-8">Loading your profile...</p>;
    if (error) return <p className="text-red-500 text-center p-8">{error}</p>;

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
            {toast && (
                <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-fadeIn">
                    <span>🔔</span>
                    <span>{toast}</span>
                </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">My Impact</h1>
            <p className="text-md md:text-lg text-gray-600 mt-2">Here's a summary of your contribution!</p>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg text-center sm:text-left">
                    <h2 className="text-4xl font-bold">{stats.total || 0}</h2>
                    <p className="mt-1">Total Items Scanned</p>
                </div>
                <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg text-center sm:text-left">
                    <h2 className="text-4xl font-bold">{stats['Wet Waste'] || 0}</h2>
                    <p className="mt-1">Wet Waste Items</p>
                </div>
                 <div className="bg-gray-700 text-white p-6 rounded-xl shadow-lg text-center sm:text-left">
                    <h2 className="text-4xl font-bold">{stats['Dry Waste'] || 0}</h2>
                    <p className="mt-1">Dry Waste Items</p>
                </div>
                    <div className="bg-yellow-500 text-white p-6 rounded-xl shadow-lg text-center sm:text-left">
                    <h2 className="text-4xl font-bold">{stats['E-waste'] || 0}</h2>
                    <p className="mt-1">E-Waste Items</p>
                </div>
                    <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg text-center sm:text-left">
                    <h2 className="text-4xl font-bold">{stats['Hazardous Waste'] || 0}</h2>
                    <p className="mt-1">Hazardous Waste Items</p>
                </div>
                    <div className="bg-pink-500 text-white p-6 rounded-xl shadow-lg text-center sm:text-left">
                    <h2 className="text-4xl font-bold">{stats['Biomedical Waste'] || 0}</h2>
                    <p className="mt-1">Biomedical Waste Items</p>
                </div>
            </div>

            {/* --- NEW: MY BADGES SECTION --- */}
            <div className="mt-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">My Badges</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {badges.map((badge) => {
                        const hasBadge = userInfo.points >= badge.points;
                        return (
                            <div key={badge.name} className={`p-6 rounded-lg text-center border-2 transition-all ${hasBadge ? 'border-green-400 bg-green-50 shadow-md' : 'border-gray-200 bg-gray-50'}`}>
                                <div className={`text-5xl transition-colors ${hasBadge ? badge.color : 'text-gray-300'}`}>{badge.icon}</div>
                                <h3 className={`mt-4 text-lg font-bold ${hasBadge ? 'text-gray-800' : 'text-gray-400'}`}>{badge.name}</h3>
                                <p className={`mt-1 text-sm ${hasBadge ? 'text-gray-600' : 'text-gray-400'}`}>{hasBadge ? badge.description : `Reach ${badge.points} points to unlock.`}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">My Reported Issues</h2>
                <p className="text-sm text-gray-500 mb-4">
                    🔴 Status updates appear live — no refresh needed.
                </p>

                {reportsLoading ? (
                    <p className="text-gray-500">Loading your reports...</p>
                ) : reports.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-100">
                        {reports.map((report) => (
                            <div key={report._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{report.description}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Submitted on {new Date(report.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2 self-start sm:self-center">
                                    <span className="text-lg">{getStatusEmoji(report.status)}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(report.status)}`}>
                                        {report.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
                        <p>You haven't submitted any reports yet.</p>
                        <Link to="/report-issue" className="text-green-600 font-semibold hover:underline mt-2 inline-block">
                            Report an Issue →
                        </Link>
                    </div>
                )}
            </div>

            <div className="mt-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Your Scan History</h2>
                {history.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-lg">
                        <ul className="divide-y divide-gray-200">
                            {history.map((scan) => (
                                <li key={scan._id} className="flex justify-between items-center p-3 sm:p-4">
                                    <div className="flex flex-col">
                                        <span className="capitalize font-medium text-gray-800">{scan.item}</span>
                                        <span className="text-xs text-gray-500 sm:hidden">{new Date(scan.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                         <span className="text-sm text-gray-500 hidden sm:block">{new Date(scan.createdAt).toLocaleDateString()}</span>
                                        <span className={`font-semibold px-3 py-1 rounded-full text-xs sm:text-sm ${
                                            scan.category.includes('Wet') ? 'bg-green-100 text-green-800' : ''
                                        } ${
                                            scan.category.includes('Dry') ? 'bg-blue-100 text-blue-800' : ''
                                        } ${
                                            scan.category.includes('E-waste') ? 'bg-purple-100 text-purple-800' : ''
                                        } ${
                                            scan.category.includes('Hazardous Waste') ? 'bg-red-100 text-red-800' : ''
                                        }
                                        ${
                                            scan.category.includes('Biomedical Waste') ? 'bg-pink-100 text-pink-800' : ''
                                        }
                                        ${
                                            scan.category.includes('General Waste') ? 'bg-gray-100 text-gray-800' : ''
                                        }`}>{scan.category}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
                        <p>You haven't scanned any items yet.</p>
                        <Link to="/" className="text-green-600 font-semibold hover:underline mt-2 inline-block">Start Scanning!</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;

