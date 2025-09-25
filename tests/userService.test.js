const userService = require('../services/userService');
const databaseService = require('../services/databaseService');

// Mock Firebase database operations
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  query: jest.fn(),
  orderByChild: jest.fn(),
  equalTo: jest.fn()
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

const { ref, get, set, update, remove } = require('firebase/database');
const bcrypt = require('bcryptjs');

describe('UserService', () => {
  let mockDatabase;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock database instance
    mockDatabase = {
      ref: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      remove: jest.fn()
    };

    // Mock databaseService.getDatabase()
    jest.spyOn(databaseService, 'getDatabase').mockReturnValue(mockDatabase);
    jest.spyOn(databaseService, 'log').mockImplementation(() => {});
    jest.spyOn(databaseService, 'createError').mockImplementation((code, message) => {
      const error = new Error(message);
      error.code = code;
      return error;
    });
    jest.spyOn(databaseService, 'createSuccessResponse').mockImplementation((data, operation) => ({
      success: true,
      data,
      operation,
      timestamp: new Date().toISOString()
    }));
    jest.spyOn(databaseService, 'handleError').mockImplementation((error, operation, context) => ({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        operation,
        context
      }
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createUser', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    beforeEach(() => {
      // Mock bcrypt.hash
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      
      // Mock Firebase operations
      ref.mockReturnValue('mockRef');
      get.mockResolvedValue({ exists: () => false });
      set.mockResolvedValue();
    });

    it('should create a user successfully with valid data', async () => {
      const result = await userService.createUser(validUserData);

      expect(result.success).toBe(true);
      expect(result.data.email).toBe(validUserData.email);
      expect(result.data.firstName).toBe(validUserData.firstName);
      expect(result.data.lastName).toBe(validUserData.lastName);
      expect(result.data.role).toBe('user');
      expect(result.data.isActive).toBe(true);
      expect(result.data.password).toBeUndefined(); // Password should not be in response
      expect(bcrypt.hash).toHaveBeenCalledWith(validUserData.password, 10);
    });

    it('should return error for missing required fields', async () => {
      const incompleteData = { email: 'test@example.com' };
      
      const result = await userService.createUser(incompleteData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toContain('Missing required fields');
    });

    it('should return error for invalid email format', async () => {
      const invalidEmailData = { ...validUserData, email: 'invalid-email' };
      
      const result = await userService.createUser(invalidEmailData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Invalid email format');
    });

    it('should return error if user already exists', async () => {
      // Mock existing user
      get.mockResolvedValue({ 
        exists: () => true,
        val: () => ({ email: validUserData.email })
      });

      const result = await userService.createUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('DUPLICATE_ERROR');
      expect(result.error.message).toBe('User with this email already exists');
    });

    it('should set default role to "user" if not provided', async () => {
      const result = await userService.createUser(validUserData);

      expect(result.success).toBe(true);
      expect(result.data.role).toBe('user');
    });

    it('should accept custom role when provided', async () => {
      const adminUserData = { ...validUserData, role: 'admin' };
      
      const result = await userService.createUser(adminUserData);

      expect(result.success).toBe(true);
      expect(result.data.role).toBe('admin');
    });
  });

  describe('getUserById', () => {
    const userId = 'test@example.com';
    const mockUserData = {
      email: userId,
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      password: 'hashedPassword',
      isActive: true
    };

    beforeEach(() => {
      ref.mockReturnValue('mockRef');
    });

    it('should return user data without password when user exists', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => mockUserData
      });

      const result = await userService.getUserById(userId);

      expect(result.success).toBe(true);
      expect(result.data.email).toBe(userId);
      expect(result.data.firstName).toBe('John');
      expect(result.data.password).toBeUndefined();
    });

    it('should return null when user does not exist', async () => {
      get.mockResolvedValue({ exists: () => false });

      const result = await userService.getUserById(userId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should return error for missing user ID', async () => {
      const result = await userService.getUserById('');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('User ID is required');
    });
  });

  describe('validateUserCredentials', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const mockUserData = {
      email,
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true
    };

    beforeEach(() => {
      ref.mockReturnValue('mockRef');
    });

    it('should validate credentials successfully for valid user', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => mockUserData
      });
      bcrypt.compare.mockResolvedValue(true);

      const result = await userService.validateUserCredentials(email, password);

      expect(result.success).toBe(true);
      expect(result.data.email).toBe(email);
      expect(result.data.password).toBeUndefined();
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUserData.password);
    });

    it('should return error for non-existent user', async () => {
      get.mockResolvedValue({ exists: () => false });

      const result = await userService.validateUserCredentials(email, password);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('AUTHENTICATION_ERROR');
      expect(result.error.message).toBe('Invalid credentials');
    });

    it('should return error for incorrect password', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => mockUserData
      });
      bcrypt.compare.mockResolvedValue(false);

      const result = await userService.validateUserCredentials(email, password);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('AUTHENTICATION_ERROR');
      expect(result.error.message).toBe('Invalid credentials');
    });

    it('should return error for inactive user', async () => {
      const inactiveUser = { ...mockUserData, isActive: false };
      get.mockResolvedValue({
        exists: () => true,
        val: () => inactiveUser
      });

      const result = await userService.validateUserCredentials(email, password);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('AUTHENTICATION_ERROR');
      expect(result.error.message).toBe('Account is deactivated');
    });

    it('should return error for missing credentials', async () => {
      const result = await userService.validateUserCredentials('', password);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Email and password are required');
    });
  });

  describe('updateUser', () => {
    const userId = 'test@example.com';
    const updateData = { firstName: 'Jane', lastName: 'Smith' };

    beforeEach(() => {
      ref.mockReturnValue('mockRef');
      update.mockResolvedValue();
    });

    it('should update user successfully with valid data', async () => {
      // Mock existing user
      get.mockResolvedValueOnce({
        exists: () => true,
        val: () => ({ email: userId, firstName: 'John', lastName: 'Doe' })
      });
      
      // Mock updated user
      get.mockResolvedValueOnce({
        exists: () => true,
        val: () => ({ email: userId, firstName: 'Jane', lastName: 'Smith' })
      });

      const result = await userService.updateUser(userId, updateData);

      expect(result.success).toBe(true);
      expect(update).toHaveBeenCalled();
    });

    it('should return error for non-existent user', async () => {
      get.mockResolvedValue({ exists: () => false });

      const result = await userService.updateUser(userId, updateData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('should return error for missing user ID', async () => {
      const result = await userService.updateUser('', updateData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return error for empty update data', async () => {
      const result = await userService.updateUser(userId, {});

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('deleteUser', () => {
    const userId = 'test@example.com';

    beforeEach(() => {
      ref.mockReturnValue('mockRef');
      update.mockResolvedValue();
    });

    it('should soft delete user successfully', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => ({ email: userId, isActive: true })
      });

      const result = await userService.deleteUser(userId);

      expect(result.success).toBe(true);
      expect(result.data.deleted).toBe(true);
      expect(update).toHaveBeenCalled();
    });

    it('should return error for non-existent user', async () => {
      get.mockResolvedValue({ exists: () => false });

      const result = await userService.deleteUser(userId);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND_ERROR');
    });
  });

  describe('checkUserRole', () => {
    const userId = 'test@example.com';
    const mockUserData = {
      email: userId,
      role: 'admin',
      isActive: true
    };

    beforeEach(() => {
      ref.mockReturnValue('mockRef');
    });

    it('should return true for matching role', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => mockUserData
      });

      const result = await userService.checkUserRole(userId, 'admin');

      expect(result.success).toBe(true);
      expect(result.data.hasRole).toBe(true);
      expect(result.data.userRole).toBe('admin');
    });

    it('should return false for non-matching role', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => mockUserData
      });

      const result = await userService.checkUserRole(userId, 'user');

      expect(result.success).toBe(true);
      expect(result.data.hasRole).toBe(false);
      expect(result.data.userRole).toBe('admin');
    });

    it('should return error for non-existent user', async () => {
      get.mockResolvedValue({ exists: () => false });

      const result = await userService.checkUserRole(userId, 'admin');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND_ERROR');
    });
  });

  describe('checkAdminPermissions', () => {
    const userId = 'test@example.com';

    it('should call checkUserRole with admin role', async () => {
      const spy = jest.spyOn(userService, 'checkUserRole').mockResolvedValue({
        success: true,
        data: { hasRole: true, userRole: 'admin' }
      });

      const result = await userService.checkAdminPermissions(userId);

      expect(spy).toHaveBeenCalledWith(userId, 'admin');
      expect(result.success).toBe(true);
      expect(result.data.hasRole).toBe(true);
    });
  });

  describe('updateLastLogin', () => {
    const userId = 'test@example.com';

    beforeEach(() => {
      ref.mockReturnValue('mockRef');
      update.mockResolvedValue();
    });

    it('should update last login timestamp successfully', async () => {
      const result = await userService.updateLastLogin(userId);

      expect(result.success).toBe(true);
      expect(result.data.updated).toBe(true);
      expect(update).toHaveBeenCalled();
    });

    it('should return error for missing user ID', async () => {
      const result = await userService.updateLastLogin('');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('updatePassword', () => {
    const userId = 'test@example.com';
    const currentPassword = 'oldPassword';
    const newPassword = 'newPassword';

    beforeEach(() => {
      ref.mockReturnValue('mockRef');
      update.mockResolvedValue();
      bcrypt.hash.mockResolvedValue('hashedNewPassword');
    });

    it('should update password successfully with valid current password', async () => {
      // Mock successful credential validation
      jest.spyOn(userService, 'validateUserCredentials').mockResolvedValue({
        success: true,
        data: { email: userId }
      });

      const result = await userService.updatePassword(userId, currentPassword, newPassword);

      expect(result.success).toBe(true);
      expect(result.data.updated).toBe(true);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(update).toHaveBeenCalled();
    });

    it('should return error for incorrect current password', async () => {
      // Mock failed credential validation
      jest.spyOn(userService, 'validateUserCredentials').mockResolvedValue({
        success: false,
        error: { code: 'AUTHENTICATION_ERROR' }
      });

      const result = await userService.updatePassword(userId, currentPassword, newPassword);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return error for missing parameters', async () => {
      const result = await userService.updatePassword('', currentPassword, newPassword);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });
});