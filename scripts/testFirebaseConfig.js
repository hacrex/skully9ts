#!/usr/bin/env node
'use strict';

/**
 * Firebase Configuration Test Script
 * Tests Firebase configuration and database connectivity
 */

require('dotenv').config();
const databaseService = require('../services/databaseService');

async function testFirebaseConfiguration() {
  console.log('🔥 Firebase Configuration Test');
  console.log('================================\n');

  try {
    // Test Firebase configuration
    console.log('1. Testing Firebase configuration...');
    const testResults = await databaseService.testFirebaseConfiguration();
    
    console.log('\n📊 Test Results:');
    console.log('================');
    
    // Configuration results
    console.log('\n🔧 Configuration:');
    console.log(`   ✅ Config Valid: ${testResults.configuration.configValid ? '✓' : '✗'}`);
    console.log(`   ✅ App Initialized: ${testResults.configuration.appInitialized ? '✓' : '✗'}`);
    console.log(`   ✅ Database Connected: ${testResults.configuration.databaseConnected ? '✓' : '✗'}`);
    
    // Connectivity results
    console.log('\n🌐 Connectivity:');
    console.log(`   ✅ Connection Test: ${testResults.connectivity.connected ? '✓' : '✗'}`);
    console.log(`   📊 Connection Attempts: ${testResults.connectivity.connectionAttempts}`);
    
    // Overall status
    console.log('\n🎯 Overall Status:');
    console.log(`   ${testResults.overall ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (testResults.configuration.error) {
      console.log('\n❌ Configuration Error:');
      console.log(`   ${testResults.configuration.error}`);
    }
    
    if (testResults.connectivity.error) {
      console.log('\n❌ Connectivity Error:');
      console.log(`   ${testResults.connectivity.error}`);
    }

    // Health check
    console.log('\n2. Running health check...');
    const healthCheck = await databaseService.healthCheck();
    
    console.log('\n🏥 Health Check Results:');
    console.log('========================');
    console.log(`   Status: ${healthCheck.status.toUpperCase()}`);
    console.log(`   Database Connected: ${healthCheck.database.connected ? '✓' : '✗'}`);
    console.log(`   Response Time: ${healthCheck.database.responseTime}ms`);
    console.log(`   Service Initialized: ${healthCheck.service.initialized ? '✓' : '✗'}`);
    
    if (healthCheck.database.error) {
      console.log(`   Error: ${healthCheck.database.error}`);
    }

    // Environment variables check
    console.log('\n3. Checking environment variables...');
    const requiredVars = [
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN', 
      'FIREBASE_DATABASE_URL',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STORAGE_BUCKET',
      'FIREBASE_MESSAGING_SENDER_ID',
      'FIREBASE_APP_ID'
    ];

    console.log('\n🔐 Environment Variables:');
    console.log('=========================');
    
    let allVarsPresent = true;
    requiredVars.forEach(varName => {
      const isPresent = !!process.env[varName];
      console.log(`   ${isPresent ? '✅' : '❌'} ${varName}: ${isPresent ? 'SET' : 'MISSING'}`);
      if (!isPresent) allVarsPresent = false;
    });

    // Optional variables
    const optionalVars = ['FIREBASE_MEASUREMENT_ID'];
    console.log('\n📋 Optional Variables:');
    optionalVars.forEach(varName => {
      const isPresent = !!process.env[varName];
      console.log(`   ${isPresent ? '✅' : '⚪'} ${varName}: ${isPresent ? 'SET' : 'NOT SET'}`);
    });

    // Final summary
    console.log('\n📋 Summary:');
    console.log('===========');
    
    if (testResults.overall && healthCheck.status === 'healthy' && allVarsPresent) {
      console.log('🎉 All tests passed! Firebase is properly configured.');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Please check the configuration.');
      
      if (!allVarsPresent) {
        console.log('\n💡 Next steps:');
        console.log('   1. Create a .env file based on .env.example');
        console.log('   2. Add your Firebase configuration values');
        console.log('   3. Run this test again');
      }
      
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.message);
    console.error('\n💡 Make sure you have:');
    console.error('   1. Created a .env file with Firebase configuration');
    console.error('   2. Set all required environment variables');
    console.error('   3. Valid Firebase project credentials');
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testFirebaseConfiguration();
}

module.exports = testFirebaseConfiguration;