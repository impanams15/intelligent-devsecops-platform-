// ─────────────────────────────────────────────────
// Auth Context
// Provides authentication state across the app
// ─────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing auth on mount
    useEffect(() => {
        const token = localStorage.getItem('devsecops_token');
        const savedUser = localStorage.getItem('devsecops_user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('devsecops_token');
                localStorage.removeItem('devsecops_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await authAPI.login({ email, password });
            if (data.success) {
                localStorage.setItem('devsecops_token', data.data.token);
                localStorage.setItem('devsecops_user', JSON.stringify(data.data));
                setUser(data.data);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await authAPI.register({ name, email, password });
            if (data.success) {
                localStorage.setItem('devsecops_token', data.data.token);
                localStorage.setItem('devsecops_user', JSON.stringify(data.data));
                setUser(data.data);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('devsecops_token');
        localStorage.removeItem('devsecops_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
