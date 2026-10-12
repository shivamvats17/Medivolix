/* eslint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('medivolix_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Synchronize active session with backend on initial mount
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const freshUser = await authService.getMe();
        if (isMounted && freshUser) {
          setUser(freshUser);
          localStorage.setItem('medivolix_user', JSON.stringify(freshUser));
        }
      } catch {
        // Not logged in or session expired
        if (isMounted) {
          setUser(null);
          localStorage.removeItem('medivolix_user');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const loggedIn = await authService.login({ email, password });
    setUser(loggedIn);
    localStorage.setItem('medivolix_user', JSON.stringify(loggedIn));
    return loggedIn;
  };

  const register = async (userData) => {
    const newUser = await authService.register(userData);
    setUser(newUser);
    localStorage.setItem('medivolix_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('medivolix_user');
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
      localStorage.setItem('medivolix_user', JSON.stringify(freshUser));
      return freshUser;
    } catch {
      setUser(null);
      localStorage.removeItem('medivolix_user');
      return null;
    }
  };

  const updateProfile = async (profileData) => {
    const updated = await authService.updateProfile(profileData);
    setUser(updated);
    localStorage.setItem('medivolix_user', JSON.stringify(updated));
    return updated;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'CUSTOMER',
    isPharmacyAdmin: user?.role === 'PHARMACY_ADMIN',
    isSystemAdmin: user?.role === 'SYSTEM_ADMIN',
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
  };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
