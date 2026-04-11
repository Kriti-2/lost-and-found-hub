import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (err) {
                    console.error("Token invalid", err);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            toast.success("Successfully logged in!");
            return { success: true };
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
            if (err.response?.data?.unverified) {
                return { success: false, unverified: true };
            }
            return { success: false };
        }
    };

    const registerAccount = async (email, name, password) => {
        try {
            const res = await api.post('/auth/register', { email, name, password });
            if (res.data.requiresVerification) {
                toast.success(res.data.message);
                return { success: true, requiresVerification: true };
            } else {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                toast.success("Account created successfully!");
                return { success: true };
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
            return { success: false };
        }
    };

    const verifyEmail = async (email, otp) => {
        try {
            const res = await api.post('/auth/verify-email', { email, otp });
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            toast.success(res.data.message);
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Verification failed");
            return false;
        }
    };

    const resendVerificationOTP = async (email) => {
        try {
            const res = await api.post('/auth/resend-verification', { email });
            toast.success(res.data.message);
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to resend OTP");
            return false;
        }
    };

    const forgotPassword = async (email) => {
        try {
            const res = await api.post('/auth/forgot-password', { email });
            toast.success(res.data.message);
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send reset OTP");
            return false;
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const res = await api.post('/auth/reset-password', { email, otp, newPassword });
            toast.success(res.data.message);
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Password reset failed");
            return false;
        }
    };
    const googleLogin = async (tokenId) => {
        try {
            const res = await api.post('/auth/google-login', { tokenId });
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            toast.success("Successfully logged in with Google!");
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Google Login failed");
            return false;
        }
    };


    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.info("Logged out successfully");
    };

    const markNotificationsAsRead = async () => {
        if (!user || user.notifications?.every(n => n.isRead)) return;
        try {
            const res = await api.put('/auth/notifications/read');
            setUser({ ...user, notifications: res.data });
        } catch (err) {
            console.error("Error marking notifications as read", err);
        }
    };

    const deleteNotification = async (notifId) => {
        try {
            const res = await api.delete(`/auth/notifications/${notifId}`);
            setUser({ ...user, notifications: res.data });
            toast.success("Notification deleted");
        } catch (err) {
            toast.error("Failed to delete notification");
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            registerAccount, 
            googleLogin, 
            logout, 
            loading,
            markNotificationsAsRead,
            deleteNotification,
            verifyEmail,
            resendVerificationOTP,
            forgotPassword,
            resetPassword
        }}>
            {children}
        </AuthContext.Provider>
    );
};
