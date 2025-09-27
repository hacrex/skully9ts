'use strict';

const { initializeApp, getApp, getApps } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

/**
 * Unified Database Service for Firebase Realtime Database
 * Provides connection management, error handling, and health checks
 */
class DatabaseService {
  constructor() {
    this.database = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Initialize Firebase app and get database instance
   * @returns {Object} Firebase Realtime Database instance
   */
  getDatabase() {
    try {
      if (!this.database) {
        // Firebase configuration
        const firebaseConfig = {
          apiKey: "AIzaSyD80CUiiEFMa0YRlTZx6E-GbD7NZ-dzgNs",
          authDomain: "skully9ts.firebaseapp.com",
          databaseURL: "https://skully9ts-default-rtdb.firebaseio.com",
          projectId: "skully9ts",
          storageBucket: "skully9ts.firebasestorage.app",
          messagingSenderId: "785152782972",
          appId: "1:785152782972:web:40b6d18feb7785bc750ff9",
          measurementId: "G-FVKL4993LB"
        };

        // Initialize Firebase app if not already initialized
        if (!getApps().length) {
          initializeApp(firebaseConfig);
          this.log('info', 'Firebase app initialized successfully');
        }

        // Get database instance
        this.database = getDatabase(getApp());
        this.log('info', 'Firebase Realtime Database instance created');
      }

      return this.database;
    } catch (error) {
      this.log('error', 'Failed to initialize Firebase database', { error: error.message });
      throw this.createError('DATABASE_INIT_ERROR', 'Failed to initialize database connection', error);
    }
  }

  /**
   * Validate database connection by performing a test read
   * @returns {Promise<boolean>} Connection status
   */
  async validateConnection() {
    try {
      const db = this.getDatabase();
      const testRef = ref(db, '.info/connected');
      const snapshot = await get(testRef);
      
      this.isConnected = snapshot.exists();
      
      if (this.isConnected) {
        this.log('info', 'Database connection validated successfully');
        this.connectionAttempts = 0;
      } else {
        this.log('warn', 'Database connection validation failed - not connected');
      }

      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      this.connectionAttempts++;
      this.log('error', 'Database connection validation failed', { 
        error: error.message,
        attempts: this.connectionAttempts 
      });
      
      throw this.createError('CONNECTION_VALIDATION_ERROR', 'Database connection validation failed', error);
    }
  }

  /**
   * Perform comprehensive health check of database service
   * @returns {Promise<Object>} Health check results
   */
  async healthCheck() {
    const healthStatus = {
      status: 'unknown',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        responseTime: null,
        error: null
      },
      service: {
        initialized: !!this.database,
        connectionAttempts: this.connectionAttempts,
        maxRetries: this.maxRetries
      }
    };

    try {
      const startTime = Date.now();
      
      // Test database connectivity
      await this.validateConnection();
      
      const responseTime = Date.now() - startTime;
      
      healthStatus.status = 'healthy';
      healthStatus.database.connected = true;
      healthStatus.database.responseTime = responseTime;
      
      this.log('info', 'Health check completed successfully', { responseTime });
      
    } catch (error) {
      healthStatus.status = 'unhealthy';
      healthStatus.database.error = error.message;
      
      this.log('error', 'Health check failed', { error: error.message });
    }

    return healthStatus;
  }

  /**
   * Retry database operation with exponential backoff
   * @param {Function} operation - The operation to retry
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise<any>} Operation result
   */
  async retryOperation(operation, maxRetries = this.maxRetries) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          this.log('error', 'Operation failed after all retries', {
            attempts: attempt,
            error: error.message
          });
          break;
        }
        
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        this.log('warn', `Operation failed, retrying in ${delay}ms`, {
          attempt,
          maxRetries,
          error: error.message
        });
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Create standardized error object
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {Error} originalError - Original error object
   * @returns {Error} Standardized error
   */
  createError(code, message, originalError = null) {
    const error = new Error(message);
    error.code = code;
    error.timestamp = new Date().toISOString();
    
    if (originalError) {
      error.originalError = {
        message: originalError.message,
        stack: originalError.stack,
        code: originalError.code
      };
    }
    
    return error;
  }

  /**
   * Handle and format database operation errors
   * @param {Error} error - Original error
   * @param {string} operation - Operation that failed
   * @param {Object} context - Additional context
   * @param {Object} req - Express request object (optional)
   * @returns {Object} Formatted error response
   */
  handleError(error, operation, context = {}, req = null) {
    const errorResponse = {
      success: false,
      data: null,
      error: {
        code: error.code || 'DATABASE_ERROR',
        message: error.message || 'An unknown database error occurred',
        operation,
        timestamp: new Date().toISOString(),
        context,
        requestId: req?.requestId || null
      }
    };

    // Log the error with full context
    this.log('error', `Database operation failed: ${operation}`, {
      error: error.message,
      code: error.code,
      context,
      stack: error.stack
    }, req);

    return errorResponse;
  }

  /**
   * Create standardized success response
   * @param {any} data - Response data
   * @param {string} operation - Operation that succeeded
   * @param {Object} req - Express request object (optional)
   * @returns {Object} Formatted success response
   */
  createSuccessResponse(data, operation, req = null) {
    return {
      success: true,
      data,
      error: null,
      operation,
      timestamp: new Date().toISOString(),
      requestId: req?.requestId || null
    };
  }

  /**
   * Structured logging utility
   * @param {string} level - Log level (info, warn, error, debug)
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   */
  log(level, message, metadata = {}, req = null) {
    const logger = require('../utils/logger');
    
    const logMetadata = {
      service: 'DatabaseService',
      ...metadata
    };

    // Use centralized logger
    switch (level.toLowerCase()) {
      case 'error':
        logger.error(message, logMetadata, req);
        break;
      case 'warn':
        logger.warn(message, logMetadata, req);
        break;
      case 'debug':
        logger.debug(message, logMetadata, req);
        break;
      default:
        logger.info(message, logMetadata, req);
    }
  }

  /**
   * Sleep utility for retry delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get connection status
   * @returns {boolean} Current connection status
   */
  isConnectionHealthy() {
    return this.isConnected;
  }

  /**
   * Reset connection state (useful for testing)
   */
  resetConnection() {
    this.database = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.log('info', 'Database connection state reset');
  }
}

// Export singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;