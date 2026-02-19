import React, { createContext, useState, useCallback, useEffect } from 'react';
// import mockApi from '../services/mockApi'; // Disabled - using real API now
import { authApi, notificationApi } from '../services/api'; // Real API enabled
import { initializePushNotifications } from '../services/pushNotifications';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      console.log('Fetching current user with token...');
      const response = await authApi.getCurrentUser();
      console.log('Current user fetched:', response);
      setUser(response);
      setIsAuthenticated(true);
      setError(null);
      
      // Initialize push notifications for authenticated user
      try {
        await initializePushNotifications(api);
        console.log('Push notifications initialized');
      } catch (pushError) {
        console.warn('Failed to initialize push notifications:', pushError);
        // Don't throw - push notifications are optional
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err.response?.data || err.message);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (identifier, password) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting login with identifier:', identifier);
      
      const response = await authApi.login(identifier, password);

      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);

      setUser(response.user);
      setIsAuthenticated(true);
      console.log('Login successful:', response.user);
      setError(null);
      
      // Initialize push notifications after login
      try {
        await initializePushNotifications(api);
        console.log('Push notifications initialized');
      } catch (pushError) {
        console.warn('Failed to initialize push notifications:', pushError);
        // Don't throw - push notifications are optional
      }
      
      return response;
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting registration with data:', userData);
      const response = await authApi.register(userData);
      console.log('Registration successful:', response);
      
      // Store tokens and authenticate user
      if (response.access && response.refresh) {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        
        // Fetch user profile to get complete user data
        const userProfile = await authApi.getCurrentUser();
        setUser(userProfile);
        setIsAuthenticated(true);
        
        // Initialize push notifications after registration
        try {
          await initializePushNotifications(api);
          console.log('Push notifications initialized');
        } catch (pushError) {
          console.warn('Failed to initialize push notifications:', pushError);
          // Don't throw - push notifications are optional
        }
      }
      
      // Welcome notifications will be created automatically by the backend
      setError(null);
      return response;
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      const response = await authApi.updateProfile(updates);
      setUser(response);
      return response;
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed');
      throw err;
    }
  }, []);

  // Add function to update user data locally (for balance updates)
  const updateUser = useCallback((updates) => {
    setUser(prevUser => ({ ...prevUser, ...updates }));
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
