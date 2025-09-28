'use strict';

const { initializeApp, getApp, getApps } = require('firebase/app');
const { getDatabase } = require('firebase/database');

/**
 * Firebase Configuration and Initialization
 * Handles Firebase app initialization with environment variable validation
 */
class FirebaseConfig {
  constructor() {
    this.app = null;
    this.database = null;
    this.isInitialized = false;
  }

  /**
   * Validate required environment variables for Firebase
   * @throws {Error} If required environment variables are missing
   */
  validateEnvironmentVariables() {
    const requiredVars = [
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN',
      'FIREBASE_DATABASE_URL',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STORAGE_BUCKET',
      'FIREBASE_MESSAGING_SENDER_ID',
      'FIREBASE_APP_ID'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required Firebase environment variables: ${missingVars.join(', ')}. ` +
        'Please check your .env file and ensure all Firebase configuration variables are set.'
      );
    }

    // Validate URL format for database URL
    const databaseUrl = process.env.FIREBASE_DATABASE_URL;
    if (!databaseUrl.includes('firebaseio.com') && !databaseUrl.includes('firebase.app')) {
      throw new Error(
        'Invalid FIREBASE_DATABASE_URL format. Expected a Firebase Realtime Database URL.'
      );
    }
  }

  /**
   * Get Firebase configuration object from environment variables
   * @returns {Object} Firebase configuration object
   */
  getFirebaseConfig() {
    this.validateEnvironmentVariables();

    return {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID // Optional
    };
  }

  /**
   * Initialize Firebase app if not already initialized
   * @returns {Object} Firebase app instance
   */
  initializeFirebaseApp() {
    try {
      if (!this.isInitialized) {
        const firebaseConfig = this.getFirebaseConfig();

        // Initialize Firebase app if not already initialized
        if (!getApps().length) {
          this.app = initializeApp(firebaseConfig);
          console.log('Firebase app initialized successfully');
        } else {
          this.app = getApp();
          console.log('Using existing Firebase app instance');
        }

        this.isInitialized = true;
      }

      return this.app;
    } catch (error) {
      console.error('Failed to initialize Firebase app:', error.message);
      throw new Error(`Firebase initialization failed: ${error.message}`);
    }
  }

  /**
   * Get Firebase Realtime Database instance
   * @returns {Object} Firebase Realtime Database instance
   */
  getRealtimeDatabase() {
    try {
      if (!this.database) {
        const app = this.initializeFirebaseApp();
        this.database = getDatabase(app);
        console.log('Firebase Realtime Database instance created');
      }

      return this.database;
    } catch (error) {
      console.error('Failed to get Firebase Realtime Database:', error.message);
      throw new Error(`Database initialization failed: ${error.message}`);
    }
  }

  /**
   * Test Firebase configuration and connectivity
   * @returns {Promise<Object>} Test results
   */
  async testConfiguration() {
    const testResults = {
      configValid: false,
      appInitialized: false,
      databaseConnected: false,
      error: null
    };

    try {
      // Test configuration validation
      this.validateEnvironmentVariables();
      testResults.configValid = true;

      // Test app initialization
      this.initializeFirebaseApp();
      testResults.appInitialized = true;

      // Test database connection
      const database = this.getRealtimeDatabase();
      if (database) {
        testResults.databaseConnected = true;
      }

    } catch (error) {
      testResults.error = error.message;
      console.error('Firebase configuration test failed:', error.message);
    }

    return testResults;
  }

  /**
   * Reset Firebase configuration (useful for testing)
   */
  reset() {
    this.app = null;
    this.database = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
const firebaseConfig = new FirebaseConfig();

module.exports = firebaseConfig;