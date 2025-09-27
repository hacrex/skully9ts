'use strict';

const logger = require('./logger');

/**
 * Performance monitoring utility for tracking operation timing and metrics
 */
class PerformanceMonitor {
  constructor() {
    this.activeOperations = new Map();
    this.metrics = {
      databaseOperations: [],
      apiRequests: [],
      slowOperations: []
    };
    this.thresholds = {
      slowDatabase: 1000, // 1 second
      slowApi: 2000, // 2 seconds
      verySlowOperation: 5000 // 5 seconds
    };
  }

  /**
   * Start timing an operation
   * @param {string} operationId - Unique operation identifier
   * @param {string} operationType - Type of operation (database, api, etc.)
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   * @returns {string} Operation ID for stopping the timer
   */
  startOperation(operationId, operationType, metadata = {}, req = null) {
    const operation = {
      id: operationId,
      type: operationType,
      startTime: Date.now(),
      metadata,
      requestId: req?.requestId || null,
      userId: req?.user?.userId || null
    };

    this.activeOperations.set(operationId, operation);
    
    logger.debug('Operation started', {
      operationId,
      operationType,
      metadata
    }, req);

    return operationId;
  }

  /**
   * Stop timing an operation and record metrics
   * @param {string} operationId - Operation identifier
   * @param {boolean} success - Whether operation succeeded
   * @param {Object} additionalMetadata - Additional metadata to record
   * @param {Object} req - Express request object (optional)
   * @returns {Object} Operation metrics
   */
  stopOperation(operationId, success = true, additionalMetadata = {}, req = null) {
    const operation = this.activeOperations.get(operationId);
    
    if (!operation) {
      logger.warn('Attempted to stop unknown operation', { operationId }, req);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - operation.startTime;

    const metrics = {
      ...operation,
      endTime,
      duration,
      success,
      ...additionalMetadata
    };

    // Remove from active operations
    this.activeOperations.delete(operationId);

    // Record metrics
    this.recordMetrics(metrics, req);

    // Log performance
    this.logPerformance(metrics, req);

    return metrics;
  }

  /**
   * Record operation metrics for analysis
   * @param {Object} metrics - Operation metrics
   * @param {Object} req - Express request object (optional)
   */
  recordMetrics(metrics, req = null) {
    const { type, duration, success } = metrics;

    // Store metrics by type
    switch (type) {
      case 'database':
        this.metrics.databaseOperations.push(metrics);
        break;
      case 'api':
        this.metrics.apiRequests.push(metrics);
        break;
    }

    // Track slow operations
    if (duration > this.thresholds.slowDatabase && type === 'database') {
      this.metrics.slowOperations.push(metrics);
    } else if (duration > this.thresholds.slowApi && type === 'api') {
      this.metrics.slowOperations.push(metrics);
    }

    // Limit stored metrics to prevent memory issues
    this.limitMetricsStorage();
  }

  /**
   * Log performance metrics
   * @param {Object} metrics - Operation metrics
   * @param {Object} req - Express request object (optional)
   */
  logPerformance(metrics, req = null) {
    const { id, type, duration, success, metadata } = metrics;

    // Determine log level based on performance
    let level = 'debug';
    let category = 'normal';

    if (duration > this.thresholds.verySlowOperation) {
      level = 'error';
      category = 'very_slow';
    } else if (duration > this.thresholds.slowApi) {
      level = 'warn';
      category = 'slow';
    } else if (duration > this.thresholds.slowDatabase && type === 'database') {
      level = 'warn';
      category = 'slow';
    }

    const logMetadata = {
      operationId: id,
      operationType: type,
      duration: `${duration}ms`,
      success,
      performanceCategory: category,
      ...metadata
    };

    logger.logPerformance(id, duration, logMetadata, req);
  }

  /**
   * Limit stored metrics to prevent memory issues
   */
  limitMetricsStorage() {
    const maxMetrics = 1000;

    // Limit each metrics array
    Object.keys(this.metrics).forEach(key => {
      if (this.metrics[key].length > maxMetrics) {
        this.metrics[key] = this.metrics[key].slice(-maxMetrics);
      }
    });
  }

  /**
   * Get performance statistics
   * @param {string} type - Operation type to analyze (optional)
   * @param {number} timeWindow - Time window in milliseconds (optional)
   * @returns {Object} Performance statistics
   */
  getStatistics(type = null, timeWindow = null) {
    const now = Date.now();
    let operations = [];

    // Collect operations based on type
    if (type) {
      switch (type) {
        case 'database':
          operations = this.metrics.databaseOperations;
          break;
        case 'api':
          operations = this.metrics.apiRequests;
          break;
        default:
          operations = [...this.metrics.databaseOperations, ...this.metrics.apiRequests];
      }
    } else {
      operations = [...this.metrics.databaseOperations, ...this.metrics.apiRequests];
    }

    // Filter by time window if specified
    if (timeWindow) {
      const cutoff = now - timeWindow;
      operations = operations.filter(op => op.endTime >= cutoff);
    }

    if (operations.length === 0) {
      return {
        totalOperations: 0,
        successRate: 0,
        averageDuration: 0,
        medianDuration: 0,
        slowOperations: 0,
        fastestOperation: null,
        slowestOperation: null
      };
    }

    // Calculate statistics
    const durations = operations.map(op => op.duration).sort((a, b) => a - b);
    const successfulOps = operations.filter(op => op.success);
    const slowOps = operations.filter(op => 
      op.duration > (op.type === 'database' ? this.thresholds.slowDatabase : this.thresholds.slowApi)
    );

    const statistics = {
      totalOperations: operations.length,
      successRate: (successfulOps.length / operations.length) * 100,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      medianDuration: durations[Math.floor(durations.length / 2)],
      slowOperations: slowOps.length,
      fastestOperation: Math.min(...durations),
      slowestOperation: Math.max(...durations),
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      p99Duration: durations[Math.floor(durations.length * 0.99)]
    };

    return statistics;
  }

  /**
   * Get current active operations
   * @returns {Array} List of active operations
   */
  getActiveOperations() {
    return Array.from(this.activeOperations.values());
  }

  /**
   * Clear all stored metrics
   */
  clearMetrics() {
    this.metrics = {
      databaseOperations: [],
      apiRequests: [],
      slowOperations: []
    };
    
    logger.info('Performance metrics cleared');
  }

  /**
   * Set performance thresholds
   * @param {Object} thresholds - New threshold values
   */
  setThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds };
    
    logger.info('Performance thresholds updated', { thresholds: this.thresholds });
  }

  /**
   * Create a database operation timer
   * @param {string} operation - Database operation name
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   * @returns {Function} Function to stop the timer
   */
  createDatabaseTimer(operation, metadata = {}, req = null) {
    const operationId = `db_${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.startOperation(operationId, 'database', {
      operation,
      ...metadata
    }, req);

    return (success = true, additionalMetadata = {}) => {
      return this.stopOperation(operationId, success, {
        operation,
        ...additionalMetadata
      }, req);
    };
  }

  /**
   * Create an API request timer
   * @param {string} endpoint - API endpoint
   * @param {Object} metadata - Additional metadata
   * @param {Object} req - Express request object (optional)
   * @returns {Function} Function to stop the timer
   */
  createApiTimer(endpoint, metadata = {}, req = null) {
    const operationId = `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.startOperation(operationId, 'api', {
      endpoint,
      ...metadata
    }, req);

    return (success = true, additionalMetadata = {}) => {
      return this.stopOperation(operationId, success, {
        endpoint,
        ...additionalMetadata
      }, req);
    };
  }
}

// Export singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;