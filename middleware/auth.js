const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Verifies JWT token and validates user existence and status
 */
module.exports = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      logger.logAuthEvent('token_missing', false, {
        reason: 'No token provided'
      }, req);
      
      return res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied',
        error: {
          code: 'NO_TOKEN',
          message: 'Authentication token is required',
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      logger.logAuthEvent('token_verification', false, {
        reason: 'Invalid or expired token',
        jwtError: jwtError.message
      }, req);
      
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid',
        error: {
          code: 'INVALID_TOKEN',
          message: 'Authentication token is invalid or expired',
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    // Validate user exists and is active
    const userResponse = await userService.getUserById(decoded.userId || decoded.email);
    
    if (!userResponse.success || !userResponse.data) {
      logger.logAuthEvent('user_validation', false, {
        reason: 'User not found',
        userId: decoded.userId || decoded.email
      }, req);
      
      return res.status(401).json({ 
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User associated with token does not exist',
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    const user = userResponse.data;

    // Check if user is active
    if (!user.isActive) {
      logger.logSecurityEvent('deactivated_account_access', 'medium', {
        userId: user.email,
        reason: 'Attempt to access with deactivated account'
      }, req);
      
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated',
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'User account has been deactivated',
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    // Add user data to request object
    req.user = {
      userId: user.email,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    const duration = Date.now() - startTime;
    logger.logAuthEvent('authentication', true, {
      userId: user.email,
      role: user.role,
      duration: `${duration}ms`
    }, req);

    next();

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Authentication middleware error', {
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`
    }, req);

    return res.status(500).json({ 
      success: false,
      message: 'Authentication server error',
      error: {
        code: 'AUTH_SERVER_ERROR',
        message: 'Internal server error during authentication',
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      }
    });
  }
};
