import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';    

const RegisterPage = () => {
    const [name, setName]                             = useState('');
    const [email, setEmail]                           = useState('');
    const [password, setPassword]                     = useState('');
    const [secretKey, setSecretKey]                   = useState('');
    const [isRegisteringAsAdmin, setIsRegisteringAsAdmin] = useState(false);
    const [error, setError]                           = useState('');
    const [success, setSuccess]                       = useState('');
    const [loading, setLoading]                       = useState(false);

    const { login } = useAuth();      
    const navigate  = useNavigate();  

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const userData = { name, email, password };
            if (isRegisteringAsAdmin && secretKey) {
                userData.secretKey = secretKey;
            }
            const { data } = await api.post('/api/users/register', userData);
            setSuccess(data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during registration.');
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
            setError(err.response?.data?.message || 'Google sign-up failed. Please try again.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">Create an Account</h2>

                {success ? (
                    <div className="text-center p-4 bg-green-100 text-green-800 rounded-md">
                        <p>{success}</p>
                        <Link to="/login" className="font-bold text-green-600 hover:underline mt-2 inline-block">
                            Proceed to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google sign-up failed. Please try again.')}
                                useOneTap={false}
                                text="signup_with"
                                shape="rectangular"
                                theme="outline"
                                size="large"
                                width={window.innerWidth < 640 ? 300 : 368}
                            />
                        </div>

                        <div className="relative flex items-center justify-center">
                            <div className="border-t border-gray-300 w-full"></div>
                            <span className="bg-white px-3 text-sm text-gray-500 absolute">
                                or register with email
                            </span>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                                <input id="name" type="text" required value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
                                <input id="email" type="email" required value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                                <input id="password" type="password" required value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="isAdmin" type="checkbox"
                                    checked={isRegisteringAsAdmin}
                                    onChange={(e) => setIsRegisteringAsAdmin(e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                                    I am registering as an Admin
                                </label>
                            </div>

                            {isRegisteringAsAdmin && (
                                <div>
                                    <label htmlFor="secretKey" className="text-sm font-medium text-gray-700">Admin Key</label>
                                    <input id="secretKey" type="text" required value={secretKey}
                                        onChange={(e) => setSecretKey(e.target.value)}
                                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="Enter the secret admin key"
                                    />
                                </div>
                            )}

                            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                            <button
                                type="submit" disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </form>
                    </>
                )}

                {!success && (
                    <p className="text-sm text-center text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                            Login here
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;