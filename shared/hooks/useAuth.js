/**
 * Shared Authentication Hook
 * Works on both web and mobile
 */
import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api.js';
import { storage } from '../services/storage.js';
import { STORAGE_KEYS } from '../utils/constants.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check authentication status
   */
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const token = await storage.get(STORAGE_KEYS.TOKEN);
      
      if (token) {
        // Get current user from API
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setUser(null);
      // Clear invalid token
      await storage.remove(STORAGE_KEYS.TOKEN);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login user
   * @param {object} credentials - { email, password }
   * @returns {Promise<object>} - User data
   */
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(credentials);
      const { access_token, user: userData } = response.data;

      // Store token
      await storage.set(STORAGE_KEYS.TOKEN, access_token);
      
      // Store user data
      await storage.set(STORAGE_KEYS.USER, JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register new user
   * @param {object} userData - User registration data
   * @returns {Promise<object>} - User data
   */
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.register(userData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Clear storage
      await storage.remove(STORAGE_KEYS.TOKEN);
      await storage.remove(STORAGE_KEYS.USER);
      
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!user;

  /**
   * Check if user is admin
   */
  const isAdmin = user?.role === 'admin';

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    isAuthenticated,
    isAdmin,
  };
};

export default useAuth;
