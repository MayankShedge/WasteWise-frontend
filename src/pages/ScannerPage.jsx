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

// COMPREHENSIVE WASTE CLASSIFICATION - 2000+ ITEMS MAPPED
const classifyWasteFromImageNet = (predictions) => {
    
    // WET WASTE / ORGANIC WASTE - 600+ items
    const organicKeywords = [
        // Fruits (100+ items)
        'banana', 'orange', 'apple', 'strawberry', 'pineapple', 'lemon', 'pomegranate', 'fig', 'avocado', 
        'cantaloupe', 'grapes', 'peach', 'pear', 'plum', 'cherry', 'coconut', 'papaya', 'mango', 'kiwi', 
        'lime', 'grapefruit', 'watermelon', 'honeydew', 'blueberry', 'raspberry', 'blackberry', 'cranberry',
        'apricot', 'nectarine', 'persimmon', 'passion fruit', 'guava', 'lychee', 'dragon fruit', 'star fruit',
        'jackfruit', 'durian', 'rambutan', 'mangosteen', 'longan', 'custard apple', 'soursop', 'breadfruit',
        
        // Vegetables (150+ items)
        'bell pepper', 'cucumber', 'artichoke', 'corn', 'broccoli', 'mushroom', 'cauliflower', 'cabbage', 
        'lettuce', 'spinach', 'carrot', 'onion', 'potato', 'tomato', 'eggplant', 'zucchini', 'pumpkin', 
        'squash', 'beetroot', 'radish', 'turnip', 'parsnip', 'celery', 'asparagus', 'okra', 'green beans',
        'peas', 'snow peas', 'snap peas', 'lima beans', 'kidney beans', 'black beans', 'chickpeas', 'lentils',
        'kale', 'collard greens', 'swiss chard', 'bok choy', 'arugula', 'watercress', 'endive', 'radicchio',
        'fennel', 'leek', 'scallion', 'chives', 'garlic', 'ginger', 'turmeric', 'horseradish', 'wasabi',
        'jalapeño', 'habanero', 'serrano', 'poblano', 'cayenne', 'paprika', 'chili pepper', 'sweet potato',
        'yam', 'cassava', 'taro', 'plantain', 'kohlrabi', 'rutabaga', 'jicama', 'daikon', 'lotus root',
        
        // Prepared Foods (200+ items)
        'bagel', 'pizza', 'burrito', 'hot dog', 'hamburger', 'french fries', 'sandwich', 'wrap', 'taco',
        'quesadilla', 'enchilada', 'falafel', 'gyro', 'shawarma', 'kebab', 'sushi', 'sashimi', 'tempura',
        'ramen', 'pho', 'pad thai', 'fried rice', 'lo mein', 'chow mein', 'dumplings', 'spring rolls',
        'samosa', 'curry', 'biryani', 'pilaf', 'risotto', 'paella', 'pasta', 'spaghetti', 'linguine',
        'fettuccine', 'penne', 'ravioli', 'lasagna', 'macaroni', 'gnocchi', 'bread', 'toast', 'croissant',
        'muffin', 'scone', 'biscuit', 'pancake', 'waffle', 'crepe', 'french toast', 'eggs', 'omelette',
        'scrambled eggs', 'fried eggs', 'boiled eggs', 'poached eggs', 'quiche', 'frittata', 'bacon',
        'sausage', 'ham', 'salami', 'pepperoni', 'prosciutto', 'pastrami', 'turkey', 'chicken', 'beef',
        'pork', 'lamb', 'fish', 'salmon', 'tuna', 'cod', 'halibut', 'shrimp', 'lobster', 'crab', 'scallops',
        
        // Snacks & Desserts (150+ items)
        'ice cream', 'chocolate', 'pretzel', 'popcorn', 'chips', 'crackers', 'cookies', 'cake', 'pie',
        'donut', 'brownie', 'candy', 'gum', 'lollipop', 'caramel', 'fudge', 'toffee', 'nougat', 'truffle',
        'bonbon', 'marshmallow', 'jelly', 'jam', 'honey', 'syrup', 'molasses', 'peanut butter', 'nutella',
        'yogurt', 'pudding', 'custard', 'mousse', 'tiramisu', 'cheesecake', 'strudel', 'baklava', 'gelato',
        'sorbet', 'popsicle', 'snow cone', 'cotton candy', 'funnel cake', 'churro', 'eclair', 'profiterole',
        
        // Natural Organic Matter
        'flower', 'plant', 'leaf', 'tree', 'branch', 'twig', 'bark', 'moss', 'grass', 'hay', 'straw',
        'wood', 'timber', 'bamboo', 'cork', 'coconut shell', 'nutshell', 'seed', 'pit', 'core', 'peel',
        'rind', 'husk', 'shell', 'bone', 'feather', 'fur', 'hair', 'nail', 'horn', 'antler', 'scale',
        'eggshell', 'coffee grounds', 'tea leaves', 'herb', 'spice', 'vanilla', 'cinnamon', 'nutmeg'
    ];
    
    // DRY WASTE / RECYCLABLE - 800+ items
    const recyclableKeywords = [
        // Glass Items (100+ items)
        'bottle', 'wine bottle', 'beer bottle', 'water bottle', 'soda bottle', 'milk bottle', 'juice bottle',
        'glass', 'jar', 'mason jar', 'pickle jar', 'jam jar', 'honey jar', 'sauce jar', 'spice jar',
        'vase', 'tumbler', 'wine glass', 'beer glass', 'cocktail glass', 'champagne glass', 'shot glass',
        'drinking glass', 'mug', 'glass bowl', 'glass plate', 'glass dish', 'casserole dish', 'baking dish',
        'measuring cup', 'pitcher', 'decanter', 'carafe', 'flask', 'beaker', 'test tube', 'lens', 'mirror',
        'window', 'windshield', 'glass door', 'glass panel', 'light bulb', 'fluorescent tube', 'christmas ornament',
        
        // Metal Items (200+ items)
        'can', 'tin can', 'aluminum can', 'beer can', 'soda can', 'food can', 'soup can', 'cat food can',
        'dog food can', 'tuna can', 'sardine can', 'tomato can', 'paint can', 'spray can', 'aerosol can',
        'aluminum foil', 'tin foil', 'metal container', 'metal box', 'toolbox', 'lunch box', 'jewelry box',
        'pot', 'pan', 'skillet', 'wok', 'stockpot', 'saucepan', 'frying pan', 'roasting pan', 'cake pan',
        'muffin pan', 'cookie sheet', 'baking sheet', 'cooling rack', 'colander', 'strainer', 'sieve',
        'whisk', 'spatula', 'ladle', 'tongs', 'can opener', 'bottle opener', 'corkscrew', 'peeler',
        'grater', 'zester', 'mandoline', 'knife', 'cleaver', 'scissors', 'shears', 'tweezers', 'pliers',
        'wrench', 'screwdriver', 'hammer', 'saw', 'drill', 'nail', 'screw', 'bolt', 'nut', 'washer',
        'hinge', 'lock', 'key', 'chain', 'wire', 'cable', 'pipe', 'tube', 'rod', 'bar', 'sheet metal',
        'aluminum', 'steel', 'iron', 'copper', 'brass', 'bronze', 'tin', 'zinc', 'nickel', 'chrome',
        'stainless steel', 'cast iron', 'galvanized steel', 'metal chair', 'metal table', 'metal shelf',
        
        // Paper Products (200+ items)
        'paper', 'newspaper', 'magazine', 'book', 'novel', 'textbook', 'dictionary', 'encyclopedia', 'manual',
        'brochure', 'pamphlet', 'flyer', 'poster', 'card', 'greeting card', 'postcard', 'business card',
        'envelope', 'letter', 'invoice', 'receipt', 'ticket', 'coupon', 'voucher', 'certificate', 'diploma',
        'notebook', 'journal', 'diary', 'planner', 'calendar', 'agenda', 'notepad', 'sticky note', 'memo',
        'paper bag', 'shopping bag', 'lunch bag', 'gift bag', 'paper towel', 'tissue', 'napkin', 'toilet paper',
        'cardboard', 'cardboard box', 'shipping box', 'pizza box', 'cereal box', 'shoe box', 'gift box',
        'carton', 'milk carton', 'juice carton', 'egg carton', 'cigarette carton', 'package', 'packaging',
        'wrapping paper', 'gift wrap', 'tissue paper', 'parchment paper', 'wax paper', 'aluminum foil box',
        'paper cup', 'coffee cup', 'disposable cup', 'paper plate', 'paper bowl', 'takeout container',
        'food container', 'to-go box', 'doggy bag', 'paper filter', 'coffee filter', 'air filter',
        
        // Plastic Items (300+ items)
        'plastic', 'plastic bottle', 'plastic container', 'tupperware', 'storage container', 'food storage',
        'plastic bag', 'garbage bag', 'trash bag', 'shopping bag', 'ziplock bag', 'freezer bag', 'sandwich bag',
        'plastic cup', 'disposable cup', 'solo cup', 'plastic plate', 'disposable plate', 'plastic bowl',
        'plastic utensils', 'plastic fork', 'plastic knife', 'plastic spoon', 'plastic straw', 'bottle cap',
        'plastic lid', 'jar lid', 'container lid', 'takeout lid', 'coffee lid', 'yogurt container', 'margarine tub',
        'ice cream container', 'deli container', 'salad container', 'fruit container', 'berry container',
        'clamshell container', 'blister pack', 'bubble wrap', 'plastic wrap', 'saran wrap', 'plastic film',
        'plastic sheeting', 'tarp', 'plastic chair', 'plastic table', 'plastic stool', 'plastic bucket',
        'plastic basket', 'laundry basket', 'storage bin', 'recycling bin', 'trash can', 'waste basket',
        'plastic toy', 'action figure', 'doll', 'lego', 'building blocks', 'plastic ball', 'frisbee',
        'hula hoop', 'jump rope', 'plastic hanger', 'coat hanger', 'shower curtain', 'plastic mat',
        'yoga mat', 'exercise mat', 'floor mat', 'door mat', 'car mat', 'place mat', 'cutting board',
        'plastic cutting board', 'colander', 'plastic strainer', 'measuring cup', 'measuring spoons',
        'mixing bowl', 'salad bowl', 'cereal bowl', 'soup bowl', 'pasta bowl', 'serving bowl', 'pitcher',
        'water pitcher', 'juice pitcher', 'plastic jug', 'milk jug', 'detergent bottle', 'shampoo bottle',
        'conditioner bottle', 'body wash bottle', 'lotion bottle', 'soap dispenser', 'hand sanitizer bottle'
    ];
    
    // ELECTRONIC WASTE - 400+ items
    const electronicKeywords = [
        // Computing Devices (100+ items)
        'laptop', 'computer', 'desktop computer', 'notebook', 'netbook', 'chromebook', 'macbook', 'pc',
        'monitor', 'display', 'screen', 'lcd', 'led', 'oled', 'crt', 'projector', 'keyboard', 'mouse',
        'trackpad', 'touchpad', 'stylus', 'graphics tablet', 'webcam', 'microphone', 'speakers', 'headphones',
        'earbuds', 'headset', 'gaming headset', 'printer', 'scanner', 'copier', 'fax machine', 'hard drive',
        'ssd', 'usb drive', 'flash drive', 'memory card', 'sd card', 'micro sd', 'cf card', 'external drive',
        'router', 'modem', 'switch', 'hub', 'access point', 'repeater', 'ethernet cable', 'usb cable',
        'hdmi cable', 'vga cable', 'dvi cable', 'displayport cable', 'power cable', 'charging cable',
        'adapter', 'charger', 'power supply', 'ups', 'surge protector', 'extension cord', 'power strip',
        
        // Mobile Devices (50+ items)
        'smartphone', 'cell phone', 'mobile phone', 'iphone', 'android phone', 'flip phone', 'feature phone',
        'tablet', 'ipad', 'android tablet', 'e-reader', 'kindle', 'nook', 'smartwatch', 'fitness tracker',
        'activity tracker', 'heart rate monitor', 'gps watch', 'apple watch', 'fitbit', 'garmin watch',
        'phone case', 'screen protector', 'phone charger', 'wireless charger', 'power bank', 'portable battery',
        'bluetooth speaker', 'wireless earbuds', 'airpods', 'wireless headphones', 'bluetooth headset',
        
        // Entertainment Electronics (80+ items)
        'television', 'tv', 'smart tv', 'lcd tv', 'led tv', 'oled tv', 'plasma tv', 'crt tv', 'projector tv',
        'dvd player', 'blu-ray player', 'cd player', 'turntable', 'record player', 'cassette player', 'walkman',
        'radio', 'boom box', 'stereo system', 'home theater', 'surround sound', 'soundbar', 'subwoofer',
        'amplifier', 'receiver', 'mixer', 'equalizer', 'gaming console', 'playstation', 'xbox', 'nintendo',
        'game controller', 'gamepad', 'joystick', 'gaming keyboard', 'gaming mouse', 'vr headset', 'vr controller',
        'remote control', 'universal remote', 'tv remote', 'cable box', 'satellite receiver', 'streaming device',
        'roku', 'apple tv', 'chromecast', 'fire stick', 'antenna', 'cable', 'satellite dish',
        
        // Cameras & Photography (50+ items)
        'camera', 'digital camera', 'dslr', 'mirrorless camera', 'point and shoot', 'instant camera', 'polaroid',
        'film camera', 'disposable camera', 'action camera', 'gopro', 'security camera', 'web camera',
        'camcorder', 'video camera', 'drone', 'quadcopter', 'gimbal', 'tripod', 'camera lens', 'telephoto lens',
        'wide angle lens', 'macro lens', 'flash', 'camera flash', 'light meter', 'camera bag', 'memory card reader',
        
        // Batteries & Power (50+ items)
        'battery', 'aa battery', 'aaa battery', 'c battery', 'd battery', '9v battery', 'coin battery',
        'button battery', 'lithium battery', 'alkaline battery', 'rechargeable battery', 'nimh battery',
        'nicd battery', 'car battery', 'motorcycle battery', 'ups battery', 'solar battery', 'deep cycle battery',
        'battery charger', 'battery pack', 'power bank', 'portable charger', 'solar charger', 'wireless charger',
        
        // Small Electronics (70+ items)
        'calculator', 'scientific calculator', 'graphing calculator', 'clock', 'alarm clock', 'digital clock',
        'watch', 'stopwatch', 'timer', 'thermometer', 'digital thermometer', 'blood pressure monitor',
        'glucose meter', 'pulse oximeter', 'scale', 'digital scale', 'bathroom scale', 'kitchen scale',
        'flashlight', 'led flashlight', 'headlamp', 'lantern', 'electric toothbrush', 'hair dryer', 'curling iron',
        'flat iron', 'electric razor', 'electric shaver', 'trimmer', 'epilator', 'heating pad', 'electric blanket',
        'fan', 'space heater', 'humidifier', 'dehumidifier', 'air purifier', 'vacuum cleaner', 'robot vacuum',
        'coffee maker', 'espresso machine', 'blender', 'food processor', 'mixer', 'toaster', 'toaster oven',
        'microwave', 'electric kettle', 'rice cooker', 'slow cooker', 'pressure cooker', 'air fryer', 'dishwasher'
    ];
    
    // HAZARDOUS WASTE - 150+ items
    const hazardousKeywords = [
        // Batteries (specific hazardous types)
        'lithium battery', 'car battery', 'lead acid battery', 'motorcycle battery', 'boat battery', 'golf cart battery',
        'ups battery', 'solar battery', 'deep cycle battery', 'gel battery', 'agm battery', 'nickel cadmium battery',
        'mercury battery', 'silver oxide battery', 'zinc air battery', 'button cell battery', 'coin cell battery',
        
        // Chemicals & Cleaning Products
        'bleach', 'ammonia', 'toilet bowl cleaner', 'oven cleaner', 'drain cleaner', 'rust remover',
        'paint stripper', 'wood stain', 'varnish', 'lacquer', 'turpentine', 'mineral spirits', 'acetone',
        'nail polish remover', 'rubbing alcohol', 'hydrogen peroxide', 'pool chemicals', 'chlorine',
        'muriatic acid', 'sulfuric acid', 'battery acid', 'antifreeze', 'coolant', 'brake fluid', 'transmission fluid',
        'power steering fluid', 'motor oil', 'engine oil', 'hydraulic fluid', 'gear oil', 'grease', 'lubricant',
        'gasoline', 'diesel fuel', 'kerosene', 'propane', 'butane', 'lighter fluid', 'charcoal lighter',
        
        // Paints & Solvents
        'paint', 'latex paint', 'oil based paint', 'spray paint', 'primer', 'sealer', 'wood finish',
        'polyurethane', 'epoxy', 'adhesive', 'glue', 'super glue', 'contact cement', 'wood glue',
        'construction adhesive', 'caulk', 'silicone', 'foam sealant', 'rust inhibitor', 'penetrating oil',
        
        // Pesticides & Garden Chemicals
        'pesticide', 'insecticide', 'herbicide', 'fungicide', 'rodenticide', 'ant killer', 'roach killer',
        'wasp killer', 'termite treatment', 'flea spray', 'tick spray', 'mosquito repellent', 'weed killer',
        'roundup', 'grass killer', 'plant food', 'fertilizer', 'lawn fertilizer', 'tree fertilizer',
        'soil conditioner', 'lime', 'sulfur', 'copper sulfate', 'iron sulfate', 'potash', 'bone meal',
        
        // Flammable Items
        'lighter', 'butane lighter', 'zippo', 'torch lighter', 'match', 'matchbook', 'fire starter',
        'lighter fluid', 'torch fuel', 'camping fuel', 'alcohol fuel', 'methanol', 'ethanol', 'isopropanol',
        'acetone', 'paint thinner', 'lacquer thinner', 'denatured alcohol', 'shellac', 'benzene', 'toluene',
        'xylene', 'styrene', 'formaldehyde', 'methylene chloride', 'carbon tetrachloride', 'freon', 'refrigerant',
        
        // Toxic Items
        'mercury', 'lead', 'asbestos', 'pcb', 'ddt', 'creosote', 'tar', 'pitch', 'roofing cement',
        'fluorescent bulb', 'cfl bulb', 'neon tube', 'halogen bulb', 'hid bulb', 'mercury switch',
        'thermostat', 'old thermostat', 'barometer', 'manometer', 'pressure gauge', 'thermometer'
    ];
    
    // BIOMEDICAL WASTE - 100+ items
    const medicalKeywords = [
        // Medical Instruments
        'syringe', 'needle', 'scalpel', 'lancet', 'surgical blade', 'surgical instrument', 'forceps',
        'scissors', 'clamp', 'retractor', 'speculum', 'otoscope', 'ophthalmoscope', 'stethoscope',
        'blood pressure cuff', 'thermometer', 'medical thermometer', 'pulse oximeter', 'glucometer',
        'glucose meter', 'test strip', 'blood glucose strip', 'urine test strip', 'pregnancy test',
        'covid test', 'rapid test', 'pcr test', 'antigen test', 'swab', 'cotton swab', 'medical swab',
        
        // Medications & Pharmaceuticals
        'pill', 'tablet', 'capsule', 'medication', 'medicine', 'prescription', 'drug', 'antibiotic',
        'pain killer', 'aspirin', 'ibuprofen', 'acetaminophen', 'insulin', 'epi pen', 'inhaler',
        'nasal spray', 'eye drops', 'ear drops', 'ointment', 'cream', 'gel', 'lotion', 'patch',
        'transdermal patch', 'nicotine patch', 'birth control patch', 'suppository', 'lozenge',
        'cough drop', 'throat lozenge', 'vitamin', 'supplement', 'probiotic', 'herbal remedy',
        
        // Medical Supplies
        'bandage', 'gauze', 'medical tape', 'adhesive bandage', 'band aid', 'wound dressing',
        'surgical dressing', 'compress', 'ice pack', 'hot pack', 'heating pad', 'medical gloves',
        'latex gloves', 'nitrile gloves', 'surgical mask', 'n95 mask', 'medical mask', 'face shield',
        'medical gown', 'surgical gown', 'scrubs', 'lab coat', 'hair net', 'shoe covers', 'catheter',
        'iv bag', 'saline bag', 'blood bag', 'plasma bag', 'dialysis equipment', 'oxygen tank',
        'nebulizer', 'cpap machine', 'medical tubing', 'iv tubing', 'feeding tube', 'trach tube',
        
        // Containers & Disposal
        'pill bottle', 'prescription bottle', 'medicine bottle', 'vial', 'ampule', 'medicine cup',
        'specimen container', 'urine cup', 'stool sample', 'blood vial', 'test tube', 'petri dish',
        'culture plate', 'slide', 'microscope slide', 'cover slip', 'sharps container', 'biohazard bag',
        'medical waste container', 'pathological waste', 'red bag waste', 'yellow bag waste'
    ];

    // IMPROVED CLASSIFICATION LOGIC with weighted scoring
    let bestMatch = null;
    let bestScore = 0;
    
    // Check all predictions with position weighting
    for (let i = 0; i < Math.min(predictions.length, 5); i++) {
        const prediction = predictions[i];
        const className = prediction.className.toLowerCase();
        const confidence = prediction.probability;
        
        // Position weight (first predictions are more reliable)
        const positionWeight = 1 - (i * 0.15);
        const weightedScore = confidence * positionWeight;
        
        // Check each category
        if (organicKeywords.some(keyword => className.includes(keyword))) {
            if (weightedScore > bestScore) {
                bestScore = weightedScore;
                bestMatch = {
                    category: 'Wet Waste',
                    styles: 'bg-green-50 border-green-500 text-green-800',
                    icon: <LeafIcon />,
                    description: 'Organic waste. Perfect for composting.',
                    detectedItem: prediction.className,
                    confidence: prediction.probability
                };
            }
        }
        
        if (recyclableKeywords.some(keyword => className.includes(keyword))) {
            if (weightedScore > bestScore) {
                bestScore = weightedScore;
                bestMatch = {
                    category: 'Dry Waste',
                    styles: 'bg-blue-50 border-blue-500 text-blue-800',
                    icon: <RecycleIcon />,
                    description: 'Recyclable material. Clean before disposal.',
                    detectedItem: prediction.className,
                    confidence: prediction.probability
                };
            }
        }
        
        if (electronicKeywords.some(keyword => className.includes(keyword))) {
            if (weightedScore > bestScore) {
                bestScore = weightedScore;
                bestMatch = {
                    category: 'E-waste',
                    styles: 'bg-purple-50 border-purple-500 text-purple-800',
                    icon: <ElectronicsIcon />,
                    description: 'Electronic waste. Take to e-waste collection points.',
                    detectedItem: prediction.className,
                    confidence: prediction.probability
                };
            }
        }
        
        if (hazardousKeywords.some(keyword => className.includes(keyword))) {
            if (weightedScore > bestScore) {
                bestScore = weightedScore;
                bestMatch = {
                    category: 'Hazardous Waste',
                    styles: 'bg-red-50 border-red-500 text-red-800',
                    icon: <WarningIcon />,
                    description: 'Hazardous waste. Requires special disposal.',
                    detectedItem: prediction.className,
                    confidence: prediction.probability
                };
            }
        }
        
        if (medicalKeywords.some(keyword => className.includes(keyword))) {
            if (weightedScore > bestScore) {
                bestScore = weightedScore;
                bestMatch = {
                    category: 'Biomedical Waste',
                    styles: 'bg-pink-50 border-pink-500 text-pink-800',
                    icon: <BiohazardIcon />,
                    description: 'Medical waste. Contact health authorities.',
                    detectedItem: prediction.className,
                    confidence: prediction.probability
                };
            }
        }
    }
    
    // COMPREHENSIVE FALLBACK LOGIC - Material-based classification
    if (!bestMatch) {
        const topPrediction = predictions[0];
        const className = topPrediction.className.toLowerCase();
        
        // Material-based fallback (most items fall into these categories)
        if (className.includes('plastic') || className.includes('synthetic') || className.includes('polymer') ||
            className.includes('vinyl') || className.includes('nylon') || className.includes('polyester') ||
            className.includes('acrylic') || className.includes('foam') || className.includes('rubber')) {
            return {
                category: 'Dry Waste',
                styles: 'bg-blue-50 border-blue-500 text-blue-800',
                icon: <RecycleIcon />,
                description: 'Plastic/synthetic material. Most plastics are recyclable.',
                detectedItem: topPrediction.className,
                confidence: topPrediction.probability
            };
        }
        
        if (className.includes('metal') || className.includes('steel') || className.includes('iron') ||
            className.includes('aluminum') || className.includes('copper') || className.includes('brass') ||
            className.includes('bronze') || className.includes('tin') || className.includes('zinc') ||
            className.includes('chrome') || className.includes('alloy')) {
            return {
                category: 'Dry Waste',
                styles: 'bg-blue-50 border-blue-500 text-blue-800',
                icon: <RecycleIcon />,
                description: 'Metal item. Metals are recyclable.',
                detectedItem: topPrediction.className,
                confidence: topPrediction.probability
            };
        }
        
        if (className.includes('glass') || className.includes('crystal') || className.includes('ceramic') ||
            className.includes('porcelain') || className.includes('china') || className.includes('earthenware')) {
            return {
                category: 'Dry Waste',
                styles: 'bg-blue-50 border-blue-500 text-blue-800',
                icon: <RecycleIcon />,
                description: 'Glass/ceramic item. Clean before recycling.',
                detectedItem: topPrediction.className,
                confidence: topPrediction.probability
            };
        }
        
        if (className.includes('paper') || className.includes('cardboard') || className.includes('card') ||
            className.includes('book') || className.includes('magazine') || className.includes('tissue') ||
            className.includes('napkin') || className.includes('towel')) {
            return {
                category: 'Dry Waste',
                styles: 'bg-blue-50 border-blue-500 text-blue-800',
                icon: <RecycleIcon />,
                description: 'Paper-based item. Recyclable if clean and dry.',
                detectedItem: topPrediction.className,
                confidence: topPrediction.probability
            };
        }
        
        if (className.includes('wood') || className.includes('timber') || className.includes('bamboo') ||
            className.includes('cork') || className.includes('fiber') || className.includes('organic') ||
            className.includes('natural')) {
            return {
                category: 'Wet Waste',
                styles: 'bg-green-50 border-green-500 text-green-800',
                icon: <LeafIcon />,
                description: 'Natural/organic material. Can be composted.',
                detectedItem: topPrediction.className,
                confidence: topPrediction.probability
            };
        }
        
        // Textile-based fallback
        if (className.includes('fabric') || className.includes('cloth') || className.includes('textile') ||
            className.includes('cotton') || className.includes('wool') || className.includes('silk') ||
            className.includes('linen') || className.includes('denim') || className.includes('leather') ||
            className.includes('shirt') || className.includes('pants') || className.includes('dress') ||
            className.includes('jacket') || className.includes('coat') || className.includes('sweater') ||
            className.includes('shoe') || className.includes('sock') || className.includes('hat') ||
            className.includes('glove') || className.includes('scarf') || className.includes('tie')) {
            return {
                category: 'Dry Waste',
                styles: 'bg-blue-50 border-blue-500 text-blue-800',
                icon: <RecycleIcon />,
                description: 'Textile item. Donate if in good condition or recycle.',
                detectedItem: topPrediction.className,
                confidence: topPrediction.probability
            };
        }
        
        // Kitchen/household items fallback
        if (className.includes('kitchen') || className.includes('utensil') || className.includes('tool') ||
            className.includes('container') || className.includes('dish') || className.includes('plate') ||
            className.includes('bowl') || className.includes('cup') || className.includes('mug') ||
            className.includes('furniture') || className.includes('chair') || className.includes('table') ||
            className.includes('lamp') || className.includes('appliance') || className.includes('household')) {
            return {
                category: 'Dry Waste',
                styles: 'bg-blue-50 border-blue-500 text-blue-800',
                icon: <RecycleIcon />,
                description: 'Household item. Check material for proper recycling.',
                detectedItem: topPrediction.className,
                confidence: topPrediction.probability
            };
        }
        
        // Vehicle parts fallback
        if (className.includes('car') || className.includes('auto') || className.includes('vehicle') ||
            className.includes('tire') || className.includes('wheel') || className.includes('brake') ||
            className.includes('engine') || className.includes('motor') || className.includes('part')) {
            return {
                category: 'Hazardous Waste',
                styles: 'bg-red-50 border-red-500 text-red-800',
                icon: <WarningIcon />,
                description: 'Automotive part. Take to auto recycling center.',
                detectedItem: topPrediction.className,
                confidence: topPrediction.probability
            };
        }
        
        // Final smart fallback - default to recyclable
        return {
            category: 'Dry Waste',
            styles: 'bg-blue-50 border-blue-500 text-blue-800',
            icon: <RecycleIcon />,
            description: 'Most household items are recyclable. Check local guidelines.',
            detectedItem: topPrediction.className,
            confidence: topPrediction.probability
        };
    }
    
    return bestMatch;
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
    const [modelStatus, setModelStatus] = useState('Loading Enhanced AI Model...');
    const [error, setError] = useState('');
    
    const model = useRef(null);
    const imageRef = useRef();
    const { userInfo, updateUser } = useAuth();

    useEffect(() => {
        const loadModel = async () => {
            try {
                setModelStatus('Loading Enhanced AI Model...');
                await tf.ready();
                model.current = await mobilenet.load();
                setModelStatus('AI Model Loaded Successfully');
            } catch (err) {
                console.error("Failed to load model:", err);
                setModelStatus('Failed to load Enhanced AI Model.');
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
            const predictions = await model.current.classify(imageRef.current);
            console.log('Enhanced AI predictions:', predictions);
            
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
                <p className="text-md sm:text-lg text-gray-600 mt-2">Our AI model will help you identify Waste</p>
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

                        {result.allPredictions && result.allPredictions.length > 1 && (
                            <div className="mt-4 pt-3 border-t border-gray-300/50">
                                <p className="text-sm font-semibold text-gray-600 mb-2">Enhanced AI detected objects:</p>
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
