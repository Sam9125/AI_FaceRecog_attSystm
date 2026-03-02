/**
 * Shared Attendance Hook
 * Manages attendance operations
 */
import { useState, useCallback } from 'react';
import { attendanceAPI } from '../services/api.js';
import { storage } from '../services/storage.js';
import { STORAGE_KEYS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [stats, setStats] = useState(null);

  /**
   * Mark attendance with image
   * @param {File|Blob} imageFile - Image file
   * @returns {Promise<object>} - Attendance data
   */
  const markAttendance = useCallback(async (imageFile) => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const response = await attendanceAPI.markAttendance(imageFile);
      const { confidence } = response.data;

      const successMsg = `${SUCCESS_MESSAGES.ATTENDANCE_MARKED} Confidence: ${(confidence * 100).toFixed(1)}%`;
      setMessage(successMsg);

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || ERROR_MESSAGES.NETWORK_ERROR;
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark attendance offline (save locally)
   * @param {string} imageData - Base64 image data
   * @returns {Promise<void>}
   */
  const markAttendanceOffline = useCallback(async (imageData) => {
    try {
      // Get existing offline attendance
      const offlineData = await storage.get(STORAGE_KEYS.OFFLINE_ATTENDANCE);
      const offlineList = offlineData ? JSON.parse(offlineData) : [];

      // Add new attendance
      offlineList.push({
        imageData,
        timestamp: new Date().toISOString(),
        synced: false,
      });

      // Save back to storage
      await storage.set(STORAGE_KEYS.OFFLINE_ATTENDANCE, JSON.stringify(offlineList));

      setMessage('Attendance saved offline. Will sync when online.');
    } catch (err) {
      console.error('Offline save error:', err);
      setError('Failed to save attendance offline');
    }
  }, []);

  /**
   * Sync offline attendance to server
   * @returns {Promise<number>} - Number of synced records
   */
  const syncOfflineAttendance = useCallback(async () => {
    try {
      const offlineData = await storage.get(STORAGE_KEYS.OFFLINE_ATTENDANCE);
      if (!offlineData) return 0;

      const offlineList = JSON.parse(offlineData);
      const unsynced = offlineList.filter(item => !item.synced);

      if (unsynced.length === 0) return 0;

      let syncedCount = 0;

      // Sync each attendance record
      for (const item of unsynced) {
        try {
          // Convert base64 to blob
          const blob = await fetch(item.imageData).then(r => r.blob());
          await attendanceAPI.markAttendance(blob);
          item.synced = true;
          syncedCount++;
        } catch (err) {
          console.error('Sync error for item:', err);
        }
      }

      // Update storage
      await storage.set(STORAGE_KEYS.OFFLINE_ATTENDANCE, JSON.stringify(offlineList));

      return syncedCount;
    } catch (err) {
      console.error('Sync offline attendance error:', err);
      return 0;
    }
  }, []);

  /**
   * Get attendance history
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<array>} - Attendance records
   */
  const getHistory = useCallback(async (startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendanceAPI.getMyAttendance(startDate, endDate);
      setAttendanceHistory(response.data);

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch history';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get attendance statistics
   * @param {number} days - Number of days
   * @returns {Promise<object>} - Statistics data
   */
  const getStats = useCallback(async (days = 30) => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendanceAPI.getMyStats(days);
      setStats(response.data);

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch stats';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear messages
   */
  const clearMessages = useCallback(() => {
    setError(null);
    setMessage(null);
  }, []);

  return {
    // State
    loading,
    error,
    message,
    attendanceHistory,
    stats,

    // Actions
    markAttendance,
    markAttendanceOffline,
    syncOfflineAttendance,
    getHistory,
    getStats,
    clearMessages,
  };
};

export default useAttendance;
