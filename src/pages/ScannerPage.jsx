import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const RecycleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-1 4h.01M9 11h.01M12 7h.01M12 11h.01" />
    </svg>
);

const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732 3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const BiohazardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const ElectronicsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const UnknownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const enhanceImage = (imageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 224;
    canvas.height = 224;
    
    // Fill background with white (not black bars)
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 224, 224);
    
    // Calculate scale to fit image without distortion
    const scale = Math.min(224 / imageElement.width, 224 / imageElement.height);
    const x = (224 - imageElement.width * scale) / 2;
    const y = (224 - imageElement.height * scale) / 2;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageElement, x, y, imageElement.width * scale, imageElement.height * scale);
    
    return canvas;
};

// Load MobileNet model
const loadAdvancedMobileNet = async () => {
    try {
        const model = await mobilenet.load({
            version: 2,
            alpha: 1.0,
            inputRange: [0, 1]
        });
        return model;
    } catch (error) {
        return await mobilenet.load();
    }
};

// Get predictions from model
const superEnhancedClassify = async (model, imageElement) => {
    try {
        const enhancedCanvas = enhanceImage(imageElement);
        const predictions = await model.classify(enhancedCanvas, 10);
        
        const processedPredictions = predictions.map((pred, index) => ({
            className: pred.className,
            probability: pred.probability,
            rank: index + 1,
            confidence: pred.probability
        }));
        
        return processedPredictions;
    } catch (error) {
        return await model.classify(imageElement, 5);
    }
};

const fuzzyMatch = (text, keyword) => {
    const t = text.toLowerCase();
    const k = keyword.toLowerCase();
    
    if (t.includes(k)) return true;
    if (t.includes(k + 's') || t.includes(k + 'es')) return true;
    if (k.endsWith('s') && t.includes(k.slice(0, -1))) return true;
    
    return false;
};

const containsAnyKeyword = (text, keywords) => {
    return keywords.some(keyword => fuzzyMatch(text, keyword));
};

const learningEnhancedClassify = async (model, imageElement) => {
    const predictions = await superEnhancedClassify(model, imageElement);
    
    // Try to get learning data for top 3 predictions
    for (let i = 0; i < Math.min(predictions.length, 3); i++) {
        const prediction = predictions[i];
        const detectedItem = prediction.className.toLowerCase();
        
        try {
            const response = await api.get(`/api/learning/${encodeURIComponent(detectedItem)}`);
            const learningData = response.data;
            
            if (learningData.hasLearning) {
                const learningConfidence = Math.min(
                    (prediction.probability + 0.3) * learningData.confidence, 
                    1.0
                );
                
                return {
                    category: learningData.correctCategory,
                    confidence: learningConfidence,
                    method: 'Learning Enhanced',
                    detectedItem: prediction.className,
                    styles: getCategoryStyles(learningData.correctCategory),
                    icon: getCategoryIcon(learningData.correctCategory),
                    description: getCategoryDescription(learningData.correctCategory, prediction.className) + 
                              ` (Learned from ${learningData.frequency} correction${learningData.frequency > 1 ? 's' : ''})`
                };
            }
        } catch (learningError) {
            continue;
        }
    }
    
    // If no learning data, use improved classification
    return await improvedWasteClassification(predictions);
};

