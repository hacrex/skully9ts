'use strict';

const firebaseConfig = require('../config/firebaseConfig');

// Mock environment variables for testing
const mockEnvVars = {
  FIREBASE_API_KEY: 'test-api-key',
  FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
  FIREBASE_DATABASE_URL: 'https://test-project-default-rtdb.firebaseio.com',
  FIREBASE_PROJECT_ID: 'test-project',
  FIREBASE_STORAGE_BUCKET: 'test-project.firebasestorage.app',
  FIREBASE_MESSAGING_SENDER_ID: '123456789',
  FIREBASE_APP_ID: '1:123456789:web:abcdef123456',
  FIREBASE_MEASUREMENT_ID: 'G-ABCDEF123'
};

describe('FirebaseConfig', () => {
  let originalEnv;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = { ...process.env };
    
    // Set mock environment variables
    Object.keys(mockEnvVars).forEach(key => {
      process.env[key] = mockEnvVars[key];
    });

    // Reset Firebase config
    firebaseConfig.reset();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
    
    // Reset Firebase config
    firebaseConfig.reset();
  });

  describe('validateEnvironmentVariables', () => {
    it('should pass validation with all required variables', () => {
      expect(() => firebaseConfig.validateEnvironmentVariables()).not.toThrow();
    });

    it('should throw error when required variables are missing', () => {
      delete process.env.FIREBASE_API_KEY;
      delete process.env.FIREBASE_PROJECT_ID;

      expect(() => firebaseConfig.validateEnvironmentVariables()).toThrow(
        'Missing required Firebase environment variables: FIREBASE_API_KEY, FIREBASE_PROJECT_ID'
      );
    });

    it('should throw error for invalid database URL format', () => {
      process.env.FIREBASE_DATABASE_URL = 'https://invalid-url.com';

      expect(() => firebaseConfig.validateEnvironmentVariables()).toThrow(
        'Invalid FIREBASE_DATABASE_URL format'
      );
    });
  });

  describe('getFirebaseConfig', () => {
    it('should return correct configuration object', () => {
      const config = firebaseConfig.getFirebaseConfig();

      expect(config).toEqual({
        apiKey: mockEnvVars.FIREBASE_API_KEY,
        authDomain: mockEnvVars.FIREBASE_AUTH_DOMAIN,
        databaseURL: mockEnvVars.FIREBASE_DATABASE_URL,
        projectId: mockEnvVars.FIREBASE_PROJECT_ID,
        storageBucket: mockEnvVars.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: mockEnvVars.FIREBASE_MESSAGING_SENDER_ID,
        appId: mockEnvVars.FIREBASE_APP_ID,
        measurementId: mockEnvVars.FIREBASE_MEASUREMENT_ID
      });
    });

    it('should handle optional measurementId', () => {
      delete process.env.FIREBASE_MEASUREMENT_ID;
      
      const config = firebaseConfig.getFirebaseConfig();
      expect(config.measurementId).toBeUndefined();
    });
  });

  describe('testConfiguration', () => {
    it('should return test results object', async () => {
      const results = await firebaseConfig.testConfiguration();

      expect(results).toHaveProperty('configValid');
      expect(results).toHaveProperty('appInitialized');
      expect(results).toHaveProperty('databaseConnected');
      expect(results).toHaveProperty('error');
    });

    it('should handle configuration errors gracefully', async () => {
      delete process.env.FIREBASE_API_KEY;
      
      const results = await firebaseConfig.testConfiguration();
      
      expect(results.configValid).toBe(false);
      expect(results.error).toContain('Missing required Firebase environment variables');
    });
  });

  describe('reset', () => {
    it('should reset all internal state', () => {
      // Initialize some state
      firebaseConfig.isInitialized = true;
      firebaseConfig.app = {};
      firebaseConfig.database = {};

      // Reset
      firebaseConfig.reset();

      expect(firebaseConfig.app).toBeNull();
      expect(firebaseConfig.database).toBeNull();
      expect(firebaseConfig.isInitialized).toBe(false);
    });
  });
});