import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the context
const AuthContext = createContext(null);

// Create a custom hook to use the context
export const useAuth = () => {
    return useContext(AuthContext);
};

// Create the provider component
export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
        }
    }, []);

    const login = (userData) => {
        setUserInfo(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
    };

    const logout = () => {
        setUserInfo(null);
        localStorage.removeItem('userInfo');
    };
    
    // NEW: Function to update user info (e.g., after earning points)
    const updateUser = (newUserData) => {
        setUserInfo(newUserData);
        localStorage.setItem('userInfo', JSON.stringify(newUserData));
    };


    const value = {
        userInfo,
        login,
        logout,
        updateUser, // <-- Export the new function
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