const improvedWasteClassification = async (predictions) => {
    // console.log('=== CLASSIFICATION START ===');
    // console.log('Top 5 predictions:', predictions.slice(0, 5).map(p => 
    //     `${p.className} (${(p.probability * 100).toFixed(1)}%)`
    // ));

    // Comprehensive waste category rules
    const wasteRules = {
        'Wet Waste': {
            highPriority: [
                'banana', 'apple', 'orange', 'strawberry', 'pineapple', 'lemon', 'grape', 'mango',
                'peach', 'pear', 'plum', 'cherry', 'watermelon', 'melon', 'papaya', 'avocado',
                'carrot', 'broccoli', 'cucumber', 'tomato', 'potato', 'onion', 'pepper', 'lettuce',
                'pizza', 'burger', 'sandwich', 'bread', 'meat', 'fish', 'egg', 'cheese'
            ],
            mediumPriority: [
                'salad', 'soup', 'meal', 'snack', 'food', 'fruit', 'vegetable', 'organic', 'plant'
            ],
            exclusions: ['bottle', 'container', 'plastic', 'metal', 'glass', 'phone', 'computer', 'bag'],
            weight: 2.0
        },
        'Dry Waste': {
            highPriority: [
                'bottle', 'can', 'jar', 'glass', 'plastic', 'metal', 'aluminum', 'steel',
                'paper', 'cardboard', 'box', 'carton', 'container', 'wrapper', 'bag'
            ],
            mediumPriority: [
                'cup', 'plate', 'packaging', 'tin', 'foil', 'crate', 'basket', 'bucket'
            ],
            exclusions: ['phone', 'computer', 'electronic', 'battery', 'syringe', 'medical', 'needle'],
            weight: 1.5
        },
        'E-waste': {
            highPriority: [
                'phone', 'computer', 'laptop', 'monitor', 'keyboard', 'mouse', 'camera',
                'television', 'radio', 'battery', 'charger', 'electronic', 'device',
                // CRITICAL: Vehicles belong here!
                'scooter', 'motorcycle', 'bike', 'bicycle', 'moped', 'vehicle', 'motor'
            ],
            mediumPriority: [
                'tablet', 'speaker', 'headphone', 'microwave', 'appliance', 'gadget', 'remote'
            ],
            exclusions: ['toy', 'game', 'doll'],
            weight: 2.0
        },
        'Hazardous Waste': {
            highPriority: [
                'battery', 'paint', 'chemical', 'oil', 'fuel', 'lighter', 'aerosol',
                'toxic', 'poison', 'bleach', 'acid', 'solvent'
            ],
            mediumPriority: [
                'cleaner', 'spray', 'flammable', 'pesticide', 'herbicide'
            ],
            exclusions: ['toy', 'food', 'fruit', 'vegetable', 'bottle'],
            weight: 1.8
        },
        'Biomedical Waste': {
            highPriority: [
                'syringe', 'needle', 'medical', 'surgical', 'hospital', 'pharmaceutical',
                'pill bottle', 'medicine', 'bandage', 'specimen'
            ],
            mediumPriority: [
                'clinical', 'health', 'therapy', 'vaccine'
            ],
            exclusions: [
                'scooter', 'bike', 'vehicle', 'motorcycle', 'car', 'moped',
                'furniture', 'chair', 'table', 'desk', 'shelf',
                'crate', 'basket', 'container', 'box', 'bucket', 'pail',
                'toy', 'game', 'doll', 'ball'
            ],
            weight: 1.5
        }
    };

    let categoryScores = {
        'Wet Waste': 0,
        'Dry Waste': 0,
        'E-waste': 0,
        'Hazardous Waste': 0,
        'Biomedical Waste': 0
    };

    // Process all predictions
    for (let i = 0; i < Math.min(predictions.length, 10); i++) {
        const pred = predictions[i];
        const label = pred.className;
        const confidence = pred.probability;
        
        // Position weight: earlier predictions matter more
        const positionWeight = Math.max(0.3, 1.0 - (i * 0.08));
        const baseScore = confidence * positionWeight;

        // Check each waste category
        for (const [category, rules] of Object.entries(wasteRules)) {
            
            // Step 1: Check exclusions first
            if (containsAnyKeyword(label, rules.exclusions)) {
                if (i < 3) console.log(`  ❌ ${label} excluded from ${category}`);
                continue;
            }

            // Step 2: Check high priority keywords
            if (containsAnyKeyword(label, rules.highPriority)) {
                const score = baseScore * rules.weight * 1.5;
                categoryScores[category] += score;
                if (i < 3) console.log(`  ✓✓ ${label} → ${category} (HIGH): +${score.toFixed(3)}`);
                continue;
            }

            // Step 3: Check medium priority keywords
            if (containsAnyKeyword(label, rules.mediumPriority)) {
                const score = baseScore * rules.weight;
                categoryScores[category] += score;
                if (i < 3) console.log(`  ✓ ${label} → ${category} (MED): +${score.toFixed(3)}`);
            }
        }
    }

    console.log('Final scores:', Object.entries(categoryScores).map(([cat, s]) => 
        `${cat}: ${(s * 100).toFixed(1)}%`
    ));

    // Find best category
    let bestCategory = 'Dry Waste';
    let bestScore = 0;

    for (const [category, score] of Object.entries(categoryScores)) {
        if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
        }
    }

    // Use fallback if confidence too low
    if (bestScore < 0.15) {
        console.log('⚠️ Low confidence, using fallback');
        return intelligentFallback(predictions[0]);
    }

    console.log(`✅ Final: ${bestCategory} (${(bestScore * 100).toFixed(1)}%)`);
    console.log('=== CLASSIFICATION END ===\n');

    return {
        category: bestCategory,
        confidence: bestScore,
        method: 'Improved Classification',
        detectedItem: predictions[0].className,
        styles: getCategoryStyles(bestCategory),
        icon: getCategoryIcon(bestCategory),
        description: getCategoryDescription(bestCategory, predictions[0].className)
    };
};

