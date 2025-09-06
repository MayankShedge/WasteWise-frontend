import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// SVG Icons remain the same
const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const RecycleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-1 4h.01M9 11h.01M12 7h.01M12 11h.01" /></svg>
);
const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);
const BiohazardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);
const ElectronicsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const UnknownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

// Smart mapping from ImageNet classes to waste categories
const classifyWasteFromImageNet = (predictions) => {
    const organicKeywords = [
        'banana', 'orange', 'apple', 'strawberry', 'pineapple', 'lemon', 'pomegranate',
        'fig', 'bell pepper', 'cucumber', 'artichoke', 'corn', 'broccoli', 'mushroom',
        'bagel', 'pizza', 'burrito', 'hot dog', 'hamburger', 'french fries',
        'ice cream', 'chocolate', 'pretzel', 'popcorn', 'meat', 'egg'
    ];
    
    const recyclableKeywords = [
        'bottle', 'wine bottle', 'beer bottle', 'pop bottle', 'water bottle',
        'tin can', 'beer can', 'soda can', 'aluminum',
        'plastic bag', 'shopping bag', 'paper bag',
        'cardboard', 'carton', 'box',
        'glass', 'jar', 'container',
        'newspaper', 'magazine', 'book', 'envelope'
    ];
    
    const electronicKeywords = [
        'laptop', 'computer', 'desktop computer', 'notebook', 'monitor',
        'cell phone', 'smartphone', 'telephone', 'phone',
        'television', 'tv', 'screen', 'display',
        'camera', 'digital camera', 'camcorder',
        'radio', 'speaker', 'headphones', 'microphone',
        'battery', 'charger', 'cable', 'wire',
        'calculator', 'electronic device', 'tablet'
    ];
    
    const hazardousKeywords = [
        'battery', 'lighter', 'match', 'candle',
        'spray', 'aerosol', 'chemical',
        'paint brush', 'bucket'
    ];
    
    const medicalKeywords = [
        'syringe', 'pill bottle', 'medicine chest',
        'mask', 'bandage', 'thermometer'
    ];

    for (const prediction of predictions) {
        const className = prediction.className.toLowerCase();
        
        // Check each category
        if (organicKeywords.some(keyword => className.includes(keyword))) {
            return {
                category: 'Wet Waste',
                styles: 'bg-green-50 border-green-500 text-green-800',
                icon: <LeafIcon />,
                description: 'Organic waste. Perfect for composting.',
                detectedItem: prediction.className,
                confidence: prediction.probability
            };
        }
        
        if (recyclableKeywords.some(keyword => className.includes(keyword))) {
            return {
                category: 'Dry Waste',
                styles: 'bg-blue-50 border-blue-500 text-blue-800',
                icon: <RecycleIcon />,
                description: 'Recyclable material. Clean before disposal.',
                detectedItem: prediction.className,
                confidence: prediction.probability
            };
        }
        
        if (electronicKeywords.some(keyword => className.includes(keyword))) {
            return {
                category: 'E-waste',
                styles: 'bg-purple-50 border-purple-500 text-purple-800',
                icon: <ElectronicsIcon />,
                description: 'Electronic waste. Take to e-waste collection points.',
                detectedItem: prediction.className,
                confidence: prediction.probability
            };
        }
        
        if (hazardousKeywords.some(keyword => className.includes(keyword))) {
            return {
                category: 'Hazardous Waste',
                styles: 'bg-red-50 border-red-500 text-red-800',
                icon: <WarningIcon />,
                description: 'Hazardous waste. Requires special disposal.',
                detectedItem: prediction.className,
                confidence: prediction.probability
            };
        }
        
        if (medicalKeywords.some(keyword => className.includes(keyword))) {
            return {
                category: 'Biomedical Waste',
                styles: 'bg-pink-50 border-pink-500 text-pink-800',
                icon: <BiohazardIcon />,
                description: 'Medical waste. Contact health authorities.',
                detectedItem: prediction.className,
                confidence: prediction.probability
            };
        }
    }
    
    // Default classification based on most common items
    const topPrediction = predictions[0];
    const className = topPrediction.className.toLowerCase();
    
    if (className.includes('bag') || className.includes('container') || className.includes('cup')) {
        return {
            category: 'Dry Waste',
            styles: 'bg-blue-50 border-blue-500 text-blue-800',
            icon: <RecycleIcon />,
            description: 'Likely recyclable. Check local guidelines.',
            detectedItem: topPrediction.className,
            confidence: topPrediction.probability
        };
    }
    
    return {
        category: 'General Waste',
        styles: 'bg-gray-100 border-gray-400 text-gray-700',
        icon: <UnknownIcon />,
        description: 'Unable to determine waste type. Please dispose according to local guidelines.',
        detectedItem: topPrediction.className,
        confidence: topPrediction.probability
    };
};

const RECYCLABLE_CATEGORIES = ["Dry Waste"];

const Spinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
);

const ScannerPage = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modelStatus, setModelStatus] = useState('Loading MobileNet AI Model...');
    const [error, setError] = useState('');
    
    const model = useRef(null);
    const imageRef = useRef();
    const { userInfo, updateUser } = useAuth();

    useEffect(() => {
        const loadModel = async () => {
            try {
                setModelStatus('Loading MobileNet AI Model...');
                
                // Load TensorFlow.js
                await tf.ready();
                
                // Load MobileNet model - this is guaranteed to work
                model.current = await mobilenet.load();
                
                setModelStatus('MobileNet AI Model Ready!');
            } catch (err) {
                console.error("Failed to load model:", err);
                setModelStatus('Failed to load MobileNet AI Model.');
                setError('Could not load the AI model. Please check your internet connection and refresh.');
            }
        };
        loadModel();
    }, []);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
            setError('');
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleClassify = async () => {
        if (!file || !model.current || !imageRef.current) return;
        setLoading(true);
        setError('');

        try {
            // Use MobileNet to classify the image
            const predictions = await model.current.classify(imageRef.current);
            
            console.log('MobileNet predictions:', predictions);
            
            // Map ImageNet classification to waste categories
            const wasteClassification = classifyWasteFromImageNet(predictions);
            
            const finalResult = {
                category: wasteClassification.category,
                detectedItem: wasteClassification.detectedItem,
                confidence: (wasteClassification.confidence * 100).toFixed(1),
                config: wasteClassification,
                isRecyclable: RECYCLABLE_CATEGORIES.includes(wasteClassification.category),
                allPredictions: predictions.slice(0, 3).map(p => ({
                    label: p.className,
                    confidence: (p.probability * 100).toFixed(1)
                }))
            };

            setResult(finalResult);

            // Update user points and history
            if (userInfo) {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                try {
                    const { data: updatedUser } = await api.post('/api/users/add-points', {}, config);
                    updateUser(updatedUser);
                    await api.post('/api/history', { 
                        item: `Classified as ${finalResult.category} (${finalResult.detectedItem})`, 
                        category: finalResult.category 
                    }, config);
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
                <p className="text-md sm:text-lg text-gray-600 mt-2">Powered by Google's MobileNet AI with smart waste classification!</p>
                <p className={`text-sm mt-1 font-semibold ${modelStatus === 'MobileNet AI Model Ready!' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {modelStatus}
                </p>
            </div>
            
            <div className="mt-8 p-4 sm:p-8 bg-white rounded-2xl shadow-xl">
                <div className="w-full h-56 sm:h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400 overflow-hidden">
                    {preview ? (
                        <img 
                            ref={imageRef}
                            src={preview} 
                            alt="Preview" 
                            className="h-full w-full object-contain"
                            crossOrigin="anonymous"
                        />
                    ) : (
                        'Image preview will appear here'
                    )}
                </div>
                
                <div className="mt-6 flex flex-col items-center">
                    <label htmlFor="file-upload" className="cursor-pointer bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 duration-300 shadow-md w-full sm:w-auto text-center">
                        {file ? 'Change Image' : 'Upload an Image'}
                    </label>
                    <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    
                    {file && (
                        <button 
                            onClick={handleClassify} 
                            disabled={loading || modelStatus !== 'MobileNet AI Model Ready!'} 
                            className="mt-4 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px] w-full sm:w-auto"
                        >
                            {loading ? <Spinner /> : 'Classify Waste'}
                        </button>
                    )}
                </div>
                
                {error && <p className="mt-4 text-center text-red-500 font-semibold">{error}</p>}
                
                {/* Enhanced Result Display */}
                {result && (
                    <div className={`mt-8 p-5 rounded-xl shadow-lg border-l-8 transition-all duration-500 animate-fadeIn ${result.config.styles}`}>
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                {result.config.icon}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600">Classified As</p>
                                <h3 className="text-2xl sm:text-3xl font-bold">{result.category}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Detected: {result.detectedItem} ({result.confidence}% confidence)
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 text-gray-700">{result.config.description}</p>
                        
                        <div className="mt-4 pt-3 border-t border-gray-300/50">
                            <p className={`text-lg font-bold ${result.isRecyclable ? 'text-green-700' : 'text-red-700'}`}>
                                {result.isRecyclable ? '✅ This waste is recyclable' : '❌ This waste is not recyclable'}
                            </p>
                        </div>

                        {/* Show MobileNet predictions */}
                        {result.allPredictions && result.allPredictions.length > 1 && (
                            <div className="mt-4 pt-3 border-t border-gray-300/50">
                                <p className="text-sm font-semibold text-gray-600 mb-2">AI detected objects:</p>
                                <div className="text-xs text-gray-500 space-y-1">
                                    {result.allPredictions.map((pred, idx) => (
                                        <div key={idx}>
                                            {pred.label}: {pred.confidence}%
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScannerPage;
