const userService = require('../services/userService');
const logger = require('../utils/logger');

/**
 * Admin authorization middleware
 * Verifies that the authenticated user has admin role
 * Must be used after auth middleware
 */
module.exports = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    // Ensure user is authenticated (should be set by auth middleware)
    if (!req.user || !req.user.userId) {
      logger.logSecurityEvent('admin_access_without_auth', 'high', {
        reason: 'Admin endpoint accessed without authentication'
      }, req);
      
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'User must be authenticated to access admin resources',
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    // Check admin permissions using the user service
    const adminCheckResponse = await userService.checkAdminPermissions(req.user.userId);
    
    if (!adminCheckResponse.success) {
      logger.error('Admin permission check failed', {
        userId: req.user.userId,
        serviceError: adminCheckResponse.error
      }, req);
      
      return res.status(500).json({ 
        success: false,
        message: 'Error checking admin permissions',
        error: {
          code: 'ADMIN_CHECK_ERROR',
          message: 'Unable to verify admin permissions',
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    const { hasRole, userRole } = adminCheckResponse.data;

    if (!hasRole) {
      logger.logSecurityEvent('unauthorized_admin_access', 'high', {
        userId: req.user.userId,
        userRole: userRole,
        requiredRole: 'admin',
        reason: 'Non-admin user attempted to access admin endpoint'
      }, req);
      
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin privileges required.',
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'User does not have admin privileges',
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    const duration = Date.now() - startTime;
    logger.info('Admin access granted', {
      userId: req.user.userId,
      userRole: userRole,
      duration: `${duration}ms`
    }, req);

    next();

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Admin middleware error', {
      error: {
        message: error.message,
        stack: error.stack
      },
      userId: req.user?.userId,
      duration: `${duration}ms`
    }, req);

    return res.status(500).json({ 
      success: false,
      message: 'Server error during admin authorization',
      error: {
        code: 'ADMIN_SERVER_ERROR',
        message: 'Internal server error during admin authorization',
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      }
    });
  }
};