const intelligentFallback = (prediction) => {
    const className = prediction.className.toLowerCase();
    
    // Vehicles
    if (className.includes('scooter') || className.includes('motorcycle') || 
        className.includes('bike') || className.includes('vehicle') || 
        className.includes('moped')) {
        return {
            category: 'E-waste',
            styles: getCategoryStyles('E-waste'),
            icon: getCategoryIcon('E-waste'),
            description: 'Vehicle/bulky item (motor scooter). Requires special e-waste disposal.',
            detectedItem: prediction.className,
            confidence: 0.65,
            method: 'Fallback - Vehicle Detection'
        };
    }
    
    // Recyclables
    if (className.includes('plastic') || className.includes('bottle') || 
        className.includes('can') || className.includes('glass')) {
        return {
            category: 'Dry Waste',
            styles: getCategoryStyles('Dry Waste'),
            icon: getCategoryIcon('Dry Waste'),
            description: `Likely recyclable (${prediction.className}). Clean before disposal.`,
            detectedItem: prediction.className,
            confidence: 0.60,
            method: 'Fallback - Recyclable Detection'
        };
    }
    
    // Safe default
    return {
        category: 'Dry Waste',
        styles: getCategoryStyles('Dry Waste'),
        icon: getCategoryIcon('Dry Waste'),
        description: `Classification uncertain (${prediction.className}). Most household items are recyclable.`,
        detectedItem: prediction.className,
        confidence: 0.50,
        method: 'Fallback - Safe Default'
    };
};

const getCategoryStyles = (category) => {
    const styles = {
        'Wet Waste': 'bg-green-50 border-green-500 text-green-800',
        'Dry Waste': 'bg-blue-50 border-blue-500 text-blue-800',
        'E-waste': 'bg-purple-50 border-purple-500 text-purple-800', 
        'Hazardous Waste': 'bg-red-50 border-red-500 text-red-800',
        'Biomedical Waste': 'bg-pink-50 border-pink-500 text-pink-800'
    };
    return styles[category];
};

const getCategoryIcon = (category) => {
    const icons = {
        'Wet Waste': <LeafIcon />,
        'Dry Waste': <RecycleIcon />,
        'E-waste': <ElectronicsIcon />,
        'Hazardous Waste': <WarningIcon />,
        'Biomedical Waste': <BiohazardIcon />
    };
    return icons[category] || <UnknownIcon />;
};

