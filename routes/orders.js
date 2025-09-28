const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const orderService = require('../services/orderService');
const logger = require('../utils/logger');

// Initialize Stripe - use lazy initialization to avoid issues in test environment
let stripe;
const getStripe = () => {
  if (!stripe) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'test-key');
  }
  return stripe;
};

// @route   POST api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentIntentId
    } = req.body;

    // Input validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Items are required and must be a non-empty array' 
      });
    }

    if (!shippingAddress || !billingAddress) {
      return res.status(400).json({ 
        success: false,
        message: 'Shipping and billing addresses are required' 
      });
    }

    if (!paymentIntentId) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment intent ID is required' 
      });
    }

    // Verify payment with Stripe
    let paymentIntent;
    try {
      paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    } catch (stripeError) {
      logger.error('Stripe payment verification failed', {
        error: {
          message: stripeError.message,
          type: stripeError.type,
          code: stripeError.code
        },
        paymentIntentId,
        userId: req.user.userId
      }, req);
      
      return res.status(400).json({ 
        success: false,
        message: 'Invalid payment intent ID',
        error: {
          code: 'PAYMENT_VERIFICATION_FAILED',
          message: 'Unable to verify payment with Stripe',
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        success: false,
        message: 'Payment not successful',
        paymentStatus: paymentIntent.status
      });
    }

    // Prepare order data for the service
    const orderData = {
      userId: req.user.userId,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name || '',
        image: item.image || null
      })),
      shippingAddress,
      billingAddress,
      paymentInfo: {
        method: paymentMethod || 'stripe',
        transactionId: paymentIntentId,
        status: 'completed'
      },
      subtotal: paymentIntent.amount / 100,
      total: paymentIntent.amount / 100,
      status: 'pending'
    };

    // Create order using the service
    const result = await orderService.createOrder(orderData);

    if (!result.success) {
      logger.error('Order creation failed', {
        serviceError: result.error,
        userId: req.user.userId,
        orderData: {
          itemCount: items.length,
          total: paymentIntent.amount / 100
        }
      }, req);
      
      return res.status(400).json({
        success: false,
        message: result.error.message || 'Failed to create order',
        error: {
          ...result.error,
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: result.data.id,
        status: result.data.status,
        total: result.data.total
      },
      message: 'Order created successfully'
    });

  } catch (err) {
    logger.error('Order creation error', {
      error: {
        message: err.message,
        stack: err.stack
      },
      userId: req.user?.userId,
      orderData: {
        itemCount: req.body.items?.length,
        paymentIntentId: req.body.paymentIntentId
      }
    }, req);
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating order',
      error: {
        code: 'CREATE_ORDER_ERROR',
        message: 'Failed to create order',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

// @route   GET api/orders
// @desc    Get user's orders with pagination and filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Input validation
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive number'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    // Get user orders with pagination
    const result = await orderService.getOrdersByUser(req.user.userId, {
      status,
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder
    });

    if (!result.success) {
      logger.error('Failed to fetch user orders', {
        serviceError: result.error,
        userId: req.user.userId,
        queryParams: { status, page: pageNum, limit: limitNum, sortBy, sortOrder }
      }, req);
      
      return res.status(500).json({
        success: false,
        message: result.error.message || 'Failed to fetch orders',
        error: {
          ...result.error,
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    res.json({
      success: true,
      data: result.data.orders,
      pagination: result.data.pagination,
      message: 'Orders retrieved successfully'
    });

  } catch (err) {
    logger.error('Error fetching orders', {
      error: {
        message: err.message,
        stack: err.stack
      },
      userId: req.user?.userId,
      queryParams: req.query
    }, req);
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching orders',
      error: {
        code: 'FETCH_ORDERS_ERROR',
        message: 'Failed to retrieve orders',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Get order by ID
    const result = await orderService.getOrderById(orderId);

    if (!result.success) {
      logger.error('Failed to fetch order', {
        serviceError: result.error,
        orderId,
        userId: req.user.userId
      }, req);
      
      return res.status(500).json({
        success: false,
        message: result.error.message || 'Failed to fetch order',
        error: {
          ...result.error,
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify that the order belongs to the authenticated user (security check)
    if (result.data.userId !== req.user.userId) {
      logger.logSecurityEvent('unauthorized_order_access', 'high', {
        orderId,
        orderOwner: result.data.userId,
        attemptedBy: req.user.userId,
        reason: 'User attempted to access order belonging to another user'
      }, req);
      
      return res.status(403).json({
        success: false,
        message: 'Access denied: Order does not belong to authenticated user',
        error: {
          code: 'UNAUTHORIZED_ORDER_ACCESS',
          message: 'You can only access your own orders',
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    res.json({
      success: true,
      data: result.data,
      message: 'Order retrieved successfully'
    });

  } catch (err) {
    logger.error('Error fetching order by ID', {
      error: {
        message: err.message,
        stack: err.stack
      },
      orderId: req.params.id,
      userId: req.user?.userId
    }, req);
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching order',
      error: {
        code: 'FETCH_ORDER_ERROR',
        message: 'Failed to retrieve order',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Validate status
    const validStatuses = orderService.getValidStatuses();
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // First check if order exists and belongs to user
    const orderResult = await orderService.getOrderById(orderId);
    if (!orderResult.success || !orderResult.data) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (orderResult.data.userId !== req.user.userId) {
      logger.logSecurityEvent('unauthorized_order_status_update', 'high', {
        orderId,
        orderOwner: orderResult.data.userId,
        attemptedBy: req.user.userId,
        attemptedStatus: status,
        reason: 'User attempted to update status of order belonging to another user'
      }, req);
      
      return res.status(403).json({
        success: false,
        message: 'Access denied: Order does not belong to authenticated user',
        error: {
          code: 'UNAUTHORIZED_ORDER_UPDATE',
          message: 'You can only update your own orders',
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    // Update order status
    const result = await orderService.updateOrderStatus(orderId, status);

    if (!result.success) {
      logger.error('Failed to update order status', {
        serviceError: result.error,
        orderId,
        userId: req.user.userId,
        attemptedStatus: status
      }, req);
      
      return res.status(400).json({
        success: false,
        message: result.error.message || 'Failed to update order status',
        error: {
          ...result.error,
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

    res.json({
      success: true,
      data: result.data,
      message: 'Order status updated successfully'
    });

  } catch (err) {
    logger.error('Error updating order status', {
      error: {
        message: err.message,
        stack: err.stack
      },
      orderId: req.params.id,
      userId: req.user?.userId,
      attemptedStatus: req.body.status
    }, req);
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status',
      error: {
        code: 'UPDATE_ORDER_STATUS_ERROR',
        message: 'Failed to update order status',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

// @route   POST api/orders/create-payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    // Input validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    if (amount > 999999.99) { // Stripe limit
      return res.status(400).json({
        success: false,
        message: 'Amount exceeds maximum allowed limit'
      });
    }

    try {
      const paymentIntent = await getStripe().paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents and ensure integer
        currency: currency.toLowerCase(),
        metadata: { 
          userId: req.user.userId,
          createdAt: new Date().toISOString()
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        },
        message: 'Payment intent created successfully'
      });

    } catch (stripeError) {
      logger.error('Stripe payment intent creation failed', {
        error: {
          message: stripeError.message,
          type: stripeError.type,
          code: stripeError.code
        },
        userId: req.user.userId,
        amount,
        currency
      }, req);
      
      return res.status(400).json({
        success: false,
        message: 'Failed to create payment intent',
        error: {
          code: 'PAYMENT_INTENT_CREATION_FAILED',
          message: stripeError.message,
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }

  } catch (err) {
    logger.error('Payment intent creation error', {
      error: {
        message: err.message,
        stack: err.stack
      },
      userId: req.user?.userId,
      amount: req.body.amount,
      currency: req.body.currency
    }, req);
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment intent',
      error: {
        code: 'PAYMENT_INTENT_ERROR',
        message: 'Failed to create payment intent',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

module.exports = router;