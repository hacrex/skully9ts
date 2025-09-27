'use strict';

const { ref, get, set, update, remove, push } = require('firebase/database');
const databaseService = require('./databaseService');

/**
 * Order Service for Firebase Realtime Database
 * Provides comprehensive CRUD operations, user-specific querying, and pagination for orders
 */
class OrderService {
  constructor() {
    this.collectionPath = 'orders';
    this.validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data object
   * @param {string} orderData.userId - User ID who placed the order
   * @param {Array} orderData.items - Array of order items
   * @param {Object} orderData.shippingAddress - Shipping address
   * @param {Object} orderData.billingAddress - Billing address
   * @param {Object} orderData.paymentInfo - Payment information
   * @param {number} orderData.subtotal - Order subtotal
   * @param {number} orderData.total - Order total
   * @param {string} [orderData.status='pending'] - Order status
   * @returns {Promise<Object>} Created order data
   */
  async createOrder(orderData) {
    try {
      const { 
        userId, 
        items, 
        shippingAddress, 
        billingAddress, 
        paymentInfo, 
        subtotal, 
        total, 
        status = 'pending' 
      } = orderData;

      // Validate required fields
      if (!userId || !items || !Array.isArray(items) || items.length === 0) {
        throw databaseService.createError(
          'VALIDATION_ERROR',
          'Missing required fields: userId, items (must be non-empty array)'
        );
      }

      if (!shippingAddress || !billingAddress || !paymentInfo) {
        throw databaseService.createError(
          'VALIDATION_ERROR',
          'Missing required fields: shippingAddress, billingAddress, paymentInfo'
        );
      }

      if (subtotal === undefined || total === undefined) {
        throw databaseService.createError(
          'VALIDATION_ERROR',
          'Missing required fields: subtotal, total'
        );
      }

      // Validate numeric fields
      if (typeof subtotal !== 'number' || subtotal < 0) {
        throw databaseService.createError('VALIDATION_ERROR', 'Subtotal must be a non-negative number');
      }

      if (typeof total !== 'number' || total < 0) {
        throw databaseService.createError('VALIDATION_ERROR', 'Total must be a non-negative number');
      }

      // Validate status
      if (!this.validStatuses.includes(status)) {
        throw databaseService.createError(
          'VALIDATION_ERROR', 
          `Invalid status. Must be one of: ${this.validStatuses.join(', ')}`
        );
      }

      // Validate items structure
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.productId || !item.quantity || !item.price) {
          throw databaseService.createError(
            'VALIDATION_ERROR',
            `Item ${i + 1} missing required fields: productId, quantity, price`
          );
        }
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          throw databaseService.createError(
            'VALIDATION_ERROR',
            `Item ${i + 1} quantity must be a positive number`
          );
        }
        if (typeof item.price !== 'number' || item.price < 0) {
          throw databaseService.createError(
            'VALIDATION_ERROR',
            `Item ${i + 1} price must be a non-negative number`
          );
        }
      }

      // Generate unique order ID
      const db = databaseService.getDatabase();
      const ordersRef = ref(db, this.collectionPath);
      const newOrderRef = push(ordersRef);
      const orderId = newOrderRef.key;

