import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { setPassword as resetPassword } from '../services/ApiClient';
import { useAlert } from '../hooks/alerthook';

export default function SetPasswordPage () {
    const { uid, token } = useParams();
    const [password, setPassword] = useState("");
    const { showSuccess, showError } = useAlert();

    const performPasswordReset = (e) => {
        e.preventDefault();
        resetPassword(uid, token, password)
            .then(() => {
                showSuccess('Password has been reset successfully! You can now log in with your new password.');
                // Optionally, you can redirect to the login page after a short delay
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            })
            .catch((error) => {
                console.error('Error resetting password:', error);
                showError(error.message || 'Failed to reset password. Please try again.');
            });
        };

    return (
        <form onSubmit={performPasswordReset}>
            <input 
                type="password" 
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
            />
            <button type="submit">Set Password</button>
        </form>
    );
};