import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const { data } = await api.put(`/api/users/reset-password/${token}`, { password });
            setMessage(data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] py-12 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800">Reset Your Password</h2>
                
                {message && <div className="p-3 bg-green-100 text-green-700 rounded-lg">{message}</div>}
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password">New Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                             className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                        />
                    </div>
                     <div>
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                             className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50">
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
