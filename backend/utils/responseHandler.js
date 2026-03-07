/**
 * Response Handler Utility
 * Centralized error and success response handling
 */

class ResponseHandler {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {any} data - Response data
   * @param {string} message - Success message (optional)
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data
    });
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {Object} data - Optional error data
   */
  static error(res, message = 'Internal Server Error', statusCode = 500, data = null) {
    const response = {
      status: 'error',
      message
    };
    if (data) response.data = data;
    return res.status(statusCode).json(response);
  }

  /**
   * Handle database error
   * @param {Object} res - Express response object
   * @param {Object} err - Error object
   * @param {string} context - Context for logging (optional)
   */
  static databaseError(res, err, context = 'Database operation') {
    console.error(`${context}:`, err.message);
    return this.error(res, 'Database error', 500);
  }

  /**
   * Handle validation error
   * @param {Object} res - Express response object
   * @param {string} message - Validation error message
   */
  static validationError(res, message = 'Invalid input') {
    return this.error(res, message, 400);
  }

  /**
   * Handle not found error
   * @param {Object} res - Express response object
   * @param {string} resource - Resource name
   */
  static notFound(res, resource = 'Resource') {
    return this.error(res, `${resource} not found`, 404);
  }

  /**
   * Handle unauthorized error
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  /**
   * Handle forbidden error
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Send paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Response data
   * @param {number} total - Total count
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {string} message - Success message (optional)
   */
  static paginated(res, data, total, page, limit, message = 'Success') {
    return res.status(200).json({
      status: 'success',
      message,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  }
}

module.exports = ResponseHandler;
