import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/users/leaderboard');
                setLeaderboard(data);
            } catch (err) {
                setError('Failed to load the leaderboard. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <p className="text-center p-8">Loading Leaderboard...</p>;
    if (error) return <p className="text-center p-8 text-red-500">{error}</p>;

    return (
        // --- RESPONSIVE CHANGES APPLIED ---
        <div className="container mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Top Contributors 🏆</h1>
                <p className="text-md sm:text-lg text-gray-600 mt-2">See who's leading the way in making Navi Mumbai cleaner!</p>
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 sm:px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-4 sm:px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leaderboard.map((user, index) => (
                                <tr key={user._id} className={index < 3 ? 'bg-green-50' : ''}>
                                    <td className="px-4 sm:px-6 py-4 text-center text-md sm:text-lg font-bold text-gray-700">{index + 1}</td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-md font-medium text-gray-800">{user.name}</td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm sm:text-md font-bold text-yellow-600">{user.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;

