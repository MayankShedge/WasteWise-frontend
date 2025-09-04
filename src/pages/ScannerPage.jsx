import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import * as tf from '@tensorflow/tfjs';

// NEW: SVG Icons as React components for a clean and modern look.
const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const RecycleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-1 4h.01M9 11h.01M12 7h.01M12 11h.01" /></svg>
);
const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);
const HealthIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const BiohazardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);
const ElectronicsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const RockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
);
const UnknownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);


// NEW: Central configuration for waste categories.
// This makes it easy to manage colors, icons, and text for each category.
// IMPORTANT: Make sure the keys (e.g., 'Wet waste') EXACTLY match the labels from your Teachable Machine model.
const WASTE_CATEGORY_CONFIG = {
    'Wet Waste': { // <-- CORRECTED
        styles: 'bg-green-50 border-green-500 text-green-800',
        icon: <LeafIcon />,
        description: 'This waste is organic and should be composted.',
    },
    'Dry Waste': { // <-- CORRECTED
        styles: 'bg-blue-50 border-blue-500 text-blue-800',
        icon: <RecycleIcon />,
        description: 'This item is typically recyclable. Please clean before disposal.',
    },
    'Hazardous Waste': { // <-- CORRECTED
        styles: 'bg-red-50 border-red-500 text-red-800',
        icon: <WarningIcon />,
        description: 'Handle with care. Do not mix with other waste.',
    },
    'Biomedical Waste': { // <-- CORRECTED
        styles: 'bg-pink-50 border-pink-500 text-pink-800',
        icon: <BiohazardIcon />,
        description: 'Requires special disposal. Contact local authorities.',
    },
    'E-waste': { // This one might be correct, but double-check your console output for it
        styles: 'bg-gray-50 border-gray-500 text-gray-800',
        icon: <ElectronicsIcon />,
        description: 'Electronic waste must be disposed of at designated collection points.',
    },
    // Fallback for any unknown categories
    'Unknown': {
        styles: 'bg-gray-100 border-gray-400 text-gray-700',
        icon: <UnknownIcon />,
        description: 'The waste category could not be determined.',
    }
};

// NEW: List of categories that are considered recyclable.
const RECYCLABLE_CATEGORIES = ["Dry Waste", "E-waste"];

const Spinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
);

const ScannerPage = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [result, setResult] = useState(null); // Holds the raw classification result
    const [loading, setLoading] = useState(false);
    const [modelStatus, setModelStatus] = useState('Loading Custom AI Model...');
    const [error, setError] = useState('');

    const model = useRef(null);
    const imageRef = useRef();
    const classNames = useRef([]);

    const { userInfo, updateUser } = useAuth();

    useEffect(() => {
        const loadModel = async () => {
            const modelURL = 'https://teachablemachine.withgoogle.com/models/DshggloHh/model.json';
            
            try {
                await tf.ready();
                model.current = await tf.loadLayersModel(modelURL);
                
                const metadataURL = modelURL.replace('model.json', 'metadata.json');
                const response = await fetch(metadataURL);
                const metadata = await response.json();
                classNames.current = metadata.labels;

                setModelStatus('Custom AI Model Ready!');
            } catch (err) {
                console.error("Failed to load custom model:", err);
                setModelStatus('Failed to load Custom AI Model.');
                setError('Could not load the AI model. Please check the URL and refresh.');
            }
        };
        loadModel();
    }, []);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null); // Clear previous results
            setError('');
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleClassify = async () => {
        if (!file || !model.current) return;
        setLoading(true);
        setError('');

        try {
            const imageTensor = tf.browser.fromPixels(imageRef.current)
                .resizeNearestNeighbor([224, 224])
                .toFloat()
                .div(tf.scalar(255))
                .expandDims();

            const predictions = await model.current.predict(imageTensor).data();
            const topPredictionIndex = predictions.indexOf(Math.max(...predictions));
            const category = classNames.current[topPredictionIndex] || 'Unknown';

            console.log('AI Model Output:', category);
            
            const finalResult = {
                category: category,
                // NEW: Get the config for the detected category
                config: WASTE_CATEGORY_CONFIG[category] || WASTE_CATEGORY_CONFIG['Unknown'],
                // NEW: Determine if it's recyclable
                isRecyclable: RECYCLABLE_CATEGORIES.includes(category),
            };

            setResult(finalResult);

            imageTensor.dispose();
            
            if (userInfo) {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                try {
                    const { data: updatedUser } = await api.post('/api/users/add-points', {}, config);
                    updateUser(updatedUser); 
                    await api.post('/api/history', { item: `Classified as ${finalResult.category}`, category: finalResult.category }, config);
                } catch (pointError) {
                    console.error("Failed to update points or log history:", pointError);
                }
            }
        } catch (err) {
            setError('Could not classify the image. Please try another one.');
            console.error('Classification Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-8 px-4 sm:px-6 animate-fadeIn">
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Scan Your Waste</h1>
                <p className="text-md sm:text-lg text-gray-600 mt-2">Let our AI tell you how to segregate it!</p>
                <p className={`text-sm mt-1 font-semibold ${modelStatus === 'Custom AI Model Ready!' ? 'text-green-600' : 'text-yellow-600'}`}>{modelStatus}</p>
            </div>
            
            <div className="mt-8 p-4 sm:p-8 bg-white rounded-2xl shadow-xl">
                <div className="w-full h-56 sm:h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400 overflow-hidden">
                    {preview ? <img ref={imageRef} src={preview} alt="Preview" className="h-full w-full object-contain" /> : 'Image preview will appear here'}
                </div>
                <div className="mt-6 flex flex-col items-center">
                    <label htmlFor="file-upload" className="cursor-pointer bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 duration-300 shadow-md w-full sm:w-auto text-center">
                        {file ? 'Change Image' : 'Upload an Image'}
                    </label>
                    <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    {file && <button onClick={handleClassify} disabled={loading || modelStatus !== 'Custom AI Model Ready!'} className="mt-4 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px] w-full sm:w-auto">
                        {loading ? <Spinner /> : 'Classify Waste'}
                    </button>}
                </div>
                {error && <p className="mt-4 text-center text-red-500 font-semibold">{error}</p>}
                
                {/* NEW: Modernized Result Card */}
                {result && (
                     <div className={`mt-8 p-5 rounded-xl shadow-lg border-l-8 transition-all duration-500 animate-fadeIn ${result.config.styles}`}>
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                {result.config.icon}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600">Classified As</p>
                                <h3 className="text-2xl sm:text-3xl font-bold">{result.category}</h3>
                            </div>
                        </div>

                        <p className="mt-4 text-gray-700">{result.config.description}</p>
                        
                        <div className="mt-4 pt-3 border-t border-gray-300/50">
                            <p className={`text-lg font-bold ${result.isRecyclable ? 'text-green-700' : 'text-red-700'}`}>
                                {result.isRecyclable ? '✅ This waste is recyclable' : '❌ This waste is not recyclable'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScannerPage;