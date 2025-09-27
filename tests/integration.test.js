'use strict';

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Import the app components
const requestLogger = require('../middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('../middleware/errorHandler');
const authRoutes = require('../routes/auth');
const productRoutes = require('../routes/products');
const orderRoutes = require('../routes/orders');

// Mock services
jest.mock('../services/userService');
jest.mock('../services/productService');
jest.mock('../services/orderService');
jest.mock('stripe', () => {
  const mockStripe = {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn()
    }
  };
  return jest.fn(() => mockStripe);
});

const userService = require('../services/userService');
const productService = require('../services/productService');
const orderService = require('../services/orderService');

// Get the mocked stripe instance
const stripe = require('stripe')('test-key');

describe('API Integration Tests', () => {
  let app;
  let authToken;
  let adminToken;
  const testUser = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user'
  };
  const testAdmin = {
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  };

  beforeAll(() => {
    // Set up test environment
    process.env.JWT_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';
    
    // Create JWT tokens for testing
    authToken = jwt.sign({ userId: testUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    adminToken = jwt.sign({ userId: testAdmin.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(() => {
    // Create Express app for each test
    app = express();
    
    // Setup middleware
    app.use(requestLogger);
    app.use(express.json());
    
    // Setup routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    
    // Error handlers
    app.use('/api/*', notFoundHandler);
    app.use(errorHandler);
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default admin permissions mock
    userService.checkAdminPermissions.mockResolvedValue({
      success: true,
      data: { hasRole: true, userRole: 'admin' }
    });
  });

  describe('Authentication Flow Integration Tests', () => {
    describe('POST /api/auth/register', () => {
      test('should successfully register a new user', async () => {
        const userData = {
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User'
        };

        userService.createUser.mockResolvedValue({
          success: true,
          data: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'user',
            createdAt: Date.now()
          }
        });

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.user.email).toBe(userData.email);
        expect(userService.createUser).toHaveBeenCalledWith({
          email: userData.email.toLowerCase(),
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'user'
        });
      });

      test('should handle validation errors', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'invalid-email',
            password: '123', // Too short
            firstName: '',
            lastName: 'User'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
        expect(response.body.error.details).toContain('Invalid email format');
        expect(response.body.error.details).toContain('Password must be at least 6 characters long');
        expect(response.body.error.details).toContain('First name is required');
      });

      test('should handle duplicate user error', async () => {
        userService.createUser.mockResolvedValue({
          success: false,
          error: {
            code: 'DUPLICATE_ERROR',
            message: 'User with this email already exists'
          }
        });

        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'existing@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
          })
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('DUPLICATE_ERROR');
      });
    });

    describe('POST /api/auth/login', () => {
      test('should successfully login with valid credentials', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'password123'
        };

        userService.validateUserCredentials.mockResolvedValue({
          success: true,
          data: testUser
        });
        userService.updateLastLogin.mockResolvedValue({ success: true });

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.user.email).toBe(testUser.email);
        expect(userService.validateUserCredentials).toHaveBeenCalledWith(
          loginData.email.toLowerCase(),
          loginData.password
        );
        expect(userService.updateLastLogin).toHaveBeenCalledWith(testUser.email);
      });

      test('should handle invalid credentials', async () => {
        userService.validateUserCredentials.mockResolvedValue({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Invalid credentials'
          }
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      });

      test('should handle login validation errors', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'invalid-email',
            password: ''
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
        expect(response.body.error.details).toContain('Invalid email format');
        expect(response.body.error.details).toContain('Password is required');
      });
    });

    describe('GET /api/auth/me', () => {
      test('should get user profile with valid token', async () => {
        userService.getUserById.mockResolvedValue({
          success: true,
          data: testUser
        });

        const response = await request(app)
          .get('/api/auth/me')
          .set('x-auth-token', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe(testUser.email);
        expect(userService.getUserById).toHaveBeenCalledWith(testUser.email);
      });

      test('should handle missing token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('NO_TOKEN');
      });

      test('should handle user not found', async () => {
        userService.getUserById.mockResolvedValue({
          success: true,
          data: null
        });

        const response = await request(app)
          .get('/api/auth/me')
          .set('x-auth-token', authToken)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
      });
    });

    describe('PUT /api/auth/profile', () => {
      test('should update user profile successfully', async () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name'
        };

        userService.updateUser.mockResolvedValue({
          success: true,
          data: { ...testUser, ...updateData }
        });

        const response = await request(app)
          .put('/api/auth/profile')
          .set('x-auth-token', authToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.firstName).toBe(updateData.firstName);
        expect(userService.updateUser).toHaveBeenCalledWith(testUser.email, updateData);
      });

      test('should handle profile update validation errors', async () => {
        const response = await request(app)
          .put('/api/auth/profile')
          .set('x-auth-token', authToken)
          .send({
            firstName: '',
            lastName: '   '
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });
  });

  describe('Product CRUD Operations Integration Tests', () => {
    const testProduct = {
      id: 'product-123',
      name: 'Test Product',
      description: 'Test Description',
      price: 29.99,
      category: 'test-category',
      images: ['image1.jpg'],
      inventory: 10,
      createdAt: Date.now(),
      isActive: true
    };

    describe('GET /api/products', () => {
      test('should get all products with default pagination', async () => {
        const mockResponse = {
          success: true,
          data: {
            products: [testProduct],
            pagination: {
              page: 1,
              limit: 12,
              total: 1,
              totalPages: 1
            }
          }
        };

        productService.getAllProducts.mockResolvedValue(mockResponse);

        const response = await request(app)
          .get('/api/products')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(mockResponse.data.products);
        expect(response.body.pagination).toEqual(mockResponse.data.pagination);
        expect(productService.getAllProducts).toHaveBeenCalledWith({
          sortBy: 'createdAt',
          sortOrder: 'desc',
          page: 1,
          limit: 12,
          includeInactive: false
        });
      });

      test('should get products with filtering and pagination', async () => {
        const filters = {
          category: 'electronics',
          search: 'phone',
          minPrice: 100,
          maxPrice: 500,
          page: 2,
          limit: 6,
          sortBy: 'price',
          sortOrder: 'asc'
        };

        productService.getAllProducts.mockResolvedValue({
          success: true,
          data: {
            products: [testProduct],
            pagination: { page: 2, limit: 6, total: 15, totalPages: 3 }
          }
        });

        const response = await request(app)
          .get('/api/products')
          .query(filters)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(productService.getAllProducts).toHaveBeenCalledWith({
          category: filters.category,
          search: filters.search,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          page: filters.page,
          limit: filters.limit,
          includeInactive: false
        });
      });

      test('should handle invalid price filters', async () => {
        const response = await request(app)
          .get('/api/products')
          .query({ minPrice: 'invalid' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid minPrice parameter');
      });

      test('should handle service errors', async () => {
        productService.getAllProducts.mockResolvedValue({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database connection failed'
          }
        });

        const response = await request(app)
          .get('/api/products')
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('DATABASE_ERROR');
      });
    });

    describe('GET /api/products/:id', () => {
      test('should get product by ID', async () => {
        productService.getProductById.mockResolvedValue({
          success: true,
          data: testProduct
        });

        const response = await request(app)
          .get(`/api/products/${testProduct.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(testProduct);
        expect(productService.getProductById).toHaveBeenCalledWith(testProduct.id);
      });

      test('should handle product not found', async () => {
        productService.getProductById.mockResolvedValue({
          success: true,
          data: null
        });

        const response = await request(app)
          .get('/api/products/nonexistent')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Product not found');
      });

      test('should handle empty product ID', async () => {
        const response = await request(app)
          .get('/api/products/ ')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Product ID is required');
      });
    });

    describe('GET /api/products/category/:category', () => {
      test('should get products by category', async () => {
        const category = 'electronics';
        productService.getProductsByCategory.mockResolvedValue({
          success: true,
          data: {
            products: [testProduct],
            pagination: { page: 1, limit: 12, total: 1, totalPages: 1 }
          }
        });

        const response = await request(app)
          .get(`/api/products/category/${category}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual([testProduct]);
        expect(response.body.category).toBe(category);
        expect(productService.getProductsByCategory).toHaveBeenCalledWith(category, {
          category,
          page: 1,
          limit: 12,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
      });

      test('should handle empty category', async () => {
        const response = await request(app)
          .get('/api/products/category/ ')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Category is required');
      });
    });

    describe('GET /api/products/search/:term', () => {
      test('should search products', async () => {
        const searchTerm = 'phone';
        productService.searchProducts.mockResolvedValue({
          success: true,
          data: {
            products: [testProduct],
            pagination: { page: 1, limit: 12, total: 1, totalPages: 1 }
          }
        });

        const response = await request(app)
          .get(`/api/products/search/${searchTerm}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual([testProduct]);
        expect(response.body.searchTerm).toBe(searchTerm);
        expect(productService.searchProducts).toHaveBeenCalledWith(searchTerm, {
          search: searchTerm,
          page: 1,
          limit: 12,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
      });

      test('should handle empty search term', async () => {
        const response = await request(app)
          .get('/api/products/search/ ')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Search term is required');
      });
    });

    describe('POST /api/products', () => {
      test('should create product as admin', async () => {
        const newProduct = {
          name: 'New Product',
          description: 'New Description',
          price: 39.99,
          category: 'new-category',
          images: ['new-image.jpg'],
          inventory: 5
        };

        // Mock admin user lookup
        userService.getUserById.mockResolvedValue({
          success: true,
          data: testAdmin
        });
        userService.checkAdminPermissions.mockResolvedValue({
          success: true,
          data: { hasRole: true, userRole: 'admin' }
        });

        productService.createProduct.mockResolvedValue({
          success: true,
          data: { ...newProduct, id: 'new-product-123', createdAt: Date.now() }
        });

        const response = await request(app)
          .post('/api/products')
          .set('x-auth-token', adminToken)
          .send(newProduct)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(newProduct.name);
        expect(response.body.message).toBe('Product created successfully');
        expect(productService.createProduct).toHaveBeenCalledWith({
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          category: newProduct.category,
          images: newProduct.images,
          inventory: newProduct.inventory,
          supplierVariantId: null
        });
      });

      test('should reject product creation for non-admin user', async () => {
        userService.getUserById.mockResolvedValue({
          success: true,
          data: testUser // Regular user, not admin
        });
        userService.checkAdminPermissions.mockResolvedValue({
          success: true,
          data: { hasRole: false, userRole: 'user' }
        });

        const response = await request(app)
          .post('/api/products')
          .set('x-auth-token', authToken)
          .send({
            name: 'Test Product',
            description: 'Test Description',
            price: 29.99,
            category: 'test'
          })
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
      });

      test('should handle product creation validation errors', async () => {
        userService.getUserById.mockResolvedValue({
          success: true,
          data: testAdmin
        });

        const response = await request(app)
          .post('/api/products')
          .set('x-auth-token', adminToken)
          .send({
            name: '',
            description: 'Test',
            price: -10,
            category: ''
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Product name must be a non-empty string');
      });
    });

    describe('PUT /api/products/:id', () => {
      test('should update product as admin', async () => {
        const updateData = {
          name: 'Updated Product',
          price: 49.99
        };

        userService.getUserById.mockResolvedValue({
          success: true,
          data: testAdmin
        });

        productService.updateProduct.mockResolvedValue({
          success: true,
          data: { ...testProduct, ...updateData }
        });

        const response = await request(app)
          .put(`/api/products/${testProduct.id}`)
          .set('x-auth-token', adminToken)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(updateData.name);
        expect(response.body.message).toBe('Product updated successfully');
        expect(productService.updateProduct).toHaveBeenCalledWith(testProduct.id, updateData);
      });

      test('should handle product not found during update', async () => {
        userService.getUserById.mockResolvedValue({
          success: true,
          data: testAdmin
        });

        productService.updateProduct.mockResolvedValue({
          success: false,
          error: {
            code: 'NOT_FOUND_ERROR',
            message: 'Product not found'
          }
        });

        const response = await request(app)
          .put('/api/products/nonexistent')
          .set('x-auth-token', adminToken)
          .send({ name: 'Updated' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Product not found');
      });
    });

    describe('DELETE /api/products/:id', () => {
      test('should delete product as admin', async () => {
        userService.getUserById.mockResolvedValue({
          success: true,
          data: testAdmin
        });

        productService.deleteProduct.mockResolvedValue({
          success: true
        });

        const response = await request(app)
          .delete(`/api/products/${testProduct.id}`)
          .set('x-auth-token', adminToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Product deleted successfully');
        expect(productService.deleteProduct).toHaveBeenCalledWith(testProduct.id);
      });
    });

    describe('Product Reviews', () => {
      describe('POST /api/products/:id/reviews', () => {
        test('should add product review', async () => {
          const reviewData = {
            rating: 5,
            comment: 'Great product!'
          };

          productService.addProductReview.mockResolvedValue({
            success: true,
            data: {
              ...reviewData,
              userId: testUser.email,
              createdAt: Date.now()
            }
          });

          const response = await request(app)
            .post(`/api/products/${testProduct.id}/reviews`)
            .set('x-auth-token', authToken)
            .send(reviewData)
            .expect(201);

          expect(response.body.success).toBe(true);
          expect(response.body.message).toBe('Review added successfully');
          expect(productService.addProductReview).toHaveBeenCalledWith(testProduct.id, {
            userId: testUser.email,
            rating: reviewData.rating,
            comment: reviewData.comment
          });
        });

        test('should handle invalid rating', async () => {
          const response = await request(app)
            .post(`/api/products/${testProduct.id}/reviews`)
            .set('x-auth-token', authToken)
            .send({
              rating: 6, // Invalid rating
              comment: 'Test'
            })
            .expect(400);

          expect(response.body.success).toBe(false);
          expect(response.body.message).toBe('Rating must be a number between 1 and 5');
        });
      });

      describe('GET /api/products/:id/reviews', () => {
        test('should get product reviews', async () => {
          const mockReviews = [
            {
              userId: testUser.email,
              rating: 5,
              comment: 'Great!',
              createdAt: Date.now()
            }
          ];

          productService.getProductReviews.mockResolvedValue({
            success: true,
            data: mockReviews
          });

          const response = await request(app)
            .get(`/api/products/${testProduct.id}/reviews`)
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.data).toEqual(mockReviews);
          expect(productService.getProductReviews).toHaveBeenCalledWith(testProduct.id, {
            limit: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          });
        });
      });

      describe('DELETE /api/products/:id/reviews', () => {
        test('should remove user review', async () => {
          productService.removeProductReview.mockResolvedValue({
            success: true,
            data: { message: 'Review removed' }
          });

          const response = await request(app)
            .delete(`/api/products/${testProduct.id}/reviews`)
            .set('x-auth-token', authToken)
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.message).toBe('Review removed successfully');
          expect(productService.removeProductReview).toHaveBeenCalledWith(testProduct.id, testUser.email);
        });
      });
    });
  });

  describe('Order Creation and Management Integration Tests', () => {
    const testOrder = {
      id: 'order-123',
      userId: testUser.email,
      items: [
        {
          productId: 'product-123',
          quantity: 2,
          price: 29.99,
          name: 'Test Product'
        }
      ],
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US'
      },
      billingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US'
      },
      paymentInfo: {
        method: 'stripe',
        transactionId: 'pi_test123',
        status: 'completed'
      },
      subtotal: 59.98,
      total: 59.98,
      status: 'pending',
      createdAt: Date.now()
    };

    describe('POST /api/orders/create-payment-intent', () => {
      test('should create payment intent successfully', async () => {
        const mockPaymentIntent = {
          id: 'pi_test123',
          client_secret: 'pi_test123_secret_test',
          amount: 5998,
          status: 'requires_payment_method'
        };

        stripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

        const response = await request(app)
          .post('/api/orders/create-payment-intent')
          .set('x-auth-token', authToken)
          .send({
            amount: 59.98,
            currency: 'usd'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.clientSecret).toBe(mockPaymentIntent.client_secret);
        expect(response.body.data.paymentIntentId).toBe(mockPaymentIntent.id);
        expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
          amount: 5998,
          currency: 'usd',
          metadata: {
            userId: testUser.email,
            createdAt: expect.any(String)
          },
          automatic_payment_methods: {
            enabled: true
          }
        });
      });

      test('should handle invalid amount', async () => {
        const response = await request(app)
          .post('/api/orders/create-payment-intent')
          .set('x-auth-token', authToken)
          .send({
            amount: -10
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Amount must be a positive number');
      });

      test('should handle Stripe errors', async () => {
        const stripeError = new Error('Your card was declined');
        stripeError.type = 'card_error';
        stripeError.code = 'card_declined';
        
        stripe.paymentIntents.create.mockRejectedValue(stripeError);

        const response = await request(app)
          .post('/api/orders/create-payment-intent')
          .set('x-auth-token', authToken)
          .send({
            amount: 59.98
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('PAYMENT_INTENT_CREATION_FAILED');
      });
    });

    describe('POST /api/orders', () => {
      test('should create order successfully', async () => {
        const orderData = {
          items: testOrder.items,
          shippingAddress: testOrder.shippingAddress,
          billingAddress: testOrder.billingAddress,
          paymentMethod: 'stripe',
          paymentIntentId: 'pi_test123'
        };

        // Mock successful payment verification
        stripe.paymentIntents.retrieve.mockResolvedValue({
          id: 'pi_test123',
          status: 'succeeded',
          amount: 5998
        });

        orderService.createOrder.mockResolvedValue({
          success: true,
          data: testOrder
        });

        const response = await request(app)
          .post('/api/orders')
          .set('x-auth-token', authToken)
          .send(orderData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testOrder.id);
        expect(response.body.data.status).toBe(testOrder.status);
        expect(response.body.message).toBe('Order created successfully');
        
        expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_test123');
        expect(orderService.createOrder).toHaveBeenCalledWith({
          userId: testUser.email,
          items: orderData.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            name: item.name || '',
            image: item.image || null
          })),
          shippingAddress: orderData.shippingAddress,
          billingAddress: orderData.billingAddress,
          paymentInfo: {
            method: 'stripe',
            transactionId: 'pi_test123',
            status: 'completed'
          },
          subtotal: 59.98,
          total: 59.98,
          status: 'pending'
        });
      });

      test('should handle missing required fields', async () => {
        const response = await request(app)
          .post('/api/orders')
          .set('x-auth-token', authToken)
          .send({
            items: [],
            shippingAddress: testOrder.shippingAddress
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Items are required and must be a non-empty array');
      });

      test('should handle payment verification failure', async () => {
        const stripeError = new Error('No such payment_intent');
        stripeError.type = 'invalid_request_error';
        stripeError.code = 'resource_missing';
        
        stripe.paymentIntents.retrieve.mockRejectedValue(stripeError);

        const response = await request(app)
          .post('/api/orders')
          .set('x-auth-token', authToken)
          .send({
            items: testOrder.items,
            shippingAddress: testOrder.shippingAddress,
            billingAddress: testOrder.billingAddress,
            paymentIntentId: 'invalid_pi'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid payment intent ID');
        expect(response.body.error.code).toBe('PAYMENT_VERIFICATION_FAILED');
      });

      test('should handle unsuccessful payment', async () => {
        stripe.paymentIntents.retrieve.mockResolvedValue({
          id: 'pi_test123',
          status: 'requires_payment_method',
          amount: 5998
        });

        const response = await request(app)
          .post('/api/orders')
          .set('x-auth-token', authToken)
          .send({
            items: testOrder.items,
            shippingAddress: testOrder.shippingAddress,
            billingAddress: testOrder.billingAddress,
            paymentIntentId: 'pi_test123'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Payment not successful');
        expect(response.body.paymentStatus).toBe('requires_payment_method');
      });

      test('should handle order service errors', async () => {
        stripe.paymentIntents.retrieve.mockResolvedValue({
          id: 'pi_test123',
          status: 'succeeded',
          amount: 5998
        });

        orderService.createOrder.mockResolvedValue({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to save order'
          }
        });

        const response = await request(app)
          .post('/api/orders')
          .set('x-auth-token', authToken)
          .send({
            items: testOrder.items,
            shippingAddress: testOrder.shippingAddress,
            billingAddress: testOrder.billingAddress,
            paymentIntentId: 'pi_test123'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('DATABASE_ERROR');
      });
    });

    describe('GET /api/orders', () => {
      test('should get user orders with pagination', async () => {
        const mockOrdersResponse = {
          success: true,
          data: {
            orders: [testOrder],
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              totalPages: 1
            }
          }
        };

        orderService.getOrdersByUser.mockResolvedValue(mockOrdersResponse);

        const response = await request(app)
          .get('/api/orders')
          .set('x-auth-token', authToken)
          .query({
            page: 1,
            limit: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(mockOrdersResponse.data.orders);
        expect(response.body.pagination).toEqual(mockOrdersResponse.data.pagination);
        expect(orderService.getOrdersByUser).toHaveBeenCalledWith(testUser.email, {
          status: undefined,
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
      });

      test('should handle invalid pagination parameters', async () => {
        const response = await request(app)
          .get('/api/orders')
          .set('x-auth-token', authToken)
          .query({
            page: 0,
            limit: 150
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Page must be a positive number');
      });

      test('should filter orders by status', async () => {
        orderService.getOrdersByUser.mockResolvedValue({
          success: true,
          data: {
            orders: [testOrder],
            pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
          }
        });

        const response = await request(app)
          .get('/api/orders')
          .set('x-auth-token', authToken)
          .query({ status: 'pending' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(orderService.getOrdersByUser).toHaveBeenCalledWith(testUser.email, {
          status: 'pending',
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
      });
    });

    describe('GET /api/orders/:id', () => {
      test('should get order by ID', async () => {
        orderService.getOrderById.mockResolvedValue({
          success: true,
          data: testOrder
        });

        const response = await request(app)
          .get(`/api/orders/${testOrder.id}`)
          .set('x-auth-token', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(testOrder);
        expect(orderService.getOrderById).toHaveBeenCalledWith(testOrder.id);
      });

      test('should handle order not found', async () => {
        orderService.getOrderById.mockResolvedValue({
          success: true,
          data: null
        });

        const response = await request(app)
          .get('/api/orders/nonexistent')
          .set('x-auth-token', authToken)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Order not found');
      });

      test('should prevent access to other user orders', async () => {
        const otherUserOrder = {
          ...testOrder,
          userId: 'other@example.com'
        };

        orderService.getOrderById.mockResolvedValue({
          success: true,
          data: otherUserOrder
        });

        const response = await request(app)
          .get(`/api/orders/${testOrder.id}`)
          .set('x-auth-token', authToken)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('UNAUTHORIZED_ORDER_ACCESS');
        expect(response.body.message).toContain('Access denied');
      });
    });

    describe('PUT /api/orders/:id/status', () => {
      beforeEach(() => {
        // Mock valid statuses
        orderService.getValidStatuses.mockReturnValue([
          'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
        ]);
      });

      test('should update order status', async () => {
        orderService.getOrderById.mockResolvedValue({
          success: true,
          data: testOrder
        });

        orderService.updateOrderStatus.mockResolvedValue({
          success: true,
          data: { ...testOrder, status: 'processing' }
        });

        const response = await request(app)
          .put(`/api/orders/${testOrder.id}/status`)
          .set('x-auth-token', authToken)
          .send({ status: 'processing' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('processing');
        expect(response.body.message).toBe('Order status updated successfully');
        expect(orderService.updateOrderStatus).toHaveBeenCalledWith(testOrder.id, 'processing');
      });

      test('should handle invalid status', async () => {
        const response = await request(app)
          .put(`/api/orders/${testOrder.id}/status`)
          .set('x-auth-token', authToken)
          .send({ status: 'invalid_status' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid status');
      });

      test('should prevent updating other user orders', async () => {
        const otherUserOrder = {
          ...testOrder,
          userId: 'other@example.com'
        };

        orderService.getOrderById.mockResolvedValue({
          success: true,
          data: otherUserOrder
        });

        const response = await request(app)
          .put(`/api/orders/${testOrder.id}/status`)
          .set('x-auth-token', authToken)
          .send({ status: 'processing' })
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('UNAUTHORIZED_ORDER_UPDATE');
      });

      test('should handle order not found during status update', async () => {
        orderService.getOrderById.mockResolvedValue({
          success: true,
          data: null
        });

        const response = await request(app)
          .put('/api/orders/nonexistent/status')
          .set('x-auth-token', authToken)
          .send({ status: 'processing' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Order not found');
      });
    });
  });

  describe('Error Handling Scenarios Integration Tests', () => {
    describe('Authentication Errors', () => {
      test('should handle invalid JWT token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('x-auth-token', 'invalid-token')
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_TOKEN');
      });

      test('should handle expired JWT token', async () => {
        const expiredToken = jwt.sign(
          { userId: testUser.email },
          process.env.JWT_SECRET,
          { expiresIn: '-1h' }
        );

        const response = await request(app)
          .get('/api/auth/me')
          .set('x-auth-token', expiredToken)
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('TOKEN_EXPIRED');
      });

      test('should handle malformed authorization header', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'InvalidFormat')
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('NO_TOKEN');
      });
    });

    describe('Service Layer Errors', () => {
      test('should handle database connection errors', async () => {
        userService.validateUserCredentials.mockRejectedValue(
          new Error('Database connection failed')
        );

        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          })
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INTERNAL_ERROR');
        expect(response.body.error.message).toBe('Login failed');
      });

      test('should handle product service timeout', async () => {
        productService.getAllProducts.mockRejectedValue(
          new Error('Request timeout')
        );

        const response = await request(app)
          .get('/api/products')
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('FETCH_PRODUCTS_ERROR');
      });

      test('should handle order service validation errors', async () => {
        stripe.paymentIntents.retrieve.mockResolvedValue({
          id: 'pi_test123',
          status: 'succeeded',
          amount: 5998
        });

        orderService.createOrder.mockRejectedValue(
          new Error('Invalid order data')
        );

        const response = await request(app)
          .post('/api/orders')
          .set('x-auth-token', authToken)
          .send({
            items: testOrder.items,
            shippingAddress: testOrder.shippingAddress,
            billingAddress: testOrder.billingAddress,
            paymentIntentId: 'pi_test123'
          })
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('CREATE_ORDER_ERROR');
      });
    });

    describe('Input Validation Errors', () => {
      test('should handle malformed JSON in request body', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .set('Content-Type', 'application/json')
          .send('{"invalid": json}')
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      test('should handle missing Content-Type header', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send('email=test@example.com&password=123456')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      test('should handle oversized request payload', async () => {
        const largePayload = {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          description: 'x'.repeat(15 * 1024 * 1024) // 15MB payload
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(largePayload)
          .expect(413);

        expect(response.body.success).toBe(false);
      });
    });

    describe('Rate Limiting and Security', () => {
      test('should handle SQL injection attempts in search', async () => {
        productService.searchProducts.mockResolvedValue({
          success: true,
          data: {
            products: [],
            pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
          }
        });

        const maliciousQuery = "'; DROP TABLE products; --";
        
        const response = await request(app)
          .get(`/api/products/search/${encodeURIComponent(maliciousQuery)}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(productService.searchProducts).toHaveBeenCalledWith(maliciousQuery, expect.any(Object));
      });

      test('should handle XSS attempts in product creation', async () => {
        userService.getUserById.mockResolvedValue({
          success: true,
          data: testAdmin
        });

        const xssPayload = {
          name: '<script>alert("xss")</script>',
          description: '<img src="x" onerror="alert(1)">',
          price: 29.99,
          category: 'test'
        };

        productService.createProduct.mockResolvedValue({
          success: true,
          data: { ...xssPayload, id: 'product-123', createdAt: Date.now() }
        });

        const response = await request(app)
          .post('/api/products')
          .set('x-auth-token', adminToken)
          .send(xssPayload)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(productService.createProduct).toHaveBeenCalledWith({
          name: xssPayload.name,
          description: xssPayload.description,
          price: xssPayload.price,
          category: xssPayload.category,
          images: [],
          inventory: 0,
          supplierVariantId: null
        });
      });
    });

    describe('404 Not Found Errors', () => {
      test('should handle non-existent API endpoints', async () => {
        const response = await request(app)
          .get('/api/nonexistent')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('NOT_FOUND');
        expect(response.body.error.message).toBe('The requested endpoint does not exist');
      });

      test('should handle non-existent nested endpoints', async () => {
        const response = await request(app)
          .get('/api/products/123/nonexistent')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });

    describe('Method Not Allowed Errors', () => {
      test('should handle unsupported HTTP methods', async () => {
        const response = await request(app)
          .patch('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });

    describe('CORS and Headers', () => {
      test('should include CORS headers in responses', async () => {
        productService.getAllProducts.mockResolvedValue({
          success: true,
          data: {
            products: [],
            pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
          }
        });

        const response = await request(app)
          .get('/api/products')
          .expect(200);

        expect(response.headers['access-control-allow-origin']).toBeDefined();
      });

      test('should handle preflight OPTIONS requests', async () => {
        const response = await request(app)
          .options('/api/products')
          .set('Origin', 'http://localhost:3000')
          .set('Access-Control-Request-Method', 'POST')
          .set('Access-Control-Request-Headers', 'Content-Type,Authorization')
          .expect(204);

        expect(response.headers['access-control-allow-methods']).toBeDefined();
        expect(response.headers['access-control-allow-headers']).toBeDefined();
      });
    });

    describe('Request Context and Logging', () => {
      test('should include request ID in error responses', async () => {
        userService.validateUserCredentials.mockRejectedValue(
          new Error('Database error')
        );

        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          })
          .expect(500);

        expect(response.body.error.requestId).toBeDefined();
        expect(response.body.error.timestamp).toBeDefined();
      });

      test('should handle requests with custom headers', async () => {
        productService.getAllProducts.mockResolvedValue({
          success: true,
          data: {
            products: [],
            pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
          }
        });

        const response = await request(app)
          .get('/api/products')
          .set('X-Custom-Header', 'test-value')
          .set('User-Agent', 'Test-Agent/1.0')
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('End-to-End Workflow Tests', () => {
    test('should complete full user registration and product purchase flow', async () => {
      // Step 1: Register user
      userService.createUser.mockResolvedValue({
        success: true,
        data: {
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
          role: 'user',
          createdAt: Date.now()
        }
      });

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User'
        })
        .expect(201);

      const userToken = registerResponse.body.data.token;

      // Step 2: Browse products
      productService.getAllProducts.mockResolvedValue({
        success: true,
        data: {
          products: [testProduct],
          pagination: { page: 1, limit: 12, total: 1, totalPages: 1 }
        }
      });

      await request(app)
        .get('/api/products')
        .expect(200);

      // Step 3: Create payment intent
      stripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_workflow_test',
        client_secret: 'pi_workflow_test_secret',
        amount: 2999,
        status: 'requires_payment_method'
      });

      const paymentResponse = await request(app)
        .post('/api/orders/create-payment-intent')
        .set('x-auth-token', userToken)
        .send({ amount: 29.99 })
        .expect(200);

      // Step 4: Create order
      stripe.paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_workflow_test',
        status: 'succeeded',
        amount: 2999
      });

      orderService.createOrder.mockResolvedValue({
        success: true,
        data: {
          id: 'order_workflow_test',
          status: 'pending',
          total: 29.99
        }
      });

      const orderResponse = await request(app)
        .post('/api/orders')
        .set('x-auth-token', userToken)
        .send({
          items: [{
            productId: testProduct.id,
            quantity: 1,
            price: 29.99,
            name: testProduct.name
          }],
          shippingAddress: testOrder.shippingAddress,
          billingAddress: testOrder.billingAddress,
          paymentIntentId: 'pi_workflow_test'
        })
        .expect(201);

      // Step 5: Check order status
      orderService.getOrderById.mockResolvedValue({
        success: true,
        data: {
          id: 'order_workflow_test',
          userId: 'newuser@example.com',
          status: 'pending',
          total: 29.99
        }
      });

      await request(app)
        .get('/api/orders/order_workflow_test')
        .set('x-auth-token', userToken)
        .expect(200);

      // Verify all steps completed successfully
      expect(registerResponse.body.success).toBe(true);
      expect(paymentResponse.body.success).toBe(true);
      expect(orderResponse.body.success).toBe(true);
    });

    test('should handle admin product management workflow', async () => {
      // Mock admin user
      userService.getUserById.mockResolvedValue({
        success: true,
        data: testAdmin
      });

      // Step 1: Create product
      productService.createProduct.mockResolvedValue({
        success: true,
        data: { ...testProduct, id: 'admin_product_123' }
      });

      const createResponse = await request(app)
        .post('/api/products')
        .set('x-auth-token', adminToken)
        .send({
          name: 'Admin Product',
          description: 'Admin Description',
          price: 99.99,
          category: 'admin-category',
          inventory: 50
        })
        .expect(201);

      // Step 2: Update product
      productService.updateProduct.mockResolvedValue({
        success: true,
        data: { ...testProduct, name: 'Updated Admin Product', price: 89.99 }
      });

      const updateResponse = await request(app)
        .put('/api/products/admin_product_123')
        .set('x-auth-token', adminToken)
        .send({
          name: 'Updated Admin Product',
          price: 89.99
        })
        .expect(200);

      // Step 3: Delete product
      productService.deleteProduct.mockResolvedValue({
        success: true
      });

      const deleteResponse = await request(app)
        .delete('/api/products/admin_product_123')
        .set('x-auth-token', adminToken)
        .expect(200);

      // Verify all admin operations completed successfully
      expect(createResponse.body.success).toBe(true);
      expect(updateResponse.body.success).toBe(true);
      expect(deleteResponse.body.success).toBe(true);
    });
  });
});
