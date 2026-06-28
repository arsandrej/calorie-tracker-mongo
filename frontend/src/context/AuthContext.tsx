import React, { createContext, useState, useContext, ReactNode } from 'react';
import apiClient from '../api/client';

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/login', { email, password });
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    setToken(access_token);
  };

  const register = async (email: string, password: string) => {
    await apiClient.post('/register', { email, password });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
