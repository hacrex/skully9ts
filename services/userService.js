'use strict';

const { ref, get, set, update, remove, query, orderByChild, equalTo } = require('firebase/database');
const bcrypt = require('bcryptjs');
const databaseService = require('./databaseService');

/**
 * User Service for Firebase Realtime Database
 * Provides comprehensive CRUD operations, authentication, and role management for users
 */
class UserService {
  constructor() {
    this.collectionPath = 'users';
    this.saltRounds = 10;
  }

  /**
   * Create a new user with hashed password
   * @param {Object} userData - User data object
   * @param {string} userData.email - User email (used as ID)
   * @param {string} userData.password - Plain text password
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @param {string} [userData.role='user'] - User role
   * @returns {Promise<Object>} Created user data (without password)
   */
  async createUser(userData) {
    try {
      const { email, password, firstName, lastName, role = 'user' } = userData;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        throw databaseService.createError(
          'VALIDATION_ERROR',
          'Missing required fields: email, password, firstName, lastName'
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw databaseService.createError('VALIDATION_ERROR', 'Invalid email format');
      }

      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser.success && existingUser.data) {
        throw databaseService.createError('DUPLICATE_ERROR', 'User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      // Prepare user data
      const newUser = {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        createdAt: Date.now(),
        lastLogin: null,
        isActive: true
      };

      // Save to database
      const db = databaseService.getDatabase();
      const userRef = ref(db, `${this.collectionPath}/${email}`);
      await set(userRef, newUser);

      databaseService.log('info', 'User created successfully', { email, role });

      // Return user data without password
      const { password: _, ...userWithoutPassword } = newUser;
      return databaseService.createSuccessResponse(userWithoutPassword, 'createUser');

    } catch (error) {
      return databaseService.handleError(error, 'createUser', { email: userData.email });
    }
  }

  /**
   * Get user by ID (email)
   * @param {string} userId - User ID (email)
   * @returns {Promise<Object>} User data (without password)
   */
  async getUserById(userId) {
    try {
      if (!userId) {
        throw databaseService.createError('VALIDATION_ERROR', 'User ID is required');
      }

      const db = databaseService.getDatabase();
      const userRef = ref(db, `${this.collectionPath}/${userId}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        return databaseService.createSuccessResponse(null, 'getUserById');
      }

      const userData = snapshot.val();
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = userData;
      
      databaseService.log('debug', 'User retrieved successfully', { userId });
      return databaseService.createSuccessResponse(userWithoutPassword, 'getUserById');

    } catch (error) {
      return databaseService.handleError(error, 'getUserById', { userId });
    }
  }

  /**
   * Get user by email (alias for getUserById since email is the ID)
   * @param {string} email - User email
   * @returns {Promise<Object>} User data (without password)
   */
  async getUserByEmail(email) {
    return this.getUserById(email);
  }

  /**
   * Get user with password (for authentication purposes)
   * @param {string} email - User email
   * @returns {Promise<Object>} User data with password
   */
  async getUserWithPassword(email) {
    try {
      if (!email) {
        throw databaseService.createError('VALIDATION_ERROR', 'Email is required');
      }

      const db = databaseService.getDatabase();
      const userRef = ref(db, `${this.collectionPath}/${email}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        return databaseService.createSuccessResponse(null, 'getUserWithPassword');
      }

      const userData = snapshot.val();
      databaseService.log('debug', 'User with password retrieved for authentication', { email });
      return databaseService.createSuccessResponse(userData, 'getUserWithPassword');

    } catch (error) {
      return databaseService.handleError(error, 'getUserWithPassword', { email });
    }
  }

  /**
   * Update user data
   * @param {string} userId - User ID (email)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user data (without password)
   */
  async updateUser(userId, updateData) {
    try {
      if (!userId) {
        throw databaseService.createError('VALIDATION_ERROR', 'User ID is required');
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        throw databaseService.createError('VALIDATION_ERROR', 'Update data is required');
      }

      // Check if user exists
      const userResponse = await this.getUserById(userId);
      if (!userResponse.success || !userResponse.data) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'User not found');
      }

      // Prepare update data (exclude sensitive fields that shouldn't be updated directly)
      const allowedFields = ['firstName', 'lastName', 'role', 'isActive', 'lastLogin'];
      const filteredUpdateData = {};
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          filteredUpdateData[key] = value;
        }
      }

      // Add updated timestamp
      filteredUpdateData.updatedAt = Date.now();

      // Update in database
      const db = databaseService.getDatabase();
      const userRef = ref(db, `${this.collectionPath}/${userId}`);
      await update(userRef, filteredUpdateData);

      databaseService.log('info', 'User updated successfully', { userId, updatedFields: Object.keys(filteredUpdateData) });

      // Return updated user data
      const updatedUserResponse = await this.getUserById(userId);
      return updatedUserResponse;

    } catch (error) {
      return databaseService.handleError(error, 'updateUser', { userId });
    }
  }

  /**
   * Delete user (soft delete by setting isActive to false)
   * @param {string} userId - User ID (email)
   * @returns {Promise<Object>} Success response
   */
  async deleteUser(userId) {
    try {
      if (!userId) {
        throw databaseService.createError('VALIDATION_ERROR', 'User ID is required');
      }

      // Check if user exists
      const userResponse = await this.getUserById(userId);
      if (!userResponse.success || !userResponse.data) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'User not found');
      }

      // Soft delete by setting isActive to false
      const updateData = {
        isActive: false,
        deletedAt: Date.now()
      };

      const db = databaseService.getDatabase();
      const userRef = ref(db, `${this.collectionPath}/${userId}`);
      await update(userRef, updateData);

      databaseService.log('info', 'User soft deleted successfully', { userId });
      return databaseService.createSuccessResponse({ deleted: true }, 'deleteUser');

    } catch (error) {
      return databaseService.handleError(error, 'deleteUser', { userId });
    }
  }

  /**
   * Permanently delete user (hard delete)
   * @param {string} userId - User ID (email)
   * @returns {Promise<Object>} Success response
   */
  async permanentlyDeleteUser(userId) {
    try {
      if (!userId) {
        throw databaseService.createError('VALIDATION_ERROR', 'User ID is required');
      }

      // Check if user exists
      const userResponse = await this.getUserById(userId);
      if (!userResponse.success || !userResponse.data) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'User not found');
      }

      // Hard delete from database
      const db = databaseService.getDatabase();
      const userRef = ref(db, `${this.collectionPath}/${userId}`);
      await remove(userRef);

      databaseService.log('warn', 'User permanently deleted', { userId });
      return databaseService.createSuccessResponse({ deleted: true, permanent: true }, 'permanentlyDeleteUser');

    } catch (error) {
      return databaseService.handleError(error, 'permanentlyDeleteUser', { userId });
    }
  }

  /**
   * Validate user credentials for authentication
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} Validation result with user data
   */
  async validateUserCredentials(email, password) {
    try {
      if (!email || !password) {
        throw databaseService.createError('VALIDATION_ERROR', 'Email and password are required');
      }

      // Get user with password
      const userResponse = await this.getUserWithPassword(email);
      if (!userResponse.success || !userResponse.data) {
        throw databaseService.createError('AUTHENTICATION_ERROR', 'Invalid credentials');
      }

      const user = userResponse.data;

      // Check if user is active
      if (!user.isActive) {
        throw databaseService.createError('AUTHENTICATION_ERROR', 'Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw databaseService.createError('AUTHENTICATION_ERROR', 'Invalid credentials');
      }

      databaseService.log('info', 'User credentials validated successfully', { email });

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      return databaseService.createSuccessResponse(userWithoutPassword, 'validateUserCredentials');

    } catch (error) {
      return databaseService.handleError(error, 'validateUserCredentials', { email });
    }
  }

  /**
   * Update user's last login timestamp
   * @param {string} userId - User ID (email)
   * @returns {Promise<Object>} Success response
   */
  async updateLastLogin(userId) {
    try {
      if (!userId) {
        throw databaseService.createError('VALIDATION_ERROR', 'User ID is required');
      }

      const updateData = {
        lastLogin: Date.now()
      };

      const db = databaseService.getDatabase();
      const userRef = ref(db, `${this.collectionPath}/${userId}`);
      await update(userRef, updateData);

      databaseService.log('debug', 'User last login updated', { userId });
      return databaseService.createSuccessResponse({ updated: true }, 'updateLastLogin');

    } catch (error) {
      return databaseService.handleError(error, 'updateLastLogin', { userId });
    }
  }

  /**
   * Check if user has specific role
   * @param {string} userId - User ID (email)
   * @param {string} requiredRole - Required role to check
   * @returns {Promise<Object>} Role check result
   */
  async checkUserRole(userId, requiredRole) {
    try {
      if (!userId || !requiredRole) {
        throw databaseService.createError('VALIDATION_ERROR', 'User ID and required role are required');
      }

      const userResponse = await this.getUserById(userId);
      if (!userResponse.success || !userResponse.data) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'User not found');
      }

      const user = userResponse.data;
      const hasRole = user.role === requiredRole;

      databaseService.log('debug', 'User role checked', { userId, requiredRole, hasRole });
      return databaseService.createSuccessResponse({ hasRole, userRole: user.role }, 'checkUserRole');

    } catch (error) {
      return databaseService.handleError(error, 'checkUserRole', { userId, requiredRole });
    }
  }

  /**
   * Check if user has admin permissions
   * @param {string} userId - User ID (email)
   * @returns {Promise<Object>} Admin permission check result
   */
  async checkAdminPermissions(userId) {
    return this.checkUserRole(userId, 'admin');
  }

  /**
   * Update user password
   * @param {string} userId - User ID (email)
   * @param {string} currentPassword - Current password for verification
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Success response
   */
  async updatePassword(userId, currentPassword, newPassword) {
    try {
      if (!userId || !currentPassword || !newPassword) {
        throw databaseService.createError('VALIDATION_ERROR', 'User ID, current password, and new password are required');
      }

      // Validate current password
      const validationResponse = await this.validateUserCredentials(userId, currentPassword);
      if (!validationResponse.success) {
        throw databaseService.createError('AUTHENTICATION_ERROR', 'Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password in database
      const updateData = {
        password: hashedNewPassword,
        updatedAt: Date.now()
      };

      const db = databaseService.getDatabase();
      const userRef = ref(db, `${this.collectionPath}/${userId}`);
      await update(userRef, updateData);

      databaseService.log('info', 'User password updated successfully', { userId });
      return databaseService.createSuccessResponse({ updated: true }, 'updatePassword');

    } catch (error) {
      return databaseService.handleError(error, 'updatePassword', { userId });
    }
  }

  /**
   * Get all users (admin function with pagination)
   * @param {Object} options - Query options
   * @param {number} [options.limit=50] - Number of users to return
   * @param {string} [options.startAfter] - Start after this user ID for pagination
   * @param {boolean} [options.includeInactive=false] - Include inactive users
   * @returns {Promise<Object>} List of users
   */
  async getAllUsers(options = {}) {
    try {
      const { limit = 50, startAfter = null, includeInactive = false } = options;

      const db = databaseService.getDatabase();
      const usersRef = ref(db, this.collectionPath);
      const snapshot = await get(usersRef);

      if (!snapshot.exists()) {
        return databaseService.createSuccessResponse([], 'getAllUsers');
      }

      const allUsers = snapshot.val();
      let users = Object.values(allUsers);

      // Filter inactive users if not requested
      if (!includeInactive) {
        users = users.filter(user => user.isActive !== false);
      }

      // Remove passwords from all users
      users = users.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      // Sort by creation date
      users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      // Handle pagination
      if (startAfter) {
        const startIndex = users.findIndex(user => user.email === startAfter);
        if (startIndex !== -1) {
          users = users.slice(startIndex + 1);
        }
      }

      // Apply limit
      const paginatedUsers = users.slice(0, limit);
      const hasMore = users.length > limit;

      databaseService.log('debug', 'Users retrieved successfully', { 
        count: paginatedUsers.length, 
        hasMore,
        includeInactive 
      });

      return databaseService.createSuccessResponse({
        users: paginatedUsers,
        hasMore,
        nextStartAfter: hasMore ? paginatedUsers[paginatedUsers.length - 1].email : null
      }, 'getAllUsers');

    } catch (error) {
      return databaseService.handleError(error, 'getAllUsers', options);
    }
  }
}

// Export singleton instance
const userService = new UserService();

module.exports = userService;