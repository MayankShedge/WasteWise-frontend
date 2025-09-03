import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext';

// Import TensorFlow.js and the MobileNet model
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// A small spinner component for loading states
const Spinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
);

// The mapping for classification results
const wasteMapping = {
    'water bottle': 'Dry Waste', 'plastic bag': 'Dry Waste', 'cup': 'Dry Waste', 'packet': 'Dry Waste',
    'paper': 'Dry Waste', 'newspaper': 'Dry Waste', 'carton': 'Dry Waste', 'cardboard': 'Dry Waste',
    'can': 'Dry Waste', 'tin': 'Dry Waste', 'foil': 'Dry Waste', 'bottle cap': 'Dry Waste',
    'glass bottle': 'Dry Waste', 'jar': 'Dry Waste',
    'banana': 'Wet Waste', 'apple': 'Wet Waste', 'orange': 'Wet Waste', 'vegetable': 'Wet Waste',
    'mobile phone': 'E-Waste', 'charger': 'E-Waste', 'battery': 'E-Waste', 'remote': 'E-Waste',
    'light bulb': 'Hazardous Waste', 'medicine': 'Hazardous Waste', 'syringe': 'Hazardous Waste',
};


const ScannerPage = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modelStatus, setModelStatus] = useState('Loading AI Model...');
    const [error, setError] = useState('');

    const model = useRef(null);
    const imageRef = useRef();

    const { userInfo, updateUser } = useAuth(); 

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                model.current = await mobilenet.load();
                setModelStatus('AI Model Ready!');
            } catch (err) {
                console.error("Failed to load model:", err);
                setModelStatus('Failed to load AI Model.');
                setError('Could not load the AI model. Please refresh the page.');
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
        if (!file || !model.current) return;
        setLoading(true);
        setError('');

        try {
            const predictions = await model.current.classify(imageRef.current);
            
            let finalResult = null;
            if (predictions && predictions.length > 0) {
                const itemName = predictions[0].className.split(',')[0].toLowerCase();
                const category = wasteMapping[itemName] || 'Dry Waste';
                finalResult = { item: itemName, category };
                setResult(finalResult);
            }
            
            if (finalResult && userInfo) {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                try {
                    const { data: updatedUser } = await api.post('/api/users/add-points', {}, config);
                    updateUser(updatedUser); 
                    await api.post('/api/history', { 
                        item: finalResult.item, 
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
        // --- RESPONSIVE CHANGES APPLIED ---
        <div className="container mx-auto max-w-2xl py-8 px-4 sm:px-6 animate-fadeIn">
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Scan Your Waste</h1>
                <p className="text-md sm:text-lg text-gray-600 mt-2">Let our AI tell you how to segregate it!</p>
                <p className={`text-sm mt-1 font-semibold ${modelStatus === 'AI Model Ready!' ? 'text-green-600' : 'text-yellow-600'}`}>{modelStatus}</p>
            </div>

            <div className="mt-8 p-4 sm:p-8 bg-white rounded-2xl shadow-lg">
                <div className="w-full h-56 sm:h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400">
                    {preview ? <img ref={imageRef} src={preview} alt="Preview" className="h-full w-full object-contain rounded-lg" /> : 'Image preview will appear here'}
                </div>

                <div className="mt-6 flex flex-col items-center">
                    <label htmlFor="file-upload" className="cursor-pointer bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-md w-full sm:w-auto text-center">
                        {file ? 'Change Image' : 'Upload an Image'}
                    </label>
                    <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    
                    {file && <button onClick={handleClassify} disabled={loading || modelStatus !== 'AI Model Ready!'} className="mt-4 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md disabled:opacity-50 min-w-[150px] w-full sm:w-auto">
                        {loading ? <Spinner /> : 'Classify Waste'}
                    </button>}
                </div>

                {error && <p className="mt-4 text-center text-red-500 font-semibold">{error}</p>}

                {result && (
                     <div className={`mt-6 p-4 sm:p-6 rounded-lg text-center animate-fadeIn border ${result.category.includes('Dry') ? 'bg-blue-100 border-blue-300' : ''} ${result.category.includes('Wet') ? 'bg-green-100 border-green-300' : ''} ${result.category.includes('E-Waste') ? 'bg-purple-100 border-purple-300' : ''} ${result.category.includes('Hazardous') ? 'bg-red-100 border-red-300' : ''}`}>
                        <p className="text-sm font-medium text-gray-500">Identified Item:</p>
                        <h3 className="text-xl sm:text-2xl font-bold capitalize text-gray-800">{result.item}</h3>
                        <p className="mt-4 text-sm font-medium text-gray-500">Category:</p>
                        <p className={`text-2xl sm:text-3xl font-bold ${result.category.includes('Dry') ? 'text-blue-600' : ''} ${result.category.includes('Wet') ? 'text-green-600' : ''} ${result.category.includes('E-Waste') ? 'text-purple-600' : ''} ${result.category.includes('Hazardous') ? 'text-red-600' : ''}`}>
                            {result.category}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScannerPage;

