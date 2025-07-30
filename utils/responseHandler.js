/**
 * Standardized API Response Handler
 * Provides consistent response format across the application
 */

/**
 * Success response format
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Formatted success response
 */
const successResponse = (data = null, message = "Operation successful", statusCode = 200) => {
  return {
    success: true,
    data,
    message,
    statusCode
  };
};

/**
 * Error response format
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} errors - Detailed error information
 * @returns {Object} Formatted error response
 */
const errorResponse = (message = "Operation failed", statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
};

/**
 * Async wrapper to handle try-catch blocks
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { successResponse, errorResponse, asyncHandler };