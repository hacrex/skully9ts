'use strict';

const request = require('supertest');
const express = require('express');
const logger = require('../utils/logger');
const { errorHandler, notFoundHandler } = require('../middleware/errorHandler');
const requestLogger = require('../middleware/requestLogger');

describe('Error Handling and Logging', () => {
  let app;
  let logSpy;

  beforeEach(() => {
    app = express();
    
    // Setup middleware
    app.use(requestLogger);
    app.use(express.json());
    
    // Mock logger to capture log calls
    logSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
    
    // Test routes
    app.get('/test/success', (req, res) => {
      res.json({ success: true, message: 'Test successful' });
    });
    
    app.get('/test/error', (req, res, next) => {
      const error = new Error('Test error');
      error.code = 'TEST_ERROR';
      next(error);
    });
    
    app.get('/test/validation-error', (req, res, next) => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      next(error);
    });
    
    app.get('/test/database-error', (req, res, next) => {
      const error = new Error('Database connection failed');
      error.name = 'MongoError';
      next(error);
    });
    
    // Error handlers
    app.use('/api/*', notFoundHandler);
    app.use(errorHandler);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Request Logging', () => {
    test('should add request ID and timing to requests', async () => {
      const response = await request(app)
        .get('/test/success')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should log request start and end', async () => {
      const infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => {});
      
      await request(app)
        .get('/test/success')
        .expect(200);

      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('API request'),
        expect.any(Object),
        expect.any(Object)
      );
      
      infoSpy.mockRestore();
    });
  });

  describe('Error Handler Middleware', () => {
    test('should handle generic errors with proper structure', async () => {
      const response = await request(app)
        .get('/test/error')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: expect.any(String),
          timestamp: expect.any(String),
          requestId: expect.any(String)
        }
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unhandled error'),
        expect.any(Object),
        expect.any(Object)
      );
    });

    test('should handle validation errors with 400 status', async () => {
      const response = await request(app)
        .get('/test/validation-error')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          timestamp: expect.any(String),
          requestId: expect.any(String)
        }
      });
    });

    test('should handle database errors with 500 status', async () => {
      const response = await request(app)
        .get('/test/database-error')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database operation failed',
          timestamp: expect.any(String),
          requestId: expect.any(String)
        }
      });
    });

    test('should include error details in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .get('/test/error')
        .expect(500);

      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.details.originalMessage).toBe('Test error');

      process.env.NODE_ENV = originalEnv;
    });

    test('should not include error details in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/test/error')
        .expect(500);

      expect(response.body.error.details).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('404 Not Found Handler', () => {
    test('should handle non-existent API routes', async () => {
      const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
      
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'The requested endpoint does not exist',
          timestamp: expect.any(String),
          requestId: expect.any(String)
        }
      });

      expect(warnSpy).toHaveBeenCalledWith(
        '404 Not Found',
        expect.any(Object),
        expect.any(Object)
      );
      
      warnSpy.mockRestore();
    });
  });

  describe('Logger Utility', () => {
    test('should create structured log entries', () => {
      const mockReq = {
        requestId: 'test-123',
        method: 'GET',
        path: '/test',
        originalUrl: '/test?param=value',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
        user: { userId: 'user123', role: 'user' },
        query: { param: 'value' },
        params: {}
      };

      const logEntry = logger.createLogEntry('info', 'Test message', { extra: 'data' }, mockReq);

      expect(logEntry).toMatchObject({
        timestamp: expect.any(String),
        level: 'INFO',
        message: 'Test message',
        extra: 'data',
        requestContext: {
          requestId: 'test-123',
          method: 'GET',
          path: '/test',
          url: '/test?param=value',
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          userId: 'user123',
          userRole: 'user',
          query: { param: 'value' }
        }
      });
    });

    test('should log authentication events', () => {
      const mockReq = { requestId: 'test-123' };
      const logSpy = jest.spyOn(logger, 'info').mockImplementation(() => {});

      logger.logAuthEvent('login', true, { userId: 'user123' }, mockReq);

      expect(logSpy).toHaveBeenCalledWith(
        'Authentication login successful',
        expect.objectContaining({
          authEvent: 'login',
          success: true,
          userId: 'user123'
        }),
        mockReq
      );

      logSpy.mockRestore();
    });

    test('should log security events', () => {
      const mockReq = { requestId: 'test-123' };
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

      logger.logSecurityEvent('unauthorized_access', 'high', { userId: 'user123' }, mockReq);

      expect(errorSpy).toHaveBeenCalledWith(
        'Security event: unauthorized_access',
        expect.objectContaining({
          securityEvent: 'unauthorized_access',
          severity: 'high',
          userId: 'user123'
        }),
        mockReq
      );

      errorSpy.mockRestore();
    });

    test('should log performance metrics', () => {
      const mockReq = { requestId: 'test-123' };
      const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});

      logger.logPerformance('slow_operation', 6000, { operation: 'database_query' }, mockReq);

      expect(warnSpy).toHaveBeenCalledWith(
        'Performance metric: slow_operation',
        expect.objectContaining({
          operation: 'slow_operation',
          duration: '6000ms',
          performanceCategory: 'slow'
        }),
        mockReq
      );

      warnSpy.mockRestore();
    });
  });

  describe('Performance Monitor', () => {
    const performanceMonitor = require('../utils/performanceMonitor');

    test('should track operation timing', () => {
      const operationId = 'test-op-123';
      
      performanceMonitor.startOperation(operationId, 'database', { query: 'SELECT *' });
      
      // Simulate some processing time
      setTimeout(() => {
        const metrics = performanceMonitor.stopOperation(operationId, true, { rows: 100 });
        
        expect(metrics).toMatchObject({
          id: operationId,
          type: 'database',
          success: true,
          duration: expect.any(Number),
          metadata: { query: 'SELECT *' },
          rows: 100
        });
      }, 10);
    });

    test('should create database timer', () => {
      const stopTimer = performanceMonitor.createDatabaseTimer('getUserById', { userId: 'user123' });
      
      expect(typeof stopTimer).toBe('function');
      
      const metrics = stopTimer(true, { found: true });
      
      expect(metrics).toMatchObject({
        type: 'database',
        success: true,
        operation: 'getUserById',
        userId: 'user123',
        found: true
      });
    });

    test('should get performance statistics', () => {
      // Add some test operations
      performanceMonitor.recordMetrics({
        type: 'database',
        duration: 100,
        success: true,
        endTime: Date.now()
      });
      
      performanceMonitor.recordMetrics({
        type: 'database',
        duration: 2000,
        success: true,
        endTime: Date.now()
      });

      const stats = performanceMonitor.getStatistics('database');
      
      expect(stats).toMatchObject({
        totalOperations: expect.any(Number),
        successRate: expect.any(Number),
        averageDuration: expect.any(Number),
        medianDuration: expect.any(Number),
        slowOperations: expect.any(Number)
      });
    });
  });
});