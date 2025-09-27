'use strict';

const logger = require('../utils/logger');

/**
 * Request logging middleware
 * Adds request context tracking and logs request start/end
 */
module.exports = (req, res, next) => {
  // Add request start time for performance tracking
  req.startTime = Date.now();
  
  // Generate unique request ID
  req.requestId = logger.generateRequestId();
  
  // Log request start
  logger.logRequestStart(req);
  
  // Capture original res.end to log request completion
  const originalEnd = res.end;
  res.end = function(...args) {
    // Log request completion
    logger.logRequestEnd(req, res);
    
    // Call original end method
    originalEnd.apply(this, args);
  };
  
  next();
};