const getCategoryDescription = (category, detectedItem) => {
    const descriptions = {
        'Wet Waste': `Organic waste (${detectedItem}). Perfect for composting.`,
        'Dry Waste': `Recyclable material (${detectedItem}). Clean before disposal.`,
        'E-waste': `Electronic/bulky waste (${detectedItem}). Take to e-waste collection points.`,
        'Hazardous Waste': `Hazardous material (${detectedItem}). Requires special disposal.`,
        'Biomedical Waste': `Medical waste (${detectedItem}). Contact health authorities.`
    };
    return descriptions[category];
};

const RECYCLABLE_CATEGORIES = ["Dry Waste"];

const Spinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
);

    const FeedbackSystem = ({ result, onFeedback, userInfo }) => {
        const [showFeedback, setShowFeedback] = useState(false);
        const [userCorrection, setUserCorrection] = useState('');
        const [submitting, setSubmitting] = useState(false);
        
        const submitFeedback = async (isCorrect, correction = null) => {
            if (!userInfo) {
                onFeedback('Please log in.');
                return;
            }
            setSubmitting(true);
            
            // Ensure confidence is a clean number between 0-100
            const cleanConfidence = Math.min(Math.max(parseFloat(result.confidence), 0), 100);

            const feedback = {
                originalResult: {
                    category: result.category,
                    confidence: cleanConfidence,
                    method: result.method,
                    detectedItem: result.detectedItem 
                },
                userSaysCorrect: isCorrect,
                userCorrection: isCorrect ? result.category : correction,
                imageMetadata: {
                    size: null, 
                    type: "image/jpeg",
                    dimensions: { width: 224, height: 224 }
                }
            };
            
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await api.post('/api/feedback', feedback, config);
                onFeedback('Success!');
                setShowFeedback(false);
            } catch (error) {
                console.error("Feedback Error:", error.response?.data);
                onFeedback(error.response?.data?.message || 'Error');
            } finally {
                setSubmitting(false);
            }
        };
    
    if (!result) return null;
    
    return (
        <div className="feedback-system mt-4 p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm font-medium text-gray-700 mb-2">Was this classification correct?</p>
            
            <div className="flex space-x-2">
                <button 
                    onClick={() => submitFeedback(true)}
                    disabled={submitting}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition-colors"
                >
                    ✓ Correct
                </button>
                
                <button 
                    onClick={() => setShowFeedback(true)}
                    disabled={submitting}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition-colors"
                >
                    ✗ Incorrect
                </button>
            </div>
            
            {showFeedback && (
                <div className="mt-3 space-y-2">
                    <select 
                        value={userCorrection}
                        onChange={(e) => setUserCorrection(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select correct category...</option>
                        <option value="Wet Waste">Wet Waste</option>
                        <option value="Dry Waste">Dry Waste</option>
                        <option value="E-waste">E-waste</option>
                        <option value="Hazardous Waste">Hazardous Waste</option>
                        <option value="Biomedical Waste">Biomedical Waste</option>
                    </select>
                    
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => submitFeedback(false, userCorrection)}
                            disabled={!userCorrection || submitting}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition-colors"
                        >
                            {submitting ? 'Submitting...' : 'Submit Correction'}
                        </button>
                        
                        <button 
                            onClick={() => setShowFeedback(false)}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const ScannerPage = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modelStatus, setModelStatus] = useState('🚀 Loading Advanced AI...');
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');
    
    const model = useRef(null);
    const imageRef = useRef();
    const { userInfo, updateUser } = useAuth();

    useEffect(() => {
        const loadModel = async () => {
            try {
                setModelStatus('🚀 Loading Advanced AI...');
                await tf.ready();
                
                model.current = await loadAdvancedMobileNet();
                setModelStatus('🎉 Advanced AI Ready! (Improved Classification)');
            } catch (err) {
                setModelStatus('⚡ AI Ready! (Fallback Mode)');
                setError('Could not load the advanced AI model. Using fallback mode.');
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
            setFeedback('');
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleClassify = async () => {
        if (!file || !model.current || !imageRef.current) return;
        setLoading(true);
        setError('');
        setFeedback('');

        try {
            const wasteClassification = await learningEnhancedClassify(model.current, imageRef.current);
            
            const finalResult = {
                category: wasteClassification.category,
                detectedItem: wasteClassification.detectedItem,
                confidence: Math.min(parseFloat(wasteClassification.confidence * 100), 100).toFixed(1),
                method: wasteClassification.method,
                styles: wasteClassification.styles,
                icon: wasteClassification.icon,
                description: wasteClassification.description,
                isRecyclable: RECYCLABLE_CATEGORIES.includes(wasteClassification.category),
                timestamp: new Date().toISOString()
            };

            setResult(finalResult);

            // Add points and save history (Your original features)
            if (userInfo) {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                try {
                    const { data: updatedUser } = await api.post('/api/users/add-points', {}, config);
                    updateUser(updatedUser);
                    
                const historyData = {
                    item: `Classified as ${finalResult.category} (${finalResult.method})`, 
                    category: finalResult.category,
                    confidence: parseFloat(finalResult.confidence), 
                    method: finalResult.method || 'Enhanced MobileNet v2',
                    detectedItem: finalResult.detectedItem
                };
                    
                    await api.post('/api/history', historyData, config);
                } catch (pointError) {
                    try {
                        await api.post('/api/history', { 
                            item: `Classified as ${finalResult.category}`, 
                            category: finalResult.category 
                        }, config);
                    } catch (fallbackError) {
                        console.error("History logging failed:", fallbackError);
                    }
                }
            }
        } catch (err) {
            console.error('Classification error:', err);
            setError('Could not classify the image. Please try another one.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-8 px-4 sm:px-6 animate-fadeIn">
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Scan Your Waste</h1>
                <p className="text-md sm:text-lg text-gray-600 mt-2">AI with Learning System - Improved Classification!</p>
                <p className={`text-sm mt-1 font-semibold ${modelStatus.includes('Ready') ? 'text-green-600' : 'text-yellow-600'}`}>
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
                            disabled={loading || !modelStatus.includes('Ready')} 
                            className="mt-4 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px] w-full sm:w-auto"
                        >
                            {loading ? <Spinner /> : 'Classify Waste'}
                        </button>
                    )}
                </div>
                
                {error && <p className="mt-4 text-center text-red-500 font-semibold">{error}</p>}
                
                {result && (
                    <div className={`mt-8 p-5 rounded-xl shadow-lg border-l-8 transition-all duration-500 animate-fadeIn ${result.styles}`}>
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                {result.icon}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600">Classified As</p>
                                <h3 className="text-2xl sm:text-3xl font-bold">{result.category}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Detected: {result.detectedItem} ({result.confidence}% confidence)
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 text-gray-700">{result.description}</p>
                        
                        <div className="mt-4 pt-3 border-t border-gray-300/50">
                            <p className={`text-lg font-bold ${result.isRecyclable ? 'text-green-700' : 'text-red-700'}`}>
                                {result.isRecyclable ? '✅ This waste is recyclable' : '❌ This waste is not recyclable'}
                            </p>
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                            Classification Method: {result.method}
                        </div>

                        <FeedbackSystem 
                            result={result} 
                            onFeedback={setFeedback}
                            userInfo={userInfo}
                        />
                        
                        {feedback && (
                            <div className="mt-2 p-2 bg-blue-100 text-blue-800 rounded text-sm">
                                {feedback}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
                <p>💡 Tip: Take clear, well-lit photos for best results</p>
                <p className="mt-1">🔍 Open browser console (F12) to see detailed classification logs</p>
            </div>
        </div>
    );
};

export default ScannerPage;