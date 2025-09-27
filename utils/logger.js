'use strict';

/**
 * Centralized logging utility with structured logging and request context tracking
 */
class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  /**
   * Create structured log entry with request context
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   * @returns {Object} Structured log entry
   */
  createLogEntry(level, message, metadata = {}, req = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...metadata
    };

    // Add request context if available
    if (req) {
      logEntry.requestContext = this.extractRequestContext(req);
    }

    // Add performance timing if available
    if (req && req.startTime) {
      logEntry.duration = `${Date.now() - req.startTime}ms`;
    }

    return logEntry;
  }

  /**
   * Extract relevant request context for logging
   * @param {Object} req - Express request object
   * @returns {Object} Request context
   */
  extractRequestContext(req) {
    return {
      requestId: req.requestId || this.generateRequestId(),
      method: req.method,
      path: req.path,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId || null,
      userRole: req.user?.role || null,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      params: Object.keys(req.params).length > 0 ? req.params : undefined
    };
  }

  /**
   * Generate unique request ID
   * @returns {string} Unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if log level should be output
   * @param {string} level - Log level to check
   * @returns {boolean} Whether to output this level
   */
  shouldLog(level) {
    const currentLevelValue = this.logLevels[this.logLevel] || 2;
    const messageLevelValue = this.logLevels[level] || 2;
    return messageLevelValue <= currentLevelValue;
  }

  /**
   * Output log entry to console
   * @param {string} level - Log level
   * @param {Object} logEntry - Structured log entry
   */
  output(level, logEntry) {
    if (!this.shouldLog(level)) {
      return;
    }

    const logString = JSON.stringify(logEntry);

    switch (level) {
      case 'error':
        console.error(logString);
        break;
      case 'warn':
        console.warn(logString);
        break;
      case 'debug':
        console.debug(logString);
        break;
      default:
        console.log(logString);
    }
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   */
  error(message, metadata = {}, req = null) {
    const logEntry = this.createLogEntry('error', message, metadata, req);
    this.output('error', logEntry);
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   */
  warn(message, metadata = {}, req = null) {
    const logEntry = this.createLogEntry('warn', message, metadata, req);
    this.output('warn', logEntry);
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   */
  info(message, metadata = {}, req = null) {
    const logEntry = this.createLogEntry('info', message, metadata, req);
    this.output('info', logEntry);
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   */
  debug(message, metadata = {}, req = null) {
    const logEntry = this.createLogEntry('debug', message, metadata, req);
    this.output('debug', logEntry);
  }

  /**
   * Log database operation with timing
   * @param {string} operation - Database operation name
   * @param {number} startTime - Operation start time
   * @param {boolean} success - Whether operation succeeded
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   */
  logDatabaseOperation(operation, startTime, success, metadata = {}, req = null) {
    const duration = Date.now() - startTime;
    const level = success ? 'debug' : 'error';
    const message = `Database operation ${success ? 'completed' : 'failed'}: ${operation}`;
    
    const logMetadata = {
      operation,
      duration: `${duration}ms`,
      success,
      ...metadata
    };

    if (level === 'error') {
      this.error(message, logMetadata, req);
    } else {
      this.debug(message, logMetadata, req);
    }
  }

  /**
   * Log API request start
   * @param {Object} req - Express request object
   */
  logRequestStart(req) {
    this.info('API request started', {
      endpoint: `${req.method} ${req.path}`
    }, req);
  }

  /**
   * Log API request completion
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  logRequestEnd(req, res) {
    const duration = req.startTime ? Date.now() - req.startTime : null;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    const metadata = {
      statusCode: res.statusCode,
      endpoint: `${req.method} ${req.path}`,
      duration: duration ? `${duration}ms` : null
    };

    if (level === 'warn') {
      this.warn('API request completed with error', metadata, req);
    } else {
      this.info('API request completed successfully', metadata, req);
    }
  }

  /**
   * Log authentication events
   * @param {string} event - Authentication event type
   * @param {boolean} success - Whether authentication succeeded
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   */
  logAuthEvent(event, success, metadata = {}, req = null) {
    const level = success ? 'info' : 'warn';
    const message = `Authentication ${event} ${success ? 'successful' : 'failed'}`;
    
    const logMetadata = {
      authEvent: event,
      success,
      ...metadata
    };

    if (level === 'warn') {
      this.warn(message, logMetadata, req);
    } else {
      this.info(message, logMetadata, req);
    }
  }

  /**
   * Log security events
   * @param {string} event - Security event type
   * @param {string} severity - Event severity (low, medium, high, critical)
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   */
  logSecurityEvent(event, severity, metadata = {}, req = null) {
    const level = ['high', 'critical'].includes(severity) ? 'error' : 'warn';
    const message = `Security event: ${event}`;
    
    const logMetadata = {
      securityEvent: event,
      severity,
      ...metadata
    };

    if (level === 'error') {
      this.error(message, logMetadata, req);
    } else {
      this.warn(message, logMetadata, req);
    }
  }

  /**
   * Log performance metrics
   * @param {string} operation - Operation name
   * @param {number} duration - Operation duration in ms
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   */
  logPerformance(operation, duration, metadata = {}, req = null) {
    const level = duration > 5000 ? 'warn' : 'debug'; // Warn if operation takes > 5 seconds
    const message = `Performance metric: ${operation}`;
    
    const logMetadata = {
      operation,
      duration: `${duration}ms`,
      performanceCategory: duration > 5000 ? 'slow' : duration > 1000 ? 'moderate' : 'fast',
      ...metadata
    };

    if (level === 'warn') {
      this.warn(message, logMetadata, req);
    } else {
      this.debug(message, logMetadata, req);
    }
  }
}

// Export singleton instance
const logger = new Logger();

module.exports = logger;