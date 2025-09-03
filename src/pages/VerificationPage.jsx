import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';

// --- Helper Components for Icons ---

const Spinner = () => (
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
);

const SuccessIcon = () => (
    <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

const ErrorIcon = () => (
    <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);


const VerificationPage = () => {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Verifying your email...');
    const [error, setError] = useState(false);
    const { token } = useParams();
    const hasVerified = useRef(false);

    useEffect(() => {
        if (hasVerified.current === false) {
            const verifyEmail = async () => {
                if (!token) {
                    setStatus('Invalid verification link.');
                    setError(true);
                    setLoading(false);
                    return;
                }

                try {
                    const { data } = await api.get(`/api/users/verify/${token}`);
                    setStatus(data.message);
                    setError(false);
                } catch (err) {
                    setStatus(err.response?.data?.message || 'Verification failed. Please try again.');
                    setError(true);
                } finally {
                    setLoading(false);
                }
            };

            verifyEmail();
            hasVerified.current = true;
        }
    }, [token]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50 p-4 animate-fadeIn">
            <div className="p-10 bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center">
                <div className="mb-6">
                    {/* Conditionally render the icon based on the loading and error states */}
                    {loading ? <Spinner /> : (error ? <ErrorIcon /> : <SuccessIcon />)}
                </div>

                <h1 className="text-3xl font-bold text-gray-800">
                    {loading ? 'Almost there...' : (error ? 'Verification Failed' : 'Verification Complete!')}
                </h1>

                <p className="mt-4 text-lg text-gray-600">{status}</p>
                
                {!loading && !error && (
                    <Link
                        to="/login"
                        className="mt-8 inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105"
                    >
                        Proceed to Login
                    </Link>
                )}
            </div>
        </div>
    );
};

export default VerificationPage;

