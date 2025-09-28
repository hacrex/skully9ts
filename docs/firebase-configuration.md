# Firebase Configuration Guide

## Overview

This application uses Firebase Realtime Database for data storage. The Firebase configuration has been updated to use environment variables for better security and flexibility across different environments.

## Configuration Files

### 1. `config/firebaseConfig.js`
- Centralized Firebase configuration and initialization
- Environment variable validation
- Connection testing utilities
- Singleton pattern for consistent database instances

### 2. Environment Variables

Required environment variables in your `.env` file:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id  # Optional
```

## Setup Instructions

### 1. Create Environment File
Copy `.env.example` to `.env` and update the Firebase configuration values:

```bash
cp .env.example .env
```

### 2. Get Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Click on the web app or create a new one
6. Copy the configuration values to your `.env` file

### 3. Test Configuration
Run the Firebase configuration test to verify everything is working:

```bash
npm run test:firebase
```

This will:
- Validate all required environment variables are set
- Test Firebase app initialization
- Test database connectivity
- Run health checks

## Database Service Integration

The `services/databaseService.js` now uses the centralized Firebase configuration:

```javascript
const firebaseConfig = require('../config/firebaseConfig');

// Get database instance
const database = firebaseConfig.getRealtimeDatabase();
```

## Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use different Firebase projects for development, staging, and production
- Rotate API keys regularly
- Use Firebase security rules to control data access

### Database Rules
The application expects Firebase security rules to be configured. A "Permission denied" error during connection testing is normal and indicates that security rules are properly configured.

## Testing

### Unit Tests
Firebase configuration has comprehensive unit tests:

```bash
npm test -- tests/firebaseConfig.test.js
```

### Integration Testing
Test the complete Firebase setup:

```bash
npm run test:firebase
```

### Service Tests
All existing service tests continue to work with the new configuration:

```bash
npm test
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Error: "Missing required Firebase environment variables"
   - Solution: Ensure all required variables are set in `.env`

2. **Invalid Database URL**
   - Error: "Invalid FIREBASE_DATABASE_URL format"
   - Solution: Use the correct Realtime Database URL format

3. **Permission Denied**
   - This is expected behavior with proper security rules
   - The connection test handles this automatically

4. **Connection Timeout**
   - Check internet connectivity
   - Verify Firebase project is active
   - Check Firebase service status

### Debug Mode
Enable debug logging by setting:

```env
NODE_ENV=development
```

## Migration Notes

### Changes Made
1. Moved hardcoded Firebase config to environment variables
2. Created centralized Firebase configuration service
3. Updated database service to use new configuration
4. Added comprehensive testing and validation
5. Removed any unused Firestore references

### Backward Compatibility
- All existing service methods continue to work unchanged
- API endpoints remain the same
- Database structure is unchanged

## Performance

### Connection Management
- Single Firebase app instance (singleton pattern)
- Reused database connections
- Connection health monitoring
- Automatic retry logic with exponential backoff

### Monitoring
The database service includes:
- Connection health checks
- Performance timing
- Structured logging
- Error tracking with context