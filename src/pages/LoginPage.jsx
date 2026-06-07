import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';    

const LoginPage = () => {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/api/users/login', { email, password });
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        try {
            const { data } = await api.post('/api/users/google-auth', {
                credential: credentialResponse.credential,
            });
            login(data);      
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Google login failed. Please try again.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] py-12 px-4 sm:px-6 animate-fadeIn">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800">Welcome Back!</h2>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google login failed. Please try again.')}
                        useOneTap={false}
                        text="continue_with"
                        shape="rectangular"
                        theme="outline"
                        size="large"
                        width={window.innerWidth < 640 ? 300 : 368}
                    />
                </div>

                <div className="relative flex items-center justify-center">
                    <div className="border-t border-gray-300 w-full"></div>
                    <span className="bg-white px-3 text-sm text-gray-500 absolute">
                        or sign in with email
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email" name="email" type="email" autoComplete="email" required
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password" name="password" type="password"
                            autoComplete="current-password" required
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    <div className="text-right text-sm">
                        <Link to="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
                            Forgot your password?
                        </Link>
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <button
                        type="submit" disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;