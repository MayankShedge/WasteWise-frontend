import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext';

const EditSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { userInfo } = useAuth();

    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/schedules');
            setSchedules(data);
        } catch (err) {
            setError('Failed to load schedules.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);
    
    const getConfig = () => ({
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo.token}`,
        },
    });

    const handleSave = async (id) => {
        const scheduleToUpdate = schedules.find(s => s._id === id);
        setSuccess('');
        try {
            await api.put(`/api/schedules/${id}`, {
                area: scheduleToUpdate.area,
                collection: scheduleToUpdate.collection
            }, getConfig());
            setSuccess(`Successfully saved changes for "${scheduleToUpdate.area}".`);
        } catch (err) {
            setError('Failed to save schedule.');
        }
    };
    
    const handleAdd = async () => {
        setSuccess('');
        try {
            await api.post('/api/schedules', {}, getConfig());
            fetchSchedules();
        } catch (err) {
            setError('Failed to add new schedule.');
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            setSuccess('');
            try {
                await api.delete(`api/schedules/${id}`, getConfig());
                fetchSchedules();
            } catch (err) {
                setError('Failed to delete schedule.');
            }
        }
    };

    const handleChange = (id, field, value) => {
        setSchedules(schedules.map(s => s._id === id ? { ...s, [field]: value } : s));
    };

    if (loading) return <p>Loading schedules...</p>;
    if (error) return <p className="text-red-500 font-semibold">{error}</p>;

    return (
        // --- RESPONSIVE CHANGES APPLIED ---
        <div className="animate-fadeIn">
            <div className="flex justify-end mb-4">
                <button onClick={handleAdd} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    + Add New Schedule
                </button>
            </div>
            {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}
            <div className="space-y-6">
                {schedules.map((schedule) => (
                    <div key={schedule._id} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                        <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700">Area</label>
                            <input
                                type="text"
                                value={schedule.area}
                                onChange={(e) => handleChange(schedule._id, 'area', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Collection Details</label>
                            <textarea
                                value={schedule.collection}
                                onChange={(e) => handleChange(schedule._id, 'collection', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                rows="2"
                            />
                        </div>
                        {/* The buttons will stack on mobile and be side-by-side on larger screens */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
                            <button 
                                onClick={() => handleSave(schedule._id)} 
                                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Save Changes
                            </button>
                             <button 
                                onClick={() => handleDelete(schedule._id)} 
                                className="text-red-600 hover:text-red-900 font-semibold self-start sm:self-center pt-2 sm:pt-0"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EditSchedule;

