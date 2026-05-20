const STORAGE_KEY = 'devinspect_history';

/**
 * Save a code review to localStorage
 * @param {Object} reviewData - The review data to save
 * @param {string} reviewData.code - The analyzed code
 * @param {string} reviewData.language - Programming language
 * @param {string} reviewData.mode - Analysis mode (student/interviewer/developer)
 * @param {number} reviewData.aiScore - AI quality score
 * @param {Array} reviewData.issues - Array of identified issues
 * @param {Array} reviewData.suggestions - Array of suggestions
 * @returns {string} - The ID of the saved review
 */
export const saveReview = (reviewData) => {
  try {
    const reviews = getReviews();
    const newReview = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...reviewData
    };
    
    reviews.unshift(newReview); // Add to beginning of array
    
    // Keep only last 100 reviews to prevent storage overflow
    if (reviews.length > 100) {
      reviews.pop();
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    return newReview.id;
  } catch (error) {
    console.error('Error saving review to localStorage:', error);
    throw new Error('Failed to save review');
  }
};

/**
 * Get all reviews from localStorage
 * @returns {Array} - Array of review objects
 */
export const getReviews = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const reviews = JSON.parse(stored);
    return Array.isArray(reviews) ? reviews : [];
  } catch (error) {
    console.error('Error reading reviews from localStorage:', error);
    return [];
  }
};

/**
 * Delete a specific review by ID
 * @param {string} id - The ID of the review to delete
 * @returns {boolean} - True if deleted successfully
 */
export const deleteReview = (id) => {
  try {
    const reviews = getReviews();
    const filteredReviews = reviews.filter(review => review.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredReviews));
    return true;
  } catch (error) {
    console.error('Error deleting review from localStorage:', error);
    return false;
  }
};

/**
 * Clear all reviews from localStorage
 * @returns {boolean} - True if cleared successfully
 */
export const clearAllReviews = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing reviews from localStorage:', error);
    return false;
  }
};

/**
 * Get a specific review by ID
 * @param {string} id - The ID of the review to retrieve
 * @returns {Object|null} - The review object or null if not found
 */
export const getReviewById = (id) => {
  try {
    const reviews = getReviews();
    return reviews.find(review => review.id === id) || null;
  } catch (error) {
    console.error('Error getting review by ID:', error);
    return null;
  }
};
