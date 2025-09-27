const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const logger = require('../utils/logger');
const auth = require('../middleware/auth');

/**
 * Input validation middleware for registration
 */
const validateRegistration = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const errors = [];

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Name validation
  if (!firstName || firstName.trim().length === 0) {
    errors.push('First name is required');
  }
  if (!lastName || lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors
      }
    });
  }

  next();
};

/**
 * Input validation middleware for login
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors
      }
    });
  }

  next();
};

/**
 * Standardized error response formatter
 */
const formatErrorResponse = (error, defaultMessage = 'Server error') => {
  if (error.success === false) {
    // Error from service layer
    const statusCode = getStatusCodeFromError(error.error.code);
    return {
      status: statusCode,
      response: {
        success: false,
        error: error.error
      }
    };
  }

  // Unexpected error
  return {
    status: 500,
    response: {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: defaultMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }
  };
};

/**
 * Map error codes to HTTP status codes
 */
const getStatusCodeFromError = (errorCode) => {
  const statusMap = {
    'VALIDATION_ERROR': 400,
    'DUPLICATE_ERROR': 409,
    'AUTHENTICATION_ERROR': 401,
    'NOT_FOUND_ERROR': 404,
    'AUTHORIZATION_ERROR': 403,
    'DATABASE_ERROR': 500
  };
  return statusMap[errorCode] || 500;
};

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Create user using new service
    const result = await userService.createUser({
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role || 'user'
    });

    if (!result.success) {
      const errorResponse = formatErrorResponse(result);
      return res.status(errorResponse.status).json(errorResponse.response);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.data.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          email: result.data.email,
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          role: result.data.role,
          createdAt: result.data.createdAt
        }
      }
    });

  } catch (error) {
    logger.error('Registration error', {
      error: {
        message: error.message,
        stack: error.stack
      },
      email: req.body.email
    }, req);
    
    const errorResponse = formatErrorResponse(error, 'Registration failed');
    res.status(errorResponse.status).json(errorResponse.response);
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate user credentials using new service
    const result = await userService.validateUserCredentials(
      email.toLowerCase().trim(),
      password
    );

    if (!result.success) {
      const errorResponse = formatErrorResponse(result);
      return res.status(errorResponse.status).json(errorResponse.response);
    }

    // Update last login timestamp
    await userService.updateLastLogin(result.data.email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.data.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          email: result.data.email,
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          role: result.data.role,
          lastLogin: Date.now()
        }
      }
    });

  } catch (error) {
    logger.error('Login error', {
      error: {
        message: error.message,
        stack: error.stack
      },
      email: req.body.email
    }, req);
    
    const errorResponse = formatErrorResponse(error, 'Login failed');
    res.status(errorResponse.status).json(errorResponse.response);
  }
});

// @route   GET api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // Get user profile using new service
    const result = await userService.getUserById(req.user.userId);

    if (!result.success) {
      const errorResponse = formatErrorResponse(result);
      return res.status(errorResponse.status).json(errorResponse.response);
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND_ERROR',
          message: 'User profile not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: result.data
      }
    });

  } catch (error) {
    logger.error('Get profile error', {
      error: {
        message: error.message,
        stack: error.stack
      },
      userId: req.user?.userId
    }, req);
    
    const errorResponse = formatErrorResponse(error, 'Failed to retrieve user profile');
    res.status(errorResponse.status).json(errorResponse.response);
  }
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const updateData = {};

    // Validate and prepare update data
    if (firstName !== undefined) {
      if (!firstName || firstName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'First name cannot be empty'
          }
        });
      }
      updateData.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (!lastName || lastName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Last name cannot be empty'
          }
        });
      }
      updateData.lastName = lastName.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No valid fields to update'
        }
      });
    }

    // Update user profile using new service
    const result = await userService.updateUser(req.user.userId, updateData);

    if (!result.success) {
      const errorResponse = formatErrorResponse(result);
      return res.status(errorResponse.status).json(errorResponse.response);
    }

    res.json({
      success: true,
      data: {
        user: result.data,
        message: 'Profile updated successfully'
      }
    });

  } catch (error) {
    logger.error('Update profile error', {
      error: {
        message: error.message,
        stack: error.stack
      },
      userId: req.user?.userId,
      updateFields: Object.keys(req.body)
    }, req);
    
    const errorResponse = formatErrorResponse(error, 'Failed to update profile');
    res.status(errorResponse.status).json(errorResponse.response);
  }
});

// @route   PUT api/auth/password
// @desc    Update user password
// @access  Private
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Input validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Current password and new password are required'
        }
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'New password must be at least 6 characters long'
        }
      });
    }

    // Update password using new service
    const result = await userService.updatePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      const errorResponse = formatErrorResponse(result);
      return res.status(errorResponse.status).json(errorResponse.response);
    }

    res.json({
      success: true,
      data: {
        message: 'Password updated successfully'
      }
    });

  } catch (error) {
    logger.error('Update password error', {
      error: {
        message: error.message,
        stack: error.stack
      },
      userId: req.user?.userId
    }, req);
    
    const errorResponse = formatErrorResponse(error, 'Failed to update password');
    res.status(errorResponse.status).json(errorResponse.response);
  }
});

module.exports = router;