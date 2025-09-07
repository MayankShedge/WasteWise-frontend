import React, { useState } from 'react';
import api from '../api/axios';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const { data } = await api.post('/api/users/forgot-password', { email });
            setMessage(data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] py-12 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800">Forgot Password</h2>
                <p className="text-center text-gray-600">Enter your email and we'll send you a link to reset your password.</p>

                {message && <div className="p-3 bg-green-100 text-green-700 rounded-lg">{message}</div>}
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