      // Prepare order data
      const newOrder = {
        id: orderId,
        userId: userId.toString(),
        items: items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
          name: item.name || '',
          image: item.image || null
        })),
        shippingAddress: {
          street: shippingAddress.street || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          zipCode: shippingAddress.zipCode || '',
          country: shippingAddress.country || ''
        },
        billingAddress: {
          street: billingAddress.street || '',
          city: billingAddress.city || '',
          state: billingAddress.state || '',
          zipCode: billingAddress.zipCode || '',
          country: billingAddress.country || ''
        },
        paymentInfo: {
          method: paymentInfo.method || '',
          transactionId: paymentInfo.transactionId || '',
          status: paymentInfo.status || 'pending'
        },
        subtotal: Number(subtotal),
        total: Number(total),
        status,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true
      };

      // Save to database
      await set(newOrderRef, newOrder);

      databaseService.log('info', 'Order created successfully', { 
        orderId, 
        userId, 
        itemCount: items.length,
        total: newOrder.total 
      });

      return databaseService.createSuccessResponse(newOrder, 'createOrder');

    } catch (error) {
      return databaseService.handleError(error, 'createOrder', { userId: orderData.userId });
    }
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order data
   */
  async getOrderById(orderId) {
    try {
      if (!orderId) {
        throw databaseService.createError('VALIDATION_ERROR', 'Order ID is required');
      }

      const db = databaseService.getDatabase();
      const orderRef = ref(db, `${this.collectionPath}/${orderId}`);
      const snapshot = await get(orderRef);

      if (!snapshot.exists()) {
        return databaseService.createSuccessResponse(null, 'getOrderById');
      }

      const orderData = snapshot.val();
      
      databaseService.log('debug', 'Order retrieved successfully', { orderId });
      return databaseService.createSuccessResponse(orderData, 'getOrderById');

    } catch (error) {
      return databaseService.handleError(error, 'getOrderById', { orderId });
    }
  }

  /**
   * Get orders by user ID with pagination and filtering
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @param {string} [options.status] - Filter by order status
   * @param {string} [options.sortBy='createdAt'] - Sort field
   * @param {string} [options.sortOrder='desc'] - Sort order (asc/desc)
   * @param {number} [options.page=1] - Page number for pagination
   * @param {number} [options.limit=10] - Items per page
   * @param {boolean} [options.includeInactive=false] - Include inactive orders
   * @returns {Promise<Object>} User's orders with pagination
   */
  async getOrdersByUser(userId, options = {}) {
    try {
      if (!userId) {
        throw databaseService.createError('VALIDATION_ERROR', 'User ID is required');
      }

      const {
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10,
        includeInactive = false
      } = options;

      const db = databaseService.getDatabase();
      const ordersRef = ref(db, this.collectionPath);
      const snapshot = await get(ordersRef);

      if (!snapshot.exists()) {
        return databaseService.createSuccessResponse({
          orders: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        }, 'getOrdersByUser');
      }

      const allOrders = snapshot.val();
      let orders = Object.values(allOrders);

      // Filter by user ID
      orders = orders.filter(order => order.userId === userId.toString());

      // Filter inactive orders if not requested
      if (!includeInactive) {
        orders = orders.filter(order => order.isActive !== false);
      }

      // Apply status filter
      if (status) {
        orders = orders.filter(order => order.status === status);
      }

      // Sort orders
      orders.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle undefined values
        if (aValue === undefined) aValue = 0;
        if (bValue === undefined) bValue = 0;

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });

      // Calculate pagination
      const totalOrders = orders.length;
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.max(1, Number(limit));
      const totalPages = Math.ceil(totalOrders / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      // Apply pagination
      const paginatedOrders = orders.slice(startIndex, endIndex);

      const paginationInfo = {
        page: pageNum,
        limit: limitNum,
        total: totalOrders,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      };

      databaseService.log('debug', 'User orders retrieved with pagination', {
        userId,
        totalOrders,
        filteredCount: paginatedOrders.length,
        status,
        pagination: paginationInfo
      });

      return databaseService.createSuccessResponse({
        orders: paginatedOrders,
        pagination: paginationInfo
      }, 'getOrdersByUser');

    } catch (error) {
      return databaseService.handleError(error, 'getOrdersByUser', { userId });
    }
  } 
 /**
   * Update order data
   * @param {string} orderId - Order ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated order data
   */
  async updateOrder(orderId, updateData) {
    try {
      if (!orderId) {
        throw databaseService.createError('VALIDATION_ERROR', 'Order ID is required');
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        throw databaseService.createError('VALIDATION_ERROR', 'Update data is required');
      }

      // Check if order exists
      const orderResponse = await this.getOrderById(orderId);
      if (!orderResponse.success || !orderResponse.data) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'Order not found');
      }

      // Prepare update data (exclude sensitive fields that shouldn't be updated directly)
      const allowedFields = [
        'status', 'shippingAddress', 'billingAddress', 'paymentInfo', 
        'subtotal', 'total', 'isActive', 'items'
      ];
      const filteredUpdateData = {};
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          // Validate specific fields
          if (key === 'status' && !this.validStatuses.includes(value)) {
            throw databaseService.createError(
              'VALIDATION_ERROR', 
              `Invalid status. Must be one of: ${this.validStatuses.join(', ')}`
            );
          }
          if ((key === 'subtotal' || key === 'total') && (typeof value !== 'number' || value < 0)) {
            throw databaseService.createError('VALIDATION_ERROR', `${key} must be a non-negative number`);
          }
          if (key === 'items' && (!Array.isArray(value) || value.length === 0)) {
            throw databaseService.createError('VALIDATION_ERROR', 'Items must be a non-empty array');
          }
          
          filteredUpdateData[key] = value;
        }
      }

      // Add updated timestamp
      filteredUpdateData.updatedAt = Date.now();

      // Update in database
      const db = databaseService.getDatabase();
      const orderRef = ref(db, `${this.collectionPath}/${orderId}`);
      await update(orderRef, filteredUpdateData);

      databaseService.log('info', 'Order updated successfully', { 
        orderId, 
        updatedFields: Object.keys(filteredUpdateData) 
      });

      // Return updated order data
      const updatedOrderResponse = await this.getOrderById(orderId);
      return updatedOrderResponse;

    } catch (error) {
      return databaseService.handleError(error, 'updateOrder', { orderId });
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New order status
   * @returns {Promise<Object>} Updated order data
   */
  async updateOrderStatus(orderId, status) {
    try {
      if (!orderId || !status) {
        throw databaseService.createError('VALIDATION_ERROR', 'Order ID and status are required');
      }

      if (!this.validStatuses.includes(status)) {
        throw databaseService.createError(
          'VALIDATION_ERROR', 
          `Invalid status. Must be one of: ${this.validStatuses.join(', ')}`
        );
      }

      const updateData = { status };
      return this.updateOrder(orderId, updateData);

    } catch (error) {
      return databaseService.handleError(error, 'updateOrderStatus', { orderId, status });
    }
  }

  /**
   * Delete order (soft delete by setting isActive to false)
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Success response
   */
  async deleteOrder(orderId) {
    try {
      if (!orderId) {
        throw databaseService.createError('VALIDATION_ERROR', 'Order ID is required');
      }

      // Check if order exists
      const orderResponse = await this.getOrderById(orderId);
      if (!orderResponse.success || !orderResponse.data) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'Order not found');
      }

      // Soft delete by setting isActive to false
      const updateData = {
        isActive: false,
        deletedAt: Date.now(),
        updatedAt: Date.now()
      };

      const db = databaseService.getDatabase();
      const orderRef = ref(db, `${this.collectionPath}/${orderId}`);
      await update(orderRef, updateData);

      databaseService.log('info', 'Order soft deleted successfully', { orderId });
      return databaseService.createSuccessResponse({ deleted: true }, 'deleteOrder');

    } catch (error) {
      return databaseService.handleError(error, 'deleteOrder', { orderId });
    }
  }

  /**
   * Permanently delete order (hard delete)
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Success response
   */
  async permanentlyDeleteOrder(orderId) {
    try {
      if (!orderId) {
        throw databaseService.createError('VALIDATION_ERROR', 'Order ID is required');
      }

      // Check if order exists
      const orderResponse = await this.getOrderById(orderId);
      if (!orderResponse.success || !orderResponse.data) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'Order not found');
      }

      // Hard delete from database
      const db = databaseService.getDatabase();
      const orderRef = ref(db, `${this.collectionPath}/${orderId}`);
      await remove(orderRef);

      databaseService.log('warn', 'Order permanently deleted', { orderId });
      return databaseService.createSuccessResponse({ deleted: true, permanent: true }, 'permanentlyDeleteOrder');

    } catch (error) {
      return databaseService.handleError(error, 'permanentlyDeleteOrder', { orderId });
    }
  }

  /**
   * Get orders with pagination and filtering (admin function)
   * @param {Object} options - Query options
   * @param {string} [options.userId] - Filter by user ID
   * @param {string} [options.status] - Filter by order status
   * @param {string} [options.sortBy='createdAt'] - Sort field
   * @param {string} [options.sortOrder='desc'] - Sort order (asc/desc)
   * @param {number} [options.page=1] - Page number for pagination
   * @param {number} [options.limit=20] - Items per page
   * @param {boolean} [options.includeInactive=false] - Include inactive orders
   * @returns {Promise<Object>} Filtered and paginated orders
   */
  async getOrdersWithPagination(options = {}) {
    try {
      const {
        userId,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
        includeInactive = false
      } = options;

      const db = databaseService.getDatabase();
      const ordersRef = ref(db, this.collectionPath);
      const snapshot = await get(ordersRef);

      if (!snapshot.exists()) {
        return databaseService.createSuccessResponse({
          orders: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        }, 'getOrdersWithPagination');
      }

      const allOrders = snapshot.val();
      let orders = Object.values(allOrders);

      // Filter inactive orders if not requested
      if (!includeInactive) {
        orders = orders.filter(order => order.isActive !== false);
      }

      // Apply user filter
      if (userId) {
        orders = orders.filter(order => order.userId === userId.toString());
      }

      // Apply status filter
      if (status) {
        orders = orders.filter(order => order.status === status);
      }

      // Sort orders
      orders.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle undefined values
        if (aValue === undefined) aValue = 0;
        if (bValue === undefined) bValue = 0;

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });

      // Calculate pagination
      const totalOrders = orders.length;
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.max(1, Number(limit));
      const totalPages = Math.ceil(totalOrders / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      // Apply pagination
      const paginatedOrders = orders.slice(startIndex, endIndex);

      const paginationInfo = {
        page: pageNum,
        limit: limitNum,
        total: totalOrders,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      };

      databaseService.log('debug', 'Orders retrieved with pagination', {
        totalOrders,
        filteredCount: paginatedOrders.length,
        filters: { userId, status },
        pagination: paginationInfo
      });

      return databaseService.createSuccessResponse({
        orders: paginatedOrders,
        pagination: paginationInfo
      }, 'getOrdersWithPagination');

    } catch (error) {
      return databaseService.handleError(error, 'getOrdersWithPagination', options);
    }
  }

  /**
   * Get order statistics
   * @param {Object} options - Options for statistics
   * @param {string} [options.userId] - Get statistics for specific user
   * @param {number} [options.days=30] - Number of days to include in statistics
   * @returns {Promise<Object>} Order statistics
   */
  async getOrderStatistics(options = {}) {
    try {
      const { userId, days = 30 } = options;

      const db = databaseService.getDatabase();
      const ordersRef = ref(db, this.collectionPath);
      const snapshot = await get(ordersRef);

      if (!snapshot.exists()) {
        return databaseService.createSuccessResponse({
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          ordersByStatus: {},
          recentOrders: 0
        }, 'getOrderStatistics');
      }

      const allOrders = snapshot.val();
      let orders = Object.values(allOrders);

      // Filter by user if specified
      if (userId) {
        orders = orders.filter(order => order.userId === userId.toString());
      }

      // Filter active orders only
      orders = orders.filter(order => order.isActive !== false);

      // Calculate date threshold for recent orders
      const dateThreshold = Date.now() - (days * 24 * 60 * 60 * 1000);
      const recentOrders = orders.filter(order => order.createdAt >= dateThreshold);

      // Calculate statistics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Group orders by status
      const ordersByStatus = {};
      this.validStatuses.forEach(status => {
        ordersByStatus[status] = orders.filter(order => order.status === status).length;
      });

      const statistics = {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        ordersByStatus,
        recentOrders: recentOrders.length,
        period: `${days} days`
      };

      databaseService.log('debug', 'Order statistics calculated', { 
        ...statistics, 
        userId: userId || 'all users' 
      });

      return databaseService.createSuccessResponse(statistics, 'getOrderStatistics');

    } catch (error) {
      return databaseService.handleError(error, 'getOrderStatistics', options);
    }
  }

  /**
   * Search orders by various criteria
   * @param {Object} searchCriteria - Search criteria
   * @param {string} [searchCriteria.orderId] - Search by order ID
   * @param {string} [searchCriteria.userId] - Search by user ID
   * @param {string} [searchCriteria.transactionId] - Search by transaction ID
   * @param {string} [searchCriteria.productId] - Search by product ID in items
   * @param {Object} [options] - Additional options
   * @param {number} [options.limit=50] - Maximum results to return
   * @returns {Promise<Object>} Search results
   */
  async searchOrders(searchCriteria, options = {}) {
    try {
      const { orderId, userId, transactionId, productId } = searchCriteria;
      const { limit = 50 } = options;

      if (!orderId && !userId && !transactionId && !productId) {
        throw databaseService.createError(
          'VALIDATION_ERROR',
          'At least one search criterion is required'
        );
      }

      const db = databaseService.getDatabase();
      const ordersRef = ref(db, this.collectionPath);
      const snapshot = await get(ordersRef);

      if (!snapshot.exists()) {
        return databaseService.createSuccessResponse([], 'searchOrders');
      }

      const allOrders = snapshot.val();
      let orders = Object.values(allOrders);

      // Filter active orders only
      orders = orders.filter(order => order.isActive !== false);

      // Apply search filters
      if (orderId) {
        orders = orders.filter(order => order.id === orderId);
      }

      if (userId) {
        orders = orders.filter(order => order.userId === userId.toString());
      }

      if (transactionId) {
        orders = orders.filter(order => 
          order.paymentInfo && order.paymentInfo.transactionId === transactionId
        );
      }

      if (productId) {
        orders = orders.filter(order => 
          order.items && order.items.some(item => item.productId === productId)
        );
      }

      // Sort by creation date (newest first)
      orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      // Apply limit
      const limitedOrders = orders.slice(0, limit);

      databaseService.log('debug', 'Order search completed', {
        searchCriteria,
        resultsFound: limitedOrders.length,
        totalMatches: orders.length
      });

      return databaseService.createSuccessResponse(limitedOrders, 'searchOrders');

    } catch (error) {
      return databaseService.handleError(error, 'searchOrders', searchCriteria);
    }
  }

  /**
   * Get valid order statuses
   * @returns {Array<string>} Array of valid order statuses
   */
  getValidStatuses() {
    return [...this.validStatuses];
  }
}

// Export singleton instance
const orderService = new OrderService();

module.exports = orderService;