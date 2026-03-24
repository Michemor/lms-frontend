import { useNavigate } from 'react-router-dom';
import { useAuth } from './authhook';
import { getCorrectDashboardPath } from '../utils/authorize';

/**
 * Custom hook for handling login and redirecting to the correct dashboard
 * This simplifies unified login for both staff and admin users
 * 
 * @returns {object} Object containing redirect function and user info
 * 
 * @example
 * const { redirectToDashboard, user } = useLoginRedirect();
 * 
 * // After successful login:
 * redirectToDashboard(loginResponse);
 */
export const useLoginRedirect = () => {
    const navigate = useNavigate();
    const { login: loginContext } = useAuth();

    /**
     * Redirect user to their appropriate dashboard based on role
     * @param {object} response - Login API response containing user and token
     * @param {object} additionalData - Optional additional data to merge with user object
     */
    const redirectToDashboard = (response, additionalData = {}) => {
        try {
            // Extract token and user data from response
            const token = response?.token || response?.access;
            const userData = response?.user || response;

            // Merge additional data (like email from login form)
            const completeUserData = {
                ...userData,
                ...additionalData,
                email: userData?.email || additionalData?.email,
            };

            // Store in AuthContext
            if (loginContext) {
                loginContext(completeUserData, token);
                console.log('Logged in user:', completeUserData);
            }

            // Get correct dashboard path based on role
            const dashboardPath = getCorrectDashboardPath(completeUserData);
            console.log(`Redirecting ${completeUserData.email} to ${dashboardPath}`);

            // Navigate to appropriate dashboard
            navigate(dashboardPath);
        } catch (error) {
            console.error('Error during redirect:', error);
            throw error;
        }
    };

    return { redirectToDashboard };
};
