import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const stats = history.reduce((acc, scan) => {
        acc.total = (acc.total || 0) + 1;
        acc[scan.category] = (acc[scan.category] || 0) + 1;
        return acc;
    }, {});


    if (loading) return <p className="text-center p-8">Loading your profile...</p>;
    if (error) return <p className="text-red-500 text-center p-8">{error}</p>;

    return (
        // --- RESPONSIVE CHANGES APPLIED ---
        <div className="container mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">My Impact</h1>
            <p className="text-md md:text-lg text-gray-600 mt-2">Here's a summary of your contribution to a cleaner Navi Mumbai!</p>
            
            {/* Stats Cards: Will stack on mobile and form a grid on larger screens */}
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
            </div>

            {/* Scan History */}
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
                                            scan.category.includes('E-Waste') ? 'bg-purple-100 text-purple-800' : ''
                                        } ${
                                            scan.category.includes('Hazardous') ? 'bg-red-100 text-red-800' : ''
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

