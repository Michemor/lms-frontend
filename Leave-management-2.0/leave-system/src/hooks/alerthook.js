import { createContext, useContext } from 'react';

// Create AlertContext
export const AlertContext = createContext(null);

// useAlert hook
export const useAlert = () => useContext(AlertContext)
