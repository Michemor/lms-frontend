/**
 * Custom hook for managing sidebar menu items based on user role
 * Provides easy access to sidebar configuration
 */

import { getSidebarMenuItems, canAccessMenuItem, isPathAccessible } from '../utils/sidebarConfig';
import { useAuth } from './authhook';

export const useSidebarMenu = () => {
    const { user } = useAuth();
    const isAdmin = user?.is_admin || user?.isAdmin || false;

    /**
     * Get all menu items for the current user
     */
    const menuItems = getSidebarMenuItems(isAdmin);

    /**
     * Check if user can access a specific menu item
     */
    const canAccess = (menuItem) => {
        return canAccessMenuItem(menuItem, isAdmin);
    };

    /**
     * Check if a path is accessible
     */
    const isAccessible = (path) => {
        return isPathAccessible(path, isAdmin);
    };

    /**
     * Get allowed navigation paths
     */
    const allowedPaths = menuItems.map(item => item.path);

    return {
        menuItems,
        isAdmin,
        canAccess,
        isAccessible,
        allowedPaths,
        user
    };
};
