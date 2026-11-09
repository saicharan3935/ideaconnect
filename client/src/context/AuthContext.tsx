import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { login: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ideaconnect_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshMe = async () => {
    try {
      const activeToken = localStorage.getItem('ideaconnect_token');
      if (!activeToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('ideaconnect_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to fetch authenticated user', err);
      localStorage.removeItem('ideaconnect_token');
      localStorage.removeItem('ideaconnect_user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load from storage and verify
    const storedToken = localStorage.getItem('ideaconnect_token');
    const storedUser = localStorage.getItem('ideaconnect_user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // ignore parse error
      }
    }

    if (storedToken) {
      refreshMe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { login: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', credentials);
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('ideaconnect_token', receivedToken);
      localStorage.setItem('ideaconnect_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('ideaconnect_token', receivedToken);
      localStorage.setItem('ideaconnect_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ideaconnect_token');
    localStorage.removeItem('ideaconnect_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('ideaconnect_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
