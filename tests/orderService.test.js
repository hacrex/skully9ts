'use strict';

const orderService = require('../services/orderService');
const databaseService = require('../services/databaseService');

// Mock Firebase database functions
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  push: jest.fn()
}));

const { ref, get, set, update, remove, push } = require('firebase/database');

// Mock database service
jest.mock('../services/databaseService');

describe('OrderService', () => {
  let mockDatabase;
  let mockOrderRef;
  let mockSnapshot;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDatabase = {};
    mockOrderRef = { key: 'test-order-id' };
    mockSnapshot = {
      exists: jest.fn(),
      val: jest.fn()
    };

    // Setup default mocks
    databaseService.getDatabase.mockReturnValue(mockDatabase);
    databaseService.createError.mockImplementation((code, message) => {
      const error = new Error(message);
      error.code = code;
      return error;
    });
    databaseService.createSuccessResponse.mockImplementation((data, operation) => ({
      success: true,
      data,
      operation
    }));
    databaseService.handleError.mockImplementation((error, operation, context) => ({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        operation,
        context
      }
    }));
    databaseService.log.mockImplementation(() => {});

    ref.mockReturnValue(mockOrderRef);
    push.mockReturnValue(mockOrderRef);
    get.mockResolvedValue(mockSnapshot);
  });

  describe('createOrder', () => {
    const validOrderData = {
      userId: 'test-user@example.com',
      items: [
        {
          productId: 'product-1',
          quantity: 2,
          price: 29.99,
          name: 'Test Product',
          image: 'test-image.jpg'
        }
      ],
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'USA'
      },
      billingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'USA'
      },
      paymentInfo: {
        method: 'credit_card',
        transactionId: 'txn_123456',
        status: 'completed'
      },
      subtotal: 59.98,
      total: 65.98
    };

    it('should create a new order successfully', async () => {
      set.mockResolvedValue();

      const result = await orderService.createOrder(validOrderData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: 'test-order-id',
        userId: 'test-user@example.com',
        items: validOrderData.items,
        subtotal: 59.98,
        total: 65.98,
        status: 'pending',
        isActive: true
      });
      expect(set).toHaveBeenCalledWith(mockOrderRef, expect.objectContaining({
        id: 'test-order-id',
        userId: 'test-user@example.com'
      }));
    });

    it('should validate required fields', async () => {
      const invalidOrderData = { ...validOrderData };
      delete invalidOrderData.userId;

      const result = await orderService.createOrder(invalidOrderData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toContain('Missing required fields');
    });

    it('should validate items array', async () => {
      const invalidOrderData = { ...validOrderData, items: [] };

      const result = await orderService.createOrder(invalidOrderData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate numeric fields', async () => {
      const invalidOrderData = { ...validOrderData, subtotal: -10 };

      const result = await orderService.createOrder(invalidOrderData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toContain('non-negative number');
    });

    it('should validate order status', async () => {
      const invalidOrderData = { ...validOrderData, status: 'invalid-status' };

      const result = await orderService.createOrder(invalidOrderData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toContain('Invalid status');
    });

    it('should validate item structure', async () => {
      const invalidOrderData = {
        ...validOrderData,
        items: [{ productId: 'product-1' }] // Missing quantity and price
      };

      const result = await orderService.createOrder(invalidOrderData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toContain('missing required fields');
    });
  });

  describe('getOrderById', () => {
    it('should retrieve an order by ID successfully', async () => {
      const mockOrder = {
        id: 'test-order-id',
        userId: 'test-user@example.com',
        total: 65.98
      };

      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue(mockOrder);

      const result = await orderService.getOrderById('test-order-id');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrder);
      expect(ref).toHaveBeenCalledWith(mockDatabase, 'orders/test-order-id');
    });

    it('should return null for non-existent order', async () => {
      mockSnapshot.exists.mockReturnValue(false);

      const result = await orderService.getOrderById('non-existent-id');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should validate order ID parameter', async () => {
      const result = await orderService.getOrderById('');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('getOrdersByUser', () => {
    const mockOrders = {
      'order-1': {
        id: 'order-1',
        userId: 'test-user@example.com',
        total: 65.98,
        status: 'pending',
        createdAt: Date.now() - 1000,
        isActive: true
      },
      'order-2': {
        id: 'order-2',
        userId: 'test-user@example.com',
        total: 45.50,
        status: 'delivered',
        createdAt: Date.now() - 2000,
        isActive: true
      },
      'order-3': {
        id: 'order-3',
        userId: 'other-user@example.com',
        total: 30.00,
        status: 'pending',
        createdAt: Date.now() - 3000,
        isActive: true
      }
    };

    beforeEach(() => {
      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue(mockOrders);
    });

    it('should retrieve orders for a specific user', async () => {
      const result = await orderService.getOrdersByUser('test-user@example.com');

      expect(result.success).toBe(true);
      expect(result.data.orders).toHaveLength(2);
      expect(result.data.orders[0].userId).toBe('test-user@example.com');
      expect(result.data.orders[1].userId).toBe('test-user@example.com');
    });

    it('should filter by status', async () => {
      const result = await orderService.getOrdersByUser('test-user@example.com', {
        status: 'pending'
      });

      expect(result.success).toBe(true);
      expect(result.data.orders).toHaveLength(1);
      expect(result.data.orders[0].status).toBe('pending');
    });

    it('should handle pagination', async () => {
      const result = await orderService.getOrdersByUser('test-user@example.com', {
        page: 1,
        limit: 1
      });

      expect(result.success).toBe(true);
      expect(result.data.orders).toHaveLength(1);
      expect(result.data.pagination).toMatchObject({
        page: 1,
        limit: 1,
        total: 2,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      });
    });

    it('should sort orders correctly', async () => {
      const result = await orderService.getOrdersByUser('test-user@example.com', {
        sortBy: 'total',
        sortOrder: 'asc'
      });

      expect(result.success).toBe(true);
      expect(result.data.orders[0].total).toBeLessThan(result.data.orders[1].total);
    });

    it('should validate user ID parameter', async () => {
      const result = await orderService.getOrdersByUser('');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('updateOrder', () => {
    const mockOrder = {
      id: 'test-order-id',
      userId: 'test-user@example.com',
      status: 'pending',
      total: 65.98
    };

    beforeEach(() => {
      // Mock getOrderById to return existing order
      jest.spyOn(orderService, 'getOrderById').mockResolvedValue({
        success: true,
        data: mockOrder
      });
    });

    afterEach(() => {
      orderService.getOrderById.mockRestore();
    });

    it('should update order successfully', async () => {
      update.mockResolvedValue();
      
      // Mock the updated order response
      orderService.getOrderById.mockResolvedValueOnce({
        success: true,
        data: mockOrder
      }).mockResolvedValueOnce({
        success: true,
        data: { ...mockOrder, status: 'processing', updatedAt: Date.now() }
      });

      const result = await orderService.updateOrder('test-order-id', {
        status: 'processing'
      });

      expect(result.success).toBe(true);
      expect(update).toHaveBeenCalledWith(
        mockOrderRef,
        expect.objectContaining({
          status: 'processing',
          updatedAt: expect.any(Number)
        })
      );
    });

    it('should validate order exists', async () => {
      orderService.getOrderById.mockResolvedValue({
        success: true,
        data: null
      });

      const result = await orderService.updateOrder('non-existent-id', {
        status: 'processing'
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('should validate update data', async () => {
      const result = await orderService.updateOrder('test-order-id', {});

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate status values', async () => {
      const result = await orderService.updateOrder('test-order-id', {
        status: 'invalid-status'
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('updateOrderStatus', () => {
    beforeEach(() => {
      jest.spyOn(orderService, 'updateOrder').mockResolvedValue({
        success: true,
        data: { id: 'test-order-id', status: 'processing' }
      });
    });

    afterEach(() => {
      orderService.updateOrder.mockRestore();
    });

    it('should update order status successfully', async () => {
      const result = await orderService.updateOrderStatus('test-order-id', 'processing');

      expect(result.success).toBe(true);
      expect(orderService.updateOrder).toHaveBeenCalledWith('test-order-id', {
        status: 'processing'
      });
    });

    it('should validate parameters', async () => {
      const result = await orderService.updateOrderStatus('', 'processing');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate status value', async () => {
      const result = await orderService.updateOrderStatus('test-order-id', 'invalid-status');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('deleteOrder', () => {
    const mockOrder = {
      id: 'test-order-id',
      userId: 'test-user@example.com'
    };

    beforeEach(() => {
      jest.spyOn(orderService, 'getOrderById').mockResolvedValue({
        success: true,
        data: mockOrder
      });
    });

    afterEach(() => {
      orderService.getOrderById.mockRestore();
    });

    it('should soft delete order successfully', async () => {
      update.mockResolvedValue();

      const result = await orderService.deleteOrder('test-order-id');

      expect(result.success).toBe(true);
      expect(result.data.deleted).toBe(true);
      expect(update).toHaveBeenCalledWith(
        mockOrderRef,
        expect.objectContaining({
          isActive: false,
          deletedAt: expect.any(Number),
          updatedAt: expect.any(Number)
        })
      );
    });

    it('should validate order exists', async () => {
      orderService.getOrderById.mockResolvedValue({
        success: true,
        data: null
      });

      const result = await orderService.deleteOrder('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND_ERROR');
    });
  });

  describe('getOrdersWithPagination', () => {
    const mockOrders = {
      'order-1': {
        id: 'order-1',
        userId: 'user1@example.com',
        status: 'pending',
        total: 65.98,
        createdAt: Date.now() - 1000,
        isActive: true
      },
      'order-2': {
        id: 'order-2',
        userId: 'user2@example.com',
        status: 'delivered',
        total: 45.50,
        createdAt: Date.now() - 2000,
        isActive: true
      }
    };

    beforeEach(() => {
      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue(mockOrders);
    });

    it('should retrieve orders with pagination', async () => {
      const result = await orderService.getOrdersWithPagination({
        page: 1,
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.data.orders).toHaveLength(2);
      expect(result.data.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    });

    it('should filter by user ID', async () => {
      const result = await orderService.getOrdersWithPagination({
        userId: 'user1@example.com'
      });

      expect(result.success).toBe(true);
      expect(result.data.orders).toHaveLength(1);
      expect(result.data.orders[0].userId).toBe('user1@example.com');
    });

    it('should filter by status', async () => {
      const result = await orderService.getOrdersWithPagination({
        status: 'pending'
      });

      expect(result.success).toBe(true);
      expect(result.data.orders).toHaveLength(1);
      expect(result.data.orders[0].status).toBe('pending');
    });
  });

  describe('getOrderStatistics', () => {
    const mockOrders = {
      'order-1': {
        id: 'order-1',
        userId: 'user1@example.com',
        status: 'delivered',
        total: 100.00,
        createdAt: Date.now() - 1000,
        isActive: true
      },
      'order-2': {
        id: 'order-2',
        userId: 'user1@example.com',
        status: 'pending',
        total: 50.00,
        createdAt: Date.now() - 2000,
        isActive: true
      }
    };

    beforeEach(() => {
      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue(mockOrders);
    });

    it('should calculate order statistics', async () => {
      const result = await orderService.getOrderStatistics();

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        totalOrders: 2,
        totalRevenue: 150.00,
        averageOrderValue: 75.00,
        ordersByStatus: expect.objectContaining({
          delivered: 1,
          pending: 1
        }),
        recentOrders: 2
      });
    });

    it('should filter statistics by user', async () => {
      const result = await orderService.getOrderStatistics({
        userId: 'user1@example.com'
      });

      expect(result.success).toBe(true);
      expect(result.data.totalOrders).toBe(2);
    });
  });

  describe('searchOrders', () => {
    const mockOrders = {
      'order-1': {
        id: 'order-1',
        userId: 'user1@example.com',
        paymentInfo: { transactionId: 'txn_123' },
        items: [{ productId: 'product-1' }],
        isActive: true
      },
      'order-2': {
        id: 'order-2',
        userId: 'user2@example.com',
        paymentInfo: { transactionId: 'txn_456' },
        items: [{ productId: 'product-2' }],
        isActive: true
      }
    };

    beforeEach(() => {
      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue(mockOrders);
    });

    it('should search orders by order ID', async () => {
      const result = await orderService.searchOrders({ orderId: 'order-1' });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('order-1');
    });

    it('should search orders by user ID', async () => {
      const result = await orderService.searchOrders({ userId: 'user1@example.com' });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].userId).toBe('user1@example.com');
    });

    it('should search orders by transaction ID', async () => {
      const result = await orderService.searchOrders({ transactionId: 'txn_123' });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].paymentInfo.transactionId).toBe('txn_123');
    });

    it('should search orders by product ID', async () => {
      const result = await orderService.searchOrders({ productId: 'product-1' });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].items[0].productId).toBe('product-1');
    });

    it('should require at least one search criterion', async () => {
      const result = await orderService.searchOrders({});

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('getValidStatuses', () => {
    it('should return array of valid statuses', () => {
      const statuses = orderService.getValidStatuses();

      expect(Array.isArray(statuses)).toBe(true);
      expect(statuses).toContain('pending');
      expect(statuses).toContain('processing');
      expect(statuses).toContain('shipped');
      expect(statuses).toContain('delivered');
      expect(statuses).toContain('cancelled');
      expect(statuses).toContain('refunded');
    });
  });
});