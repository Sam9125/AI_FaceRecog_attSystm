/**
 * Shared Date Utilities
 * Works on both web and mobile
 */

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date to readable string (e.g., "Jan 15, 2024")
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDateReadable = (date) => {
  const d = new Date(date);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

/**
 * Format time to HH:MM:SS
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted time string
 */
export const formatTime = (date) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Format datetime to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (date) => {
  return `${formatDateReadable(date)} at ${formatTime(date)}`;
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} - Today's date
 */
export const getToday = () => {
  return formatDate(new Date());
};

/**
 * Get date N days ago
 * @param {number} days - Number of days ago
 * @returns {string} - Date in YYYY-MM-DD format
 */
export const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is today
 */
export const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

/**
 * Get time ago string (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} - Time ago string
 */
export const getTimeAgo = (date) => {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

export default {
  formatDate,
  formatDateReadable,
  formatTime,
  formatDateTime,
  getToday,
  getDaysAgo,
  isToday,
  getTimeAgo,
};
