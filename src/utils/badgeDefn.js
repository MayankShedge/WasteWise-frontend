// This file defines all the badges available in the app.
// It's a single source of truth for badge information.

export const badges = [
    {
        name: 'Recycling Rookie',
        points: 0,
        icon: '🌱',
        color: 'text-gray-500',
        description: 'Awarded for starting your waste segregation journey.'
    },
    {
        name: 'Green Guardian',
        points: 100,
        icon: '🛡️',
        color: 'text-green-500',
        description: 'Awarded for reaching 100 points. You are a true protector of the environment!'
    },
    {
        name: 'Eco Enthusiast',
        points: 250,
        icon: '🌟',
        color: 'text-blue-500',
        description: 'Awarded for reaching 250 points. Your dedication is inspiring!'
    },
    {
        name: 'Waste Warrior',
        points: 500,
        icon: '🏆',
        color: 'text-yellow-500',
        description: 'Awarded for reaching 500 points. You are a true champion for a cleaner planet!'
    },    
    {
        name: 'Biophile',
        points: 1000,
        icon: '🏆🏆',
        color: 'text-orange-500',
        description: 'Awarded for reaching 1000 points. You are a true green lover and visionare for a cleaner planet!'
    }
    
];

// Helper function to get the details of a specific badge by name
export const getBadgeDetails = (badgeName) => {
    return badges.find(b => b.name === badgeName) || badges[0];
};
