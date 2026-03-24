import { useNavigate } from "react-router-dom";
import { AuthContext } from "../hooks/authhook";
import { useState } from "react";

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState( () => {
        const storedUser = localStorage.getItem('user');

        if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            localStorage.removeItem('user');
            return null;
        }
    });

    const login = (userData, token) => {
        // Ensure all user data is preserved
        const completeUserData = {
            id: userData?.id,
            email: userData?.email,
            first_name: userData?.first_name,
            last_name: userData?.last_name,
            is_admin: userData?.is_admin,
            isAdmin: userData?.isAdmin,
            // Store any other fields that might exist
            ...userData,
        };
        
        setUser(completeUserData);
        localStorage.setItem('user', JSON.stringify(completeUserData));
        
        if (token) {
            localStorage.setItem('token', token);
        } else if (userData?.token) {
            localStorage.setItem('token', userData.token);
        }
    };  

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');

    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};