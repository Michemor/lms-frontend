import { useState } from 'react';
import { LoadingContext } from '../hooks/loadinghook';

// LoadingProvider component
export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const startLoading = (message = 'Loading...') => {
        setLoadingMessage(message);
        setIsLoading(true);
    };

    const stopLoading = () => {
        setIsLoading(false);
        setLoadingMessage('');
    };

    return (
        <LoadingContext.Provider value={{
            isLoading,
            loadingMessage,
            startLoading,
            stopLoading,
        }}>
            {children}
        </LoadingContext.Provider>
    );
};


