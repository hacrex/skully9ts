'use strict';

const productService = require('../services/productService');
const databaseService = require('../services/databaseService');

// Mock Firebase database functions
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  push: jest.fn(),
  query: jest.fn(),
  orderByChild: jest.fn(),
  equalTo: jest.fn()
}));

const { ref, get, set, update, remove, push } = require('firebase/database');

describe('ProductService', () => {
  let mockDatabase;
  let mockSnapshot;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock database instance
    mockDatabase = {};
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
    
    // Mock snapshot
    mockSnapshot = {
      exists: jest.fn(),
      val: jest.fn()
    };
    
    // Mock Firebase functions
    ref.mockReturnValue({});
    get.mockResolvedValue(mockSnapshot);
    set.mockResolvedValue();
    update.mockResolvedValue();
    remove.mockResolvedValue();
    push.mockReturnValue({ key: 'test-product-id' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product successfully with valid data', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        category: 'Electronics',
        images: ['image1.jpg'],
        inventory: 10,
        supplierVariantId: 'SUP123'
      };

      const result = await productService.createProduct(productData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: 'test-product-id',
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        category: 'electronics',
        inventory: 10,
        isActive: true
      });
      expect(set).toHaveBeenCalled();
    });

    it('should fail when required fields are missing', async () => {
      const productData = {
        name: 'Test Product'
        // Missing description, price, category
      };

      const result = await productService.createProduct(productData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toContain('Missing required fields');
    });

    it('should fail when price is invalid', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: -10, // Invalid negative price
        category: 'Electronics'
      };

      const result = await productService.createProduct(productData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toContain('Price must be a non-negative number');
    });

    it('should fail when inventory is invalid', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        category: 'Electronics',
        inventory: -5 // Invalid negative inventory
      };

      const result = await productService.createProduct(productData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toContain('Inventory must be a non-negative number');
    });

    it('should set default values for optional fields', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        category: 'Electronics'
        // No images, inventory, or supplierVariantId
      };

      const result = await productService.createProduct(productData);

      expect(result.success).toBe(true);
      expect(result.data.images).toEqual([]);
      expect(result.data.inventory).toBe(0);
      expect(result.data.supplierVariantId).toBe(null);
    });
  });

  describe('getProductById', () => {
    it('should retrieve a product successfully', async () => {
      const mockProduct = {
        id: 'test-id',
        name: 'Test Product',
        price: 29.99,
        isActive: true
      };

      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue(mockProduct);

      const result = await productService.getProductById('test-id');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
      expect(get).toHaveBeenCalled();
    });

    it('should return null when product does not exist', async () => {
      mockSnapshot.exists.mockReturnValue(false);

      const result = await productService.getProductById('non-existent-id');

      expect(result.success).toBe(true);
      expect(result.data).toBe(null);
    });

    it('should fail when product ID is not provided', async () => {
      const result = await productService.getProductById('');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toContain('Product ID is required');
    });
  });

  describe('getAllProducts', () => {
    const mockProducts = {
      'prod1': {
        id: 'prod1',
        name: 'Product 1',
        description: 'Description 1',
        price: 10.00,
        category: 'electronics',
        createdAt: 1000,
        isActive: true
      },
      'prod2': {
        id: 'prod2',
        name: 'Product 2',
        description: 'Description 2',
        price: 20.00,
        category: 'clothing',
        createdAt: 2000,
        isActive: true
      },
      'prod3': {
        id: 'prod3',
        name: 'Product 3',
        description: 'Description 3',
        price: 30.00,
        category: 'electronics',
        createdAt: 3000,
        isActive: false
      }
    };

    beforeEach(() => {
      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue(mockProducts);
    });

    it('should return all active products by default', async () => {
      const result = await productService.getAllProducts();

      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(2); // Only active products
      expect(result.data.pagination.total).toBe(2);
    });

    it('should filter products by category', async () => {
      const result = await productService.getAllProducts({ category: 'electronics' });

      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(1);
      expect(result.data.products[0].category).toBe('electronics');
    });

    it('should filter products by price range', async () => {
      const result = await productService.getAllProducts({ 
        minPrice: 15, 
        maxPrice: 25 
      });

      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(1);
      expect(result.data.products[0].price).toBe(20.00);
    });

    it('should search products by name', async () => {
      const result = await productService.getAllProducts({ search: 'Product 1' });

      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(1);
      expect(result.data.products[0].name).toBe('Product 1');
    });

    it('should search products by description', async () => {
      const result = await productService.getAllProducts({ search: 'Description 2' });

      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(1);
      expect(result.data.products[0].description).toBe('Description 2');
    });

    it('should sort products correctly', async () => {
      const result = await productService.getAllProducts({ 
        sortBy: 'price', 
        sortOrder: 'asc' 
      });

      expect(result.success).toBe(true);
      expect(result.data.products[0].price).toBe(10.00);
      expect(result.data.products[1].price).toBe(20.00);
    });

    it('should handle pagination correctly', async () => {
      const result = await productService.getAllProducts({ 
        page: 1, 
        limit: 1 
      });

      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(1);
      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.limit).toBe(1);
      expect(result.data.pagination.hasNext).toBe(true);
      expect(result.data.pagination.hasPrev).toBe(false);
    });

    it('should include inactive products when requested', async () => {
      const result = await productService.getAllProducts({ includeInactive: true });

      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(3); // All products including inactive
    });

    it('should return empty array when no products exist', async () => {
      mockSnapshot.exists.mockReturnValue(false);

      const result = await productService.getAllProducts();

      expect(result.success).toBe(true);
      expect(result.data.products).toEqual([]);
      expect(result.data.pagination.total).toBe(0);
    });
  });

  describe('updateProduct', () => {
    const mockProduct = {
      id: 'test-id',
      name: 'Original Product',
      price: 29.99,
      isActive: true
    };

    beforeEach(() => {
      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue(mockProduct);
    });

    it('should update product successfully', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 39.99
      };

      const result = await productService.updateProduct('test-id', updateData);

      expect(result.success).toBe(true);
      expect(update).toHaveBeenCalled();
    });

    it('should fail when product does not exist', async () => {
      mockSnapshot.exists.mockReturnValue(false);

      const result = await productService.updateProduct('non-existent', { name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('should fail when product ID is not provided', async () => {
      const result = await productService.updateProduct('', { name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail when update data is empty', async () => {
      const result = await productService.updateProduct('test-id', {});

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate price updates', async () => {
      const result = await productService.updateProduct('test-id', { price: -10 });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toContain('Price must be a non-negative number');
    });

    it('should validate inventory updates', async () => {
      const result = await productService.updateProduct('test-id', { inventory: -5 });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toContain('Inventory must be a non-negative number');
    });

    it('should normalize category to lowercase', async () => {
      await productService.updateProduct('test-id', { category: 'ELECTRONICS' });

      const updateCall = update.mock.calls[0][1];
      expect(updateCall.category).toBe('electronics');
    });

    it('should trim string fields', async () => {
      await productService.updateProduct('test-id', { 
        name: '  Trimmed Name  ',
        description: '  Trimmed Description  '
      });

      const updateCall = update.mock.calls[0][1];
      expect(updateCall.name).toBe('Trimmed Name');
      expect(updateCall.description).toBe('Trimmed Description');
    });
  });

  describe('deleteProduct', () => {
    const mockProduct = {
      id: 'test-id',
      name: 'Test Product',
      isActive: true
    };

    beforeEach(() => {
      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue(mockProduct);
    });

    it('should soft delete product successfully', async () => {
      const result = await productService.deleteProduct('test-id');

      expect(result.success).toBe(true);
      expect(result.data.deleted).toBe(true);
      expect(update).toHaveBeenCalled();
      
      const updateCall = update.mock.calls[0][1];
      expect(updateCall.isActive).toBe(false);
      expect(updateCall.deletedAt).toBeDefined();
    });

    it('should fail when product does not exist', async () => {
      mockSnapshot.exists.mockReturnValue(false);

      const result = await productService.deleteProduct('non-existent');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('should fail when product ID is not provided', async () => {
      const result = await productService.deleteProduct('');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('addProductReview', () => {
    const mockProduct = {
      id: 'test-id',
      name: 'Test Product',
      reviews: [],
      averageRating: 0,
      reviewCount: 0,
      isActive: true
    };

    beforeEach(() => {
      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue({ ...mockProduct });
    });

    it('should add a new review successfully', async () => {
      const reviewData = {
        userId: 'user123',
        rating: 5,
        comment: 'Great product!'
      };

      const result = await productService.addProductReview('test-id', reviewData);

      expect(result.success).toBe(true);
      expect(update).toHaveBeenCalled();
      
      const updateCall = update.mock.calls[0][1];
      expect(updateCall.reviews).toHaveLength(1);
      expect(updateCall.reviews[0].userId).toBe('user123');
      expect(updateCall.reviews[0].rating).toBe(5);
      expect(updateCall.averageRating).toBe(5);
      expect(updateCall.reviewCount).toBe(1);
    });

    it('should update existing review', async () => {
      const productWithReview = {
        ...mockProduct,
        reviews: [{
          userId: 'user123',
          rating: 3,
          comment: 'OK product',
          createdAt: 1000
        }],
        averageRating: 3,
        reviewCount: 1
      };
      
      mockSnapshot.val.mockReturnValue(productWithReview);

      const reviewData = {
        userId: 'user123',
        rating: 5,
        comment: 'Actually great product!'
      };

      const result = await productService.addProductReview('test-id', reviewData);

      expect(result.success).toBe(true);
      expect(update).toHaveBeenCalled();
      
      const updateCall = update.mock.calls[0][1];
      expect(updateCall.reviews).toHaveLength(1);
      expect(updateCall.reviews[0].rating).toBe(5);
      expect(updateCall.averageRating).toBe(5);
    });

    it('should calculate correct average rating with multiple reviews', async () => {
      const productWithReviews = {
        ...mockProduct,
        reviews: [
          { userId: 'user1', rating: 4, comment: 'Good' },
          { userId: 'user2', rating: 2, comment: 'Bad' }
        ],
        averageRating: 3,
        reviewCount: 2
      };
      
      mockSnapshot.val.mockReturnValue(productWithReviews);

      const reviewData = {
        userId: 'user3',
        rating: 5,
        comment: 'Excellent!'
      };

      const result = await productService.addProductReview('test-id', reviewData);

      expect(result.success).toBe(true);
      
      const updateCall = update.mock.calls[0][1];
      expect(updateCall.reviews).toHaveLength(3);
      expect(updateCall.averageRating).toBe(3.7); // (4+2+5)/3 = 3.67, rounded to 3.7
      expect(updateCall.reviewCount).toBe(3);
    });

    it('should fail when required fields are missing', async () => {
      const reviewData = {
        userId: 'user123'
        // Missing rating
      };

      const result = await productService.addProductReview('test-id', reviewData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail when rating is invalid', async () => {
      const reviewData = {
        userId: 'user123',
        rating: 6, // Invalid rating > 5
        comment: 'Great!'
      };

      const result = await productService.addProductReview('test-id', reviewData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toContain('Rating must be a number between 1 and 5');
    });

    it('should fail when product does not exist', async () => {
      mockSnapshot.exists.mockReturnValue(false);

      const reviewData = {
        userId: 'user123',
        rating: 5,
        comment: 'Great!'
      };

      const result = await productService.addProductReview('non-existent', reviewData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND_ERROR');
    });
  });

  describe('getProductsByCategory', () => {
    it('should call getAllProducts with category filter', async () => {
      const spy = jest.spyOn(productService, 'getAllProducts').mockResolvedValue({
        success: true,
        data: { products: [], pagination: {} }
      });

      await productService.getProductsByCategory('electronics', { limit: 20 });

      expect(spy).toHaveBeenCalledWith({
        category: 'electronics',
        limit: 20
      });

      spy.mockRestore();
    });
  });

  describe('searchProducts', () => {
    it('should call getAllProducts with search filter', async () => {
      const spy = jest.spyOn(productService, 'getAllProducts').mockResolvedValue({
        success: true,
        data: { products: [], pagination: {} }
      });

      await productService.searchProducts('laptop', { limit: 10 });

      expect(spy).toHaveBeenCalledWith({
        search: 'laptop',
        limit: 10
      });

      spy.mockRestore();
    });
  });

  describe('getProductsPaginated', () => {
    it('should call getAllProducts with pagination parameters', async () => {
      const spy = jest.spyOn(productService, 'getAllProducts').mockResolvedValue({
        success: true,
        data: { products: [], pagination: {} }
      });

      await productService.getProductsPaginated(2, 15, { category: 'books' });

      expect(spy).toHaveBeenCalledWith({
        page: 2,
        limit: 15,
        category: 'books'
      });

      spy.mockRestore();
    });
  });

  describe('getProductReviews', () => {
    const mockProduct = {
      id: 'test-id',
      reviews: [
        { userId: 'user1', rating: 5, comment: 'Great!', createdAt: 3000 },
        { userId: 'user2', rating: 4, comment: 'Good', createdAt: 2000 },
        { userId: 'user3', rating: 3, comment: 'OK', createdAt: 1000 }
      ],
      averageRating: 4
    };

    beforeEach(() => {
      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue(mockProduct);
    });

    it('should return product reviews with default sorting', async () => {
      const result = await productService.getProductReviews('test-id');

      expect(result.success).toBe(true);
      expect(result.data.reviews).toHaveLength(3);
      expect(result.data.reviews[0].createdAt).toBe(3000); // Most recent first
      expect(result.data.totalReviews).toBe(3);
      expect(result.data.averageRating).toBe(4);
    });

    it('should limit number of reviews returned', async () => {
      const result = await productService.getProductReviews('test-id', { limit: 2 });

      expect(result.success).toBe(true);
      expect(result.data.reviews).toHaveLength(2);
      expect(result.data.totalReviews).toBe(3);
    });

    it('should sort reviews by rating ascending', async () => {
      const result = await productService.getProductReviews('test-id', { 
        sortBy: 'rating', 
        sortOrder: 'asc' 
      });

      expect(result.success).toBe(true);
      expect(result.data.reviews[0].rating).toBe(3);
      expect(result.data.reviews[2].rating).toBe(5);
    });

    it('should fail when product does not exist', async () => {
      mockSnapshot.exists.mockReturnValue(false);

      const result = await productService.getProductReviews('non-existent');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND_ERROR');
    });
  });

  describe('removeProductReview', () => {
    const mockProduct = {
      id: 'test-id',
      reviews: [
        { userId: 'user1', rating: 5, comment: 'Great!' },
        { userId: 'user2', rating: 3, comment: 'OK' }
      ],
      averageRating: 4,
      reviewCount: 2
    };

    beforeEach(() => {
      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue({ ...mockProduct });
    });

    it('should remove review successfully', async () => {
      const result = await productService.removeProductReview('test-id', 'user1');

      expect(result.success).toBe(true);
      expect(update).toHaveBeenCalled();
      
      const updateCall = update.mock.calls[0][1];
      expect(updateCall.reviews).toHaveLength(1);
      expect(updateCall.reviews[0].userId).toBe('user2');
      expect(updateCall.averageRating).toBe(3);
      expect(updateCall.reviewCount).toBe(1);
    });

    it('should fail when review does not exist', async () => {
      const result = await productService.removeProductReview('test-id', 'non-existent-user');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND_ERROR');
      expect(result.error.message).toContain('Review not found');
    });

    it('should fail when product does not exist', async () => {
      mockSnapshot.exists.mockReturnValue(false);

      const result = await productService.removeProductReview('non-existent', 'user1');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('should handle removing last review', async () => {
      const productWithOneReview = {
        ...mockProduct,
        reviews: [{ userId: 'user1', rating: 5, comment: 'Great!' }],
        averageRating: 5,
        reviewCount: 1
      };
      
      mockSnapshot.val.mockReturnValue(productWithOneReview);

      const result = await productService.removeProductReview('test-id', 'user1');

      expect(result.success).toBe(true);
      
      const updateCall = update.mock.calls[0][1];
      expect(updateCall.reviews).toHaveLength(0);
      expect(updateCall.averageRating).toBe(0);
      expect(updateCall.reviewCount).toBe(0);
    });
  });

  describe('getProductStatistics', () => {
    const mockProducts = {
      'prod1': {
        id: 'prod1',
        category: 'electronics',
        price: 100,
        inventory: 10,
        isActive: true
      },
      'prod2': {
        id: 'prod2',
        category: 'clothing',
        price: 50,
        inventory: 20,
        isActive: true
      },
      'prod3': {
        id: 'prod3',
        category: 'electronics',
        price: 200,
        inventory: 5,
        isActive: false
      }
    };

    beforeEach(() => {
      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue(mockProducts);
    });

    it('should calculate statistics correctly', async () => {
      const result = await productService.getProductStatistics();

      expect(result.success).toBe(true);
      expect(result.data.totalProducts).toBe(3);
      expect(result.data.activeProducts).toBe(2);
      expect(result.data.inactiveProducts).toBe(1);
      expect(result.data.categories).toEqual(['clothing', 'electronics']);
      expect(result.data.averagePrice).toBe(75); // (100 + 50) / 2
      expect(result.data.totalInventory).toBe(30); // 10 + 20 (only active products)
    });

    it('should handle empty product database', async () => {
      mockSnapshot.exists.mockReturnValue(false);

      const result = await productService.getProductStatistics();

      expect(result.success).toBe(true);
      expect(result.data.totalProducts).toBe(0);
      expect(result.data.activeProducts).toBe(0);
      expect(result.data.categories).toEqual([]);
      expect(result.data.averagePrice).toBe(0);
      expect(result.data.totalInventory).toBe(0);
    });
  });

  describe('permanentlyDeleteProduct', () => {
    const mockProduct = {
      id: 'test-id',
      name: 'Test Product',
      isActive: true
    };

    beforeEach(() => {
      mockSnapshot.exists.mockReturnValue(true);
      mockSnapshot.val.mockReturnValue(mockProduct);
    });

    it('should permanently delete product successfully', async () => {
      const result = await productService.permanentlyDeleteProduct('test-id');

      expect(result.success).toBe(true);
      expect(result.data.deleted).toBe(true);
      expect(result.data.permanent).toBe(true);
      expect(remove).toHaveBeenCalled();
    });

    it('should fail when product does not exist', async () => {
      mockSnapshot.exists.mockReturnValue(false);

      const result = await productService.permanentlyDeleteProduct('non-existent');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND_ERROR');
    });

    it('should fail when product ID is not provided', async () => {
      const result = await productService.permanentlyDeleteProduct('');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      jest.spyOn(databaseService, 'getDatabase').mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const result = await productService.getProductById('test-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle Firebase operation errors', async () => {
      get.mockRejectedValue(new Error('Firebase operation failed'));

      const result = await productService.getProductById('test-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});