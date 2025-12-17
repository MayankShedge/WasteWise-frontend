import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext';

const ManageReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [emailStatus, setEmailStatus] = useState('');
    const { userInfo } = useAuth();

    const fetchReports = useCallback(async () => {
        if (!userInfo) return;
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await api.get('/api/reports', config);
            setReports(data);
        } catch (err) { // --- THE '_blank' HAS BEEN REMOVED FROM THIS LINE ---
            setError('Failed to load reports.');
        } finally {
            if (loading) setLoading(false);
        }
    }, [userInfo, loading]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDelete = async (reportId) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await api.delete(`/api/reports/${reportId}`, config);
                fetchReports();
            } catch (err) {
                alert('Failed to delete report.');
            }
        }
    };

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await api.put(`/api/reports/${reportId}`, { status: newStatus }, config);
            setReports(reports.map(r => r._id === reportId ? { ...r, status: newStatus } : r));
        } catch (err) {
            alert('Failed to update status.');
        }
    };
    
    const handleEmailReport = async () => {
        setEmailStatus('Sending...');
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await api.post('/api/reports/email-summary', {}, config);
            setEmailStatus(data.message);
        } catch (err) {
            setEmailStatus(err.response?.data?.message || 'Failed to send report.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-yellow-100 text-yellow-800';
            case 'in progress': return 'bg-blue-100 text-blue-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <p>Loading reports...</p>;

    return (
        // --- RESPONSIVE CHANGES APPLIED ---
        <div className="animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Community Reports</h2>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <button
                    onClick={handleEmailReport}
                    className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Email Summary of New Reports
                </button>
                {emailStatus && <p className="text-sm text-gray-600">{emailStatus}</p>}
            </div>

            {error ? <p className="text-red-500">{error}</p> : (
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.length > 0 ? reports.map((report) => (
                                    <tr key={report._id}>
                                        <td className="px-4 sm:px-6 py-4 whitespace-normal text-xs sm:text-sm text-gray-700">{report.description}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">{report.user ? report.user.name : 'N/A'}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={report.status}
                                                onChange={(e) => handleStatusChange(report._id, e.target.value)}
                                                className={`w-full sm:w-auto px-2 py-1 text-xs leading-5 font-semibold rounded-full border-none outline-none appearance-none ${getStatusColor(report.status)}`}
                                            >
                                                <option value="new">New</option>
                                                <option value="in progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <a href={report.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs sm:text-sm">View Image</a>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => handleDelete(report._id)} className="text-red-600 hover:text-red-900 font-semibold text-xs sm:text-sm">Delete</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-gray-500">No reports submitted yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageReports;

