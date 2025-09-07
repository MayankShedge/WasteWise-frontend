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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(imageElement, 0, 0, 224, 224);
    
    return canvas;
};

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

const learningEnhancedClassify = async (model, imageElement) => {
    const predictions = await superEnhancedClassify(model, imageElement);
    
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
                    method: 'Learning Enhanced',  // ✅ FIXED - Generic name
                    detectedItem: prediction.className,
                    styles: getCategoryStyles(learningData.correctCategory),
                    icon: getCategoryIcon(learningData.correctCategory),
                    description: getCategoryDescription(learningData.correctCategory, prediction.className) + 
                              ` (Learned from ${learningData.frequency} user correction${learningData.frequency > 1 ? 's' : ''})`
                };
            }
        } catch (learningError) {
            continue;
        }
    }
    
    return await hybridSuperClassify(model, imageElement);
};

const advancedTextClassification = (predictions) => {
    const wasteKeywords = {
        'Wet Waste': {
            primary: ['banana', 'apple', 'orange', 'fruit', 'vegetable', 'food', 'organic', 'bread', 'meat', 'pizza', 'cake'],
            secondary: ['sandwich', 'soup', 'salad', 'rice', 'pasta', 'cookie', 'bagel', 'pretzel', 'taco', 'burger'],
            tertiary: ['snack', 'meal', 'dinner', 'lunch', 'breakfast', 'dish', 'plate'],
            multiplier: 1.5
        },
        'Dry Waste': {
            primary: ['bottle', 'can', 'plastic', 'glass', 'paper', 'metal', 'container', 'box', 'aluminum', 'steel'],
            secondary: ['cup', 'jar', 'bag', 'cardboard', 'packaging', 'wrapper', 'carton', 'tin', 'foil'],
            tertiary: ['recyclable', 'material', 'waste', 'trash', 'garbage'],
            multiplier: 1.4
        },
        'E-waste': {
            primary: ['phone', 'computer', 'electronic', 'battery', 'device', 'digital', 'camera', 'laptop', 'tablet'],
            secondary: ['monitor', 'keyboard', 'mouse', 'charger', 'cable', 'circuit', 'processor', 'chip'],
            tertiary: ['technology', 'gadget', 'equipment', 'machine', 'appliance'],
            multiplier: 1.6
        },
        'Hazardous Waste': {
            primary: ['chemical', 'paint', 'oil', 'toxic', 'hazardous', 'lighter', 'spray', 'aerosol'],
            secondary: ['cleaner', 'solvent', 'pesticide', 'fuel', 'gas', 'acid', 'bleach'],
            tertiary: ['dangerous', 'harmful', 'poison', 'flammable'],
            multiplier: 1.3
        },
        'Biomedical Waste': {
            primary: ['medical', 'syringe', 'pill', 'medicine', 'hospital', 'pharmaceutical', 'drug'],
            secondary: ['bandage', 'needle', 'surgical', 'vaccine', 'specimen', 'laboratory'],
            tertiary: ['health', 'clinical', 'therapy', 'treatment'],
            multiplier: 1.4
        }
    };

    let categoryScores = {};
    Object.keys(wasteKeywords).forEach(category => {
        categoryScores[category] = 0;
    });

    for (let i = 0; i < Math.min(predictions.length, 8); i++) {
        const prediction = predictions[i];
        const className = prediction.className.toLowerCase();
        const confidence = prediction.probability;
        const positionWeight = Math.max(0.5, 1 - (i * 0.08));
        const baseScore = confidence * positionWeight;

        Object.keys(wasteKeywords).forEach(category => {
            const keywords = wasteKeywords[category];
            let categoryScore = 0;

            keywords.primary.forEach(keyword => {
                if (className.includes(keyword)) {
                    categoryScore += baseScore * keywords.multiplier;
                }
            });

            keywords.secondary.forEach(keyword => {
                if (className.includes(keyword)) {
                    categoryScore += baseScore * (keywords.multiplier * 0.7);
                }
            });

            keywords.tertiary.forEach(keyword => {
                if (className.includes(keyword)) {
                    categoryScore += baseScore * (keywords.multiplier * 0.4);
                }
            });

            categoryScores[category] += categoryScore;
        });
    }

    const bestCategory = Object.keys(categoryScores).reduce((a, b) => 
        categoryScores[a] > categoryScores[b] ? a : b
    );
    const bestScore = categoryScores[bestCategory];

    return {
        category: bestCategory,
        confidence: Math.min(bestScore, 1.0),
        method: 'Advanced Text Analysis',
        scores: categoryScores
    };
};

const hybridSuperClassify = async (model, imageElement) => {  
    const predictions = await superEnhancedClassify(model, imageElement);
    const traditionalResult = classifyWasteFromImageNet(predictions);
    const advancedResult = advancedTextClassification(predictions);
    
    let finalResult;
    
    if (advancedResult.confidence > traditionalResult.confidence) {
        finalResult = {
            category: advancedResult.category,
            confidence: advancedResult.confidence,
            method: advancedResult.method,
            detectedItem: predictions[0].className,
            styles: getCategoryStyles(advancedResult.category),
            icon: getCategoryIcon(advancedResult.category),
            description: getCategoryDescription(advancedResult.category, predictions[0].className)
        };
    } else {
        finalResult = {
            ...traditionalResult,
            method: 'Enhanced MobileNet v2'
        };
    }
    
    if (traditionalResult.category === advancedResult.category) {
        finalResult.confidence = Math.min((finalResult.confidence + 0.15), 1.0);
        finalResult.method = 'Hybrid Agreement';
    }
    return finalResult;
};

const classifyWasteFromImageNet = (predictions) => {
    const wasteMapping = {
        organic: {
            exact: [
                'banana', 'orange', 'apple', 'strawberry', 'pineapple', 'lemon', 'pomegranate', 'fig',
                'avocado', 'cantaloupe', 'grapes', 'peach', 'pear', 'plum', 'cherry', 'coconut',
                'papaya', 'mango', 'watermelon', 'honeydew', 'apricot', 'nectarine', 'jackfruit'
            ],
            vegetables: [
                'bell pepper', 'cucumber', 'artichoke', 'corn', 'broccoli', 'mushroom', 'cauliflower',
                'cabbage', 'carrot', 'onion', 'potato', 'sweet potato', 'butternut squash', 'acorn squash',
                'zucchini', 'spaghetti squash', 'head cabbage', 'red cabbage'
            ],
            food: [
                'bagel', 'pizza', 'burrito', 'hot dog', 'cheeseburger', 'french fries', 'pretzel',
                'ice cream', 'chocolate sauce', 'popcorn', 'meat loaf', 'sushi', 'guacamole',
                'consomme', 'hot pot', 'trifle', 'ice lolly', 'wedding cake', 'chocolate chip cookie'
            ],
            indicators: ['fruit', 'vegetable', 'food', 'meal', 'snack', 'organic', 'bread', 'cake', 'meat']
        },
        recyclable: {
            glass: [
                'wine bottle', 'beer bottle', 'water bottle', 'pop bottle', 'pill bottle',
                'perfume', 'lotion', 'beer glass', 'wine glass', 'cocktail shaker', 'pitcher',
                'vase', 'goblet', 'shot glass', 'measuring cup'
            ],
            metal: [
                'can opener', 'bottle opener', 'corkscrew', 'ladle', 'spatula', 'whisk', 'strainer',
                'colander', 'frying pan', 'wok', 'pot', 'dutch oven', 'pressure cooker', 'coffeepot',
                'teapot', 'caldron', 'stockpot', 'steel drum', 'bucket', 'pail'
            ],
            paper: [
                'book jacket', 'envelope', 'menu', 'newspaper', 'crossword puzzle', 'jigsaw puzzle',
                'comic book', 'paper towel', 'tissue', 'toilet tissue'
            ],
            plastic: [
                'plastic bag', 'shopping basket', 'hamper', 'box', 'carton', 'crate', 'basket',
                'container', 'tub', 'bucket', 'pail', 'washbasin', 'bathtub'
            ],
            indicators: ['bottle', 'container', 'can', 'jar', 'box', 'bag', 'cup', 'glass', 'metal', 'aluminum', 'steel', 'plastic', 'paper']
        },
        electronic: {
            computing: [
                'desktop computer', 'notebook', 'laptop', 'monitor', 'screen', 'keyboard', 'computer keyboard',
                'mouse', 'computer mouse', 'joystick', 'trackball', 'printer', 'web site', 'modem'
            ],
            mobile: [
                'cellular telephone', 'phone', 'dial telephone', 'pay-phone', 'handset'
            ],
            entertainment: [
                'television', 'home theater', 'projector', 'radio', 'tape player', 'cd player',
                'ipod', 'cassette player', 'tape player', 'radio telescope', 'loudspeaker'
            ],
            cameras: [
                'reflex camera', 'polaroid camera', 'digital camera', 'photographic equipment'
            ],
            small: [
                'calculator', 'digital clock', 'analog clock', 'stopwatch', 'timer', 'digital watch',
                'remote control', 'hand-held computer', 'pda', 'electronic device'
            ],
            indicators: ['electronic', 'digital', 'computer', 'phone', 'camera', 'device', 'gadget', 'battery', 'charger']
        },
        hazardous: {
            chemicals: [
                'medicine chest', 'pill bottle', 'perfume', 'lotion', 'soap dispenser', 
                'spray', 'aerosol', 'fire extinguisher'
            ],
            automotive: [
                'car wheel', 'tire', 'hubcap', 'motor scooter', 'moped', 'unicycle'
            ],
            flammable: [
                'lighter', 'torch', 'candle', 'oil lamp', 'spotlight', 'flashlight'
            ],
            paint: [
                'paintbrush', 'palette knife', 'spray gun'
            ],
            indicators: ['chemical', 'oil', 'fuel', 'acid', 'toxic', 'flammable', 'hazardous', 'battery', 'lighter']
        },
        medical: {
            instruments: [
                'syringe', 'stethoscope', 'reflex hammer', 'hypodermic needle'
            ],
            containers: [
                'pill bottle', 'medicine chest', 'oxygen mask'
            ],
            equipment: [
                'stretcher', 'hospital bed', 'medical equipment'
            ],
            indicators: ['medical', 'syringe', 'needle', 'pill', 'medicine', 'hospital', 'surgical', 'pharmaceutical']
        }
    };

    let categoryScores = {
        'Wet Waste': 0,
        'Dry Waste': 0,
        'E-waste': 0,
        'Hazardous Waste': 0,
        'Biomedical Waste': 0
    };

    for (let i = 0; i < Math.min(predictions.length, 10); i++) {
        const prediction = predictions[i];
        const className = prediction.className.toLowerCase();
        const confidence = prediction.probability;
        
        const positionWeight = Math.max(0.3, 1 - (i * 0.07));
        const baseScore = confidence * positionWeight;

        let organicScore = 0;
        if (wasteMapping.organic.exact.some(item => className.includes(item))) {
            organicScore = baseScore * 1.4;
        } else if (wasteMapping.organic.vegetables.some(item => className.includes(item))) {
            organicScore = baseScore * 1.2;  
        } else if (wasteMapping.organic.food.some(item => className.includes(item))) {
            organicScore = baseScore * 1.2;
        } else if (wasteMapping.organic.indicators.some(indicator => className.includes(indicator))) {
            organicScore = baseScore * 0.9;
        }

        let recyclableScore = 0;
        if (wasteMapping.recyclable.glass.some(item => className.includes(item))) {
            recyclableScore = baseScore * 1.4;
        } else if (wasteMapping.recyclable.metal.some(item => className.includes(item))) {
            recyclableScore = baseScore * 1.4;
        } else if (wasteMapping.recyclable.paper.some(item => className.includes(item))) {
            recyclableScore = baseScore * 1.2;
        } else if (wasteMapping.recyclable.plastic.some(item => className.includes(item))) {
            recyclableScore = baseScore * 1.1;
        } else if (wasteMapping.recyclable.indicators.some(indicator => className.includes(indicator))) {
            recyclableScore = baseScore * 0.9;
        }

        let electronicScore = 0;
        if (wasteMapping.electronic.computing.some(item => className.includes(item))) {
            electronicScore = baseScore * 1.5;
        } else if (wasteMapping.electronic.mobile.some(item => className.includes(item))) {
            electronicScore = baseScore * 1.5;
        } else if (wasteMapping.electronic.entertainment.some(item => className.includes(item))) {
            electronicScore = baseScore * 1.4;
        } else if (wasteMapping.electronic.cameras.some(item => className.includes(item))) {
            electronicScore = baseScore * 1.4;
        } else if (wasteMapping.electronic.small.some(item => className.includes(item))) {
            electronicScore = baseScore * 1.2;
        } else if (wasteMapping.electronic.indicators.some(indicator => className.includes(indicator))) {
            electronicScore = baseScore * 1.0;
        }

        let hazardousScore = 0;
        if (wasteMapping.hazardous.chemicals.some(item => className.includes(item))) {
            hazardousScore = baseScore * 1.2;
        } else if (wasteMapping.hazardous.automotive.some(item => className.includes(item))) {
            hazardousScore = baseScore * 1.0;
        } else if (wasteMapping.hazardous.flammable.some(item => className.includes(item))) {
            hazardousScore = baseScore * 1.3;
        } else if (wasteMapping.hazardous.paint.some(item => className.includes(item))) {
            hazardousScore = baseScore * 1.1;
        } else if (wasteMapping.hazardous.indicators.some(indicator => className.includes(indicator))) {
            hazardousScore = baseScore * 0.9;
        }

        let medicalScore = 0;
        if (wasteMapping.medical.instruments.some(item => className.includes(item))) {
            medicalScore = baseScore * 1.5;
        } else if (wasteMapping.medical.containers.some(item => className.includes(item))) {
            medicalScore = baseScore * 1.1;
        } else if (wasteMapping.medical.equipment.some(item => className.includes(item))) {
            medicalScore = baseScore * 1.2;
        } else if (wasteMapping.medical.indicators.some(indicator => className.includes(indicator))) {
            medicalScore = baseScore * 1.0;
        }

        categoryScores['Wet Waste'] += organicScore;
        categoryScores['Dry Waste'] += recyclableScore;  
        categoryScores['E-waste'] += electronicScore;
        categoryScores['Hazardous Waste'] += hazardousScore;
        categoryScores['Biomedical Waste'] += medicalScore;
    }

    const bestCategory = Object.keys(categoryScores).reduce((a, b) => 
        categoryScores[a] > categoryScores[b] ? a : b
    );
    const bestCategoryScore = categoryScores[bestCategory];

    if (bestCategoryScore < 0.15) {
        return intelligentFallback(predictions[0]);
    }

    const topPrediction = predictions[0];
    return {
        category: bestCategory,
        styles: getCategoryStyles(bestCategory),
        icon: getCategoryIcon(bestCategory),
        description: getCategoryDescription(bestCategory, topPrediction.className),
        detectedItem: topPrediction.className,
        confidence: bestCategoryScore
    };
};

