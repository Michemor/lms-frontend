import { AlertContext } from "../hooks/alerthook";
import { useState } from "react";
import { AlertBanner } from "../components/AlertBanner";

// AlertProvider component
export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState({
        message: '',
        type: 'info',
        duration: 5000,
        autoClose: true,
});

    const showAlert = (message, type = 'info', duration = 5000) => {
        setAlert({ message, type, duration });
    };

    const showSuccess = (message, duration = 5000) => {
        showAlert(message, 'success', duration);
    };

    const showError = (message, duration = 5000) => {
        showAlert(message, 'error', duration);
    };

    const showWarning = (message, duration = 5000) => {
        showAlert(message, 'warning', duration);
    };

    const showInfo = (message, duration = 5000) => {
        showAlert(message, 'info', duration);
    };

    const showLoading = (message) => {
        showAlert(message, 'loading', 0);
    };

    const hideAlert = () => {
        setAlert(null);
    };

    return (
        <AlertContext.Provider value={{
            showAlert,
            showSuccess,
            showError,
            showWarning,
            showInfo,
            showLoading,
            hideAlert,
        }}>
            {children}
            {alert && (
                <AlertBanner
                    message={alert.message}
                    type={alert.type}
                    onClose={hideAlert}
                    autoClose={alert.duration > 0}
                    autoCloseDuration={alert.duration}
                />
            )}
        </AlertContext.Provider>
    );
};
