/**
 * Storage Abstraction Layer
 * Works with both localStorage (web) and AsyncStorage (mobile)
 */

// Platform detection
const isWeb = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const isMobile = !isWeb;

// Storage interface
export const storage = {
  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @returns {Promise<string|null>} - Stored value or null
   */
  async get(key) {
    try {
      if (isWeb) {
        // Web: Use localStorage (synchronous)
        return localStorage.getItem(key);
      } else {
        // Mobile: Use AsyncStorage (asynchronous)
        // This will be imported dynamically in mobile app
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        return await AsyncStorage.default.getItem(key);
      }
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {Promise<void>}
   */
  async set(key, value) {
    try {
      if (isWeb) {
        // Web: Use localStorage
        localStorage.setItem(key, value);
      } else {
        // Mobile: Use AsyncStorage
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.setItem(key, value);
      }
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async remove(key) {
    try {
      if (isWeb) {
        // Web: Use localStorage
        localStorage.removeItem(key);
      } else {
        // Mobile: Use AsyncStorage
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.removeItem(key);
      }
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  /**
   * Clear all storage
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      if (isWeb) {
        // Web: Use localStorage
        localStorage.clear();
      } else {
        // Mobile: Use AsyncStorage
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.clear();
      }
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },

  /**
   * Get all keys
   * @returns {Promise<string[]>}
   */
  async getAllKeys() {
    try {
      if (isWeb) {
        // Web: Use localStorage
        return Object.keys(localStorage);
      } else {
        // Mobile: Use AsyncStorage
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        return await AsyncStorage.default.getAllKeys();
      }
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  },
};

export default storage;
