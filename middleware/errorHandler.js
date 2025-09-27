'use strict';

const logger = require('../utils/logger');

/**
 * Centralized error handling middleware
 * Standardizes error responses and logging across all endpoints
 */
module.exports = (err, req, res, next) => {
  // Log the error with full context
  logger.error('Unhandled error in request', {
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code,
      name: err.name
    },
    endpoint: `${req.method} ${req.path}`
  }, req);

  // Determine error type and status code
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Invalid input data';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    statusCode = 500;
    errorCode = 'DATABASE_ERROR';
    message = 'Database operation failed';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  } else if (err.code) {
    // Use error code if available
    errorCode = err.code;
    message = err.message || message;
    
    // Map common error codes to status codes
    const statusMap = {
      'VALIDATION_ERROR': 400,
      'DUPLICATE_ERROR': 409,
      'AUTHENTICATION_ERROR': 401,
      'AUTHORIZATION_ERROR': 403,
      'NOT_FOUND_ERROR': 404,
      'DATABASE_ERROR': 500,
      'RATE_LIMIT_ERROR': 429
    };
    statusCode = statusMap[errorCode] || 500;
  }

  // Create standardized error response
  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: message,
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    }
  };

  // Add error details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      originalMessage: err.message,
      stack: err.stack
    };
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * Handles requests to non-existent endpoints
 */
const notFoundHandler = (req, res) => {
  logger.warn('404 Not Found', {
    endpoint: `${req.method} ${req.path}`,
    message: 'Requested endpoint does not exist'
  }, req);

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    }
  });
};

module.exports.errorHandler = module.exports;
module.exports.notFoundHandler = notFoundHandler;