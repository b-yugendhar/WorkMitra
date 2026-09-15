import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

export interface User {
    id: string;
    fullName?: string;
    phone: string;
    email?: string;
    role: 'worker' | 'employer' | 'admin' | 'verifier';
    status: 'active' | 'suspended';
    preferredLanguage?: 'en' | 'te';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: { phone: string; password: string }) => Promise<User>;
    register: (data: {
        fullName?: string;
        phone: string;
        email?: string;
        password: string;
        role: 'worker' | 'employer';
        preferredLanguage?: string;
    }) => Promise<User>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch {
                return null;
            }
        }
        return null;
    });

    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const verifySession = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setUser(null);
                setToken(null);
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.get('/auth/profile');
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
            } catch (error) {
                console.error('Session verification failed, logging out:', error);
                logout();
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, []);

    const login = async (credentials: { phone: string; password: string }): Promise<User> => {
        const response = await api.post<{ message: string; token: string; user: User }>('/auth/login', credentials);
        const { token: newToken, user: userData } = response.data;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (data: {
        fullName?: string;
        phone: string;
        email?: string;
        password: string;
        role: 'worker' | 'employer';
        preferredLanguage?: string;
    }): Promise<User> => {
        const response = await api.post<{ message: string; token: string; user: User }>('/auth/register', data);
        const { token: newToken, user: userData } = response.data;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user && !!token,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