const intelligentFallback = (prediction) => {
    const className = prediction.className.toLowerCase();
    
    if (className.includes('plastic') || className.includes('synthetic')) {
        return {
            category: 'Dry Waste',
            styles: 'bg-blue-50 border-blue-500 text-blue-800',
            icon: <RecycleIcon />,
            description: 'Plastic item. Most plastics are recyclable.',
            detectedItem: prediction.className,
            confidence: prediction.probability
        };
    }
    
    if (className.includes('metal') || className.includes('steel') || className.includes('aluminum')) {
        return {
            category: 'Dry Waste', 
            styles: 'bg-blue-50 border-blue-500 text-blue-800',
            icon: <RecycleIcon />,
            description: 'Metal item. Metals are recyclable.',
            detectedItem: prediction.className,
            confidence: prediction.probability
        };
    }
    
    if (className.includes('glass') || className.includes('crystal')) {
        return {
            category: 'Dry Waste',
            styles: 'bg-blue-50 border-blue-500 text-blue-800', 
            icon: <RecycleIcon />,
            description: 'Glass item. Clean before recycling.',
            detectedItem: prediction.className,
            confidence: prediction.probability
        };
    }
    
    if (className.includes('wood') || className.includes('organic')) {
        return {
            category: 'Wet Waste',
            styles: 'bg-green-50 border-green-500 text-green-800',
            icon: <LeafIcon />,
            description: 'Organic material. Can be composted.',
            detectedItem: prediction.className,
            confidence: prediction.probability
        };
    }

    return {
        category: 'Dry Waste',
        styles: 'bg-blue-50 border-blue-500 text-blue-800',
        icon: <RecycleIcon />, 
        description: 'Most household items are recyclable. Check local guidelines.',
        detectedItem: prediction.className,
        confidence: prediction.probability
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
    return icons[category];
};

const getCategoryDescription = (category, detectedItem) => {
    const descriptions = {
        'Wet Waste': `Organic waste (${detectedItem}). Perfect for composting.`,
        'Dry Waste': `Recyclable material (${detectedItem}). Clean before disposal.`,
        'E-waste': `Electronic waste (${detectedItem}). Take to e-waste collection points.`,
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
            onFeedback('Please log in to provide feedback.');
            return;
        }
        
        setSubmitting(true);
        
        const feedback = {
            originalResult: {
                category: result.category,
                confidence: result.confidence,
                method: result.method || 'Unknown',
                detectedItem: result.detectedItem
            },
            userSaysCorrect: isCorrect,
            userCorrection: correction,
            timestamp: new Date().toISOString()
        };
        
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await api.post('/api/feedback', feedback, config);
            onFeedback('Thank you for your feedback! This helps improve our AI.');
            setShowFeedback(false);
        } catch (error) {
            onFeedback('Failed to submit feedback. Please try again.');
            setShowFeedback(false);
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
                setModelStatus('🎉 Advanced AI Ready! (Learning Enabled)');
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
                confidence: (wasteClassification.confidence * 100).toFixed(1),
                method: wasteClassification.method,
                styles: wasteClassification.styles,
                icon: wasteClassification.icon,
                description: wasteClassification.description,
                isRecyclable: RECYCLABLE_CATEGORIES.includes(wasteClassification.category),
                timestamp: new Date().toISOString()
            };

            setResult(finalResult);

            if (userInfo) {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                try {
                    const { data: updatedUser } = await api.post('/api/users/add-points', {}, config);
                    updateUser(updatedUser);
                    
                    const historyData = {
                        item: `Classified as ${finalResult.category} (${finalResult.method})`, 
                        category: finalResult.category,
                        confidence: finalResult.confidence,
                        method: finalResult.method,
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
                        console.error("All history logging failed:", fallbackError);
                    }
                }
            }
        } catch (err) {
            setError('Could not classify the image. Please try another one.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-8 px-4 sm:px-6 animate-fadeIn">
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Scan Your Waste</h1>
                <p className="text-md sm:text-lg text-gray-600 mt-2">AI with Learning System - Gets Smarter with Feedback!</p>
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
        </div>
    );
};

export default ScannerPage;
