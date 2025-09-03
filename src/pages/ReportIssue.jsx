import React, { useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ReportIssuePage = () => {
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { userInfo } = useAuth();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!file) {
            setError('Please upload an image.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const location = {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                };

                const formData = new FormData();
                formData.append('image', file);
                formData.append('description', description);
                formData.append('location', JSON.stringify(location));

                try {
                    const config = {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${userInfo.token}`,
                        },
                    };

                    await api.post('/api/reports', formData, config);
                    setSuccess('Report submitted successfully! Thank you for your contribution.');
                    setTimeout(() => navigate('/'), 3000);
                } catch (err) {
                    setError('Failed to submit report. Please try again.');
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                setError('Could not get your location. Please enable location services in your browser.');
                setLoading(false);
            }
        );
    };

    return (
        // --- RESPONSIVE CHANGES APPLIED ---
        <div className="container mx-auto max-w-2xl py-8 px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800">Report an Issue</h1>
            <p className="text-md sm:text-lg text-gray-600 mt-2 text-center">Spotted an overflowing bin or a littered area? Let us know!</p>
            
            <form onSubmit={handleSubmit} className="mt-8 p-6 sm:p-8 bg-white rounded-2xl shadow-lg">
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}

                <div className="mb-6">
                    <label htmlFor="description" className="block text-md sm:text-lg font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        rows="4"
                        placeholder="e.g., The bin near the bus stop is completely full."
                    ></textarea>
                </div>
                <div className="mb-6">
                     <label htmlFor="image" className="block text-md sm:text-lg font-medium text-gray-700 mb-2">Upload Photo</label>
                     <input type="file" id="image" onChange={handleFileChange} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                </div>
                {preview && (
                    <div className="mb-6">
                        <img src={preview} alt="Preview" className="w-full max-h-64 object-contain rounded-lg border p-2"/>
                    </div>
                )}
                <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-md disabled:opacity-50">
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
};

export default ReportIssuePage;

