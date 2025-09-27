'use strict';

const { ref, get, set, update, remove, query, orderByChild, equalTo, push } = require('firebase/database');
const databaseService = require('./databaseService');

/**
 * Product Service for Firebase Realtime Database
 * Provides comprehensive CRUD operations, filtering, pagination, and review management for products
 */
class ProductService {
  constructor() {
    this.collectionPath = 'products';
    this.reviewsPath = 'reviews';
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data object
   * @param {string} productData.name - Product name
   * @param {string} productData.description - Product description
   * @param {number} productData.price - Product price
   * @param {string} productData.category - Product category
   * @param {Array} [productData.images=[]] - Product images
   * @param {number} [productData.inventory=0] - Product inventory count
   * @param {string} [productData.supplierVariantId] - Supplier variant ID
   * @returns {Promise<Object>} Created product data
   */
  async createProduct(productData) {
    try {
      const { name, description, price, category, images = [], inventory = 0, supplierVariantId } = productData;

      // Validate required fields
      if (!name || !description || price === undefined || !category) {
        throw databaseService.createError(
          'VALIDATION_ERROR',
          'Missing required fields: name, description, price, category'
        );
      }

      // Validate price
      if (typeof price !== 'number' || price < 0) {
        throw databaseService.createError('VALIDATION_ERROR', 'Price must be a non-negative number');
      }

      // Validate inventory
      if (typeof inventory !== 'number' || inventory < 0) {
        throw databaseService.createError('VALIDATION_ERROR', 'Inventory must be a non-negative number');
      }

      // Generate unique product ID
      const db = databaseService.getDatabase();
      const productsRef = ref(db, this.collectionPath);
      const newProductRef = push(productsRef);
      const productId = newProductRef.key;

      // Prepare product data
      const newProduct = {
        id: productId,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category: category.trim().toLowerCase(),
        images: Array.isArray(images) ? images : [],
        inventory: Number(inventory),
        supplierVariantId: supplierVariantId || null,
        reviews: [],
        averageRating: 0,
        reviewCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true
      };

      // Save to database
      await set(newProductRef, newProduct);

      databaseService.log('info', 'Product created successfully', { productId, name, category });
      return databaseService.createSuccessResponse(newProduct, 'createProduct');

    } catch (error) {
      return databaseService.handleError(error, 'createProduct', { name: productData.name });
    }
  }

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getProductById(productId) {
    try {
      if (!productId) {
        throw databaseService.createError('VALIDATION_ERROR', 'Product ID is required');
      }

      const db = databaseService.getDatabase();
      const productRef = ref(db, `${this.collectionPath}/${productId}`);
      const snapshot = await get(productRef);

      if (!snapshot.exists()) {
        return databaseService.createSuccessResponse(null, 'getProductById');
      }

      const productData = snapshot.val();
      
      databaseService.log('debug', 'Product retrieved successfully', { productId });
      return databaseService.createSuccessResponse(productData, 'getProductById');

    } catch (error) {
      return databaseService.handleError(error, 'getProductById', { productId });
    }
  }

  /**
   * Get all products with filtering, searching, and pagination
   * @param {Object} filters - Filter options
   * @param {string} [filters.category] - Filter by category
   * @param {number} [filters.minPrice] - Minimum price filter
   * @param {number} [filters.maxPrice] - Maximum price filter
   * @param {string} [filters.search] - Search term for name/description
   * @param {string} [filters.sortBy='createdAt'] - Sort field
   * @param {string} [filters.sortOrder='desc'] - Sort order (asc/desc)
   * @param {number} [filters.page=1] - Page number for pagination
   * @param {number} [filters.limit=12] - Items per page
   * @param {boolean} [filters.includeInactive=false] - Include inactive products
   * @returns {Promise<Object>} Filtered and paginated products
   */
  async getAllProducts(filters = {}) {
    try {
      const {
        category,
        minPrice,
        maxPrice,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 12,
        includeInactive = false
      } = filters;

      const db = databaseService.getDatabase();
      const productsRef = ref(db, this.collectionPath);
      const snapshot = await get(productsRef);

      if (!snapshot.exists()) {
        return databaseService.createSuccessResponse({
          products: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        }, 'getAllProducts');
      }

      const allProducts = snapshot.val();
      let products = Object.values(allProducts);

      // Filter inactive products if not requested
      if (!includeInactive) {
        products = products.filter(product => product.isActive !== false);
      }

      // Apply category filter
      if (category) {
        const categoryLower = category.toLowerCase();
        products = products.filter(product => 
          product.category && product.category.toLowerCase() === categoryLower
        );
      }

      // Apply price filters
      if (minPrice !== undefined) {
        const min = Number(minPrice);
        if (!isNaN(min)) {
          products = products.filter(product => product.price >= min);
        }
      }

      if (maxPrice !== undefined) {
        const max = Number(maxPrice);
        if (!isNaN(max)) {
          products = products.filter(product => product.price <= max);
        }
      }

      // Apply search filter
      if (search) {
        const searchTerm = search.toLowerCase();
        products = products.filter(product => 
          (product.name && product.name.toLowerCase().includes(searchTerm)) ||
          (product.description && product.description.toLowerCase().includes(searchTerm))
        );
      }

      // Sort products
      products.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle undefined values
        if (aValue === undefined) aValue = 0;
        if (bValue === undefined) bValue = 0;

        // Handle different data types
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });

      // Calculate pagination
      const totalProducts = products.length;
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.max(1, Number(limit));
      const totalPages = Math.ceil(totalProducts / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      // Apply pagination
      const paginatedProducts = products.slice(startIndex, endIndex);

      const paginationInfo = {
        page: pageNum,
        limit: limitNum,
        total: totalProducts,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      };

      databaseService.log('debug', 'Products retrieved with filters', {
        totalProducts,
        filteredCount: paginatedProducts.length,
        filters: { category, minPrice, maxPrice, search, sortBy, sortOrder },
        pagination: paginationInfo
      });

      return databaseService.createSuccessResponse({
        products: paginatedProducts,
        pagination: paginationInfo
      }, 'getAllProducts');

    } catch (error) {
      return databaseService.handleError(error, 'getAllProducts', filters);
    }
  }

  /**
   * Update product data
   * @param {string} productId - Product ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated product data
   */
  async updateProduct(productId, updateData) {
    try {
      if (!productId) {
        throw databaseService.createError('VALIDATION_ERROR', 'Product ID is required');
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        throw databaseService.createError('VALIDATION_ERROR', 'Update data is required');
      }

      // Check if product exists
      const productResponse = await this.getProductById(productId);
      if (!productResponse.success || !productResponse.data) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'Product not found');
      }

      // Prepare update data (exclude sensitive fields that shouldn't be updated directly)
      const allowedFields = ['name', 'description', 'price', 'category', 'images', 'inventory', 'supplierVariantId', 'isActive'];
      const filteredUpdateData = {};
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          // Validate specific fields
          if (key === 'price' && (typeof value !== 'number' || value < 0)) {
            throw databaseService.createError('VALIDATION_ERROR', 'Price must be a non-negative number');
          }
          if (key === 'inventory' && (typeof value !== 'number' || value < 0)) {
            throw databaseService.createError('VALIDATION_ERROR', 'Inventory must be a non-negative number');
          }
          if (key === 'category' && typeof value === 'string') {
            filteredUpdateData[key] = value.trim().toLowerCase();
          } else if ((key === 'name' || key === 'description') && typeof value === 'string') {
            filteredUpdateData[key] = value.trim();
          } else {
            filteredUpdateData[key] = value;
          }
        }
      }

      // Add updated timestamp
      filteredUpdateData.updatedAt = Date.now();

      // Update in database
      const db = databaseService.getDatabase();
      const productRef = ref(db, `${this.collectionPath}/${productId}`);
      await update(productRef, filteredUpdateData);

      databaseService.log('info', 'Product updated successfully', { 
        productId, 
        updatedFields: Object.keys(filteredUpdateData) 
      });

      // Return updated product data
      const updatedProductResponse = await this.getProductById(productId);
      return updatedProductResponse;

    } catch (error) {
      return databaseService.handleError(error, 'updateProduct', { productId });
    }
  }

  /**
   * Delete product (soft delete by setting isActive to false)
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Success response
   */
  async deleteProduct(productId) {
    try {
      if (!productId) {
        throw databaseService.createError('VALIDATION_ERROR', 'Product ID is required');
      }

      // Check if product exists
      const productResponse = await this.getProductById(productId);
      if (!productResponse.success || !productResponse.data) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'Product not found');
      }

      // Soft delete by setting isActive to false
      const updateData = {
        isActive: false,
        deletedAt: Date.now(),
        updatedAt: Date.now()
      };

      const db = databaseService.getDatabase();
      const productRef = ref(db, `${this.collectionPath}/${productId}`);
      await update(productRef, updateData);

      databaseService.log('info', 'Product soft deleted successfully', { productId });
      return databaseService.createSuccessResponse({ deleted: true }, 'deleteProduct');

    } catch (error) {
      return databaseService.handleError(error, 'deleteProduct', { productId });
    }
  }  /**

   * Add a review to a product
   * @param {string} productId - Product ID
   * @param {Object} reviewData - Review data
   * @param {string} reviewData.userId - User ID who wrote the review
   * @param {number} reviewData.rating - Rating (1-5)
   * @param {string} reviewData.comment - Review comment
   * @returns {Promise<Object>} Updated product with new review
   */
  async addProductReview(productId, reviewData) {
    try {
      const { userId, rating, comment } = reviewData;

      // Validate required fields
      if (!productId || !userId || rating === undefined) {
        throw databaseService.createError(
          'VALIDATION_ERROR',
          'Product ID, user ID, and rating are required'
        );
      }

      // Validate rating
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw databaseService.createError('VALIDATION_ERROR', 'Rating must be a number between 1 and 5');
      }

      // Check if product exists
      const productResponse = await this.getProductById(productId);
      if (!productResponse.success || !productResponse.data) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'Product not found');
      }

      const product = productResponse.data;

      // Check if user already reviewed this product
      const existingReviewIndex = product.reviews.findIndex(review => review.userId === userId);
      
      const newReview = {
        userId,
        rating: Number(rating),
        comment: comment ? comment.trim() : '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      let updatedReviews;
      if (existingReviewIndex !== -1) {
        // Update existing review
        updatedReviews = [...product.reviews];
        updatedReviews[existingReviewIndex] = newReview;
        databaseService.log('info', 'Product review updated', { productId, userId });
      } else {
        // Add new review
        updatedReviews = [...product.reviews, newReview];
        databaseService.log('info', 'Product review added', { productId, userId });
      }

      // Calculate new average rating
      const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;

      // Update product with new review data
      const updateData = {
        reviews: updatedReviews,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviewCount: updatedReviews.length,
        updatedAt: Date.now()
      };

      const db = databaseService.getDatabase();
      const productRef = ref(db, `${this.collectionPath}/${productId}`);
      await update(productRef, updateData);

      // Return updated product
      const updatedProductResponse = await this.getProductById(productId);
      return updatedProductResponse;

    } catch (error) {
      return databaseService.handleError(error, 'addProductReview', { productId, userId: reviewData.userId });
    }
  }

  /**
   * Get products by category
   * @param {string} category - Product category
   * @param {Object} options - Additional options
   * @param {number} [options.limit=50] - Number of products to return
   * @param {string} [options.sortBy='createdAt'] - Sort field
   * @param {string} [options.sortOrder='desc'] - Sort order
   * @returns {Promise<Object>} Products in the category
   */
  async getProductsByCategory(category, options = {}) {
    const filters = {
      category,
      ...options
    };
    return this.getAllProducts(filters);
  }

  /**
   * Search products by name or description
   * @param {string} searchTerm - Search term
   * @param {Object} options - Additional options
   * @param {number} [options.limit=50] - Number of products to return
   * @param {string} [options.sortBy='createdAt'] - Sort field
   * @param {string} [options.sortOrder='desc'] - Sort order
   * @returns {Promise<Object>} Search results
   */
  async searchProducts(searchTerm, options = {}) {
    const filters = {
      search: searchTerm,
      ...options
    };
    return this.getAllProducts(filters);
  }

  /**
   * Get products with pagination (alias for getAllProducts with pagination focus)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Paginated products
   */
  async getProductsPaginated(page, limit, filters = {}) {
    const paginationFilters = {
      page,
      limit,
      ...filters
    };
    return this.getAllProducts(paginationFilters);
  }

  /**
   * Get product reviews
   * @param {string} productId - Product ID
   * @param {Object} options - Options for review retrieval
   * @param {number} [options.limit=10] - Number of reviews to return
   * @param {string} [options.sortBy='createdAt'] - Sort field
   * @param {string} [options.sortOrder='desc'] - Sort order
   * @returns {Promise<Object>} Product reviews
   */
  async getProductReviews(productId, options = {}) {
    try {
      const { limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

      const productResponse = await this.getProductById(productId);
      if (!productResponse.success || !productResponse.data) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'Product not found');
      }

      const product = productResponse.data;
      let reviews = product.reviews || [];

      // Sort reviews
      reviews.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (aValue === undefined) aValue = 0;
        if (bValue === undefined) bValue = 0;

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });

      // Apply limit
      const limitedReviews = reviews.slice(0, limit);

      databaseService.log('debug', 'Product reviews retrieved', { 
        productId, 
        reviewCount: limitedReviews.length,
        totalReviews: reviews.length 
      });

      return databaseService.createSuccessResponse({
        reviews: limitedReviews,
        totalReviews: reviews.length,
        averageRating: product.averageRating || 0
      }, 'getProductReviews');

    } catch (error) {
      return databaseService.handleError(error, 'getProductReviews', { productId });
    }
  }

  /**
   * Remove a review from a product
   * @param {string} productId - Product ID
   * @param {string} userId - User ID who wrote the review
   * @returns {Promise<Object>} Updated product without the review
   */
  async removeProductReview(productId, userId) {
    try {
      if (!productId || !userId) {
        throw databaseService.createError('VALIDATION_ERROR', 'Product ID and user ID are required');
      }

      // Check if product exists
      const productResponse = await this.getProductById(productId);
      if (!productResponse.success || !productResponse.data) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'Product not found');
      }

      const product = productResponse.data;
      const reviewIndex = product.reviews.findIndex(review => review.userId === userId);

      if (reviewIndex === -1) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'Review not found');
      }

      // Remove the review
      const updatedReviews = product.reviews.filter(review => review.userId !== userId);

      // Recalculate average rating
      const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;

      // Update product
      const updateData = {
        reviews: updatedReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: updatedReviews.length,
        updatedAt: Date.now()
      };

      const db = databaseService.getDatabase();
      const productRef = ref(db, `${this.collectionPath}/${productId}`);
      await update(productRef, updateData);

      databaseService.log('info', 'Product review removed', { productId, userId });

      // Return updated product
      const updatedProductResponse = await this.getProductById(productId);
      return updatedProductResponse;

    } catch (error) {
      return databaseService.handleError(error, 'removeProductReview', { productId, userId });
    }
  }

  /**
   * Get product statistics
   * @returns {Promise<Object>} Product statistics
   */
  async getProductStatistics() {
    try {
      const db = databaseService.getDatabase();
      const productsRef = ref(db, this.collectionPath);
      const snapshot = await get(productsRef);

      if (!snapshot.exists()) {
        return databaseService.createSuccessResponse({
          totalProducts: 0,
          activeProducts: 0,
          inactiveProducts: 0,
          categories: [],
          averagePrice: 0,
          totalInventory: 0
        }, 'getProductStatistics');
      }

      const allProducts = snapshot.val();
      const products = Object.values(allProducts);

      const activeProducts = products.filter(p => p.isActive !== false);
      const inactiveProducts = products.filter(p => p.isActive === false);

      // Get unique categories
      const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

      // Calculate average price
      const totalPrice = activeProducts.reduce((sum, p) => sum + (p.price || 0), 0);
      const averagePrice = activeProducts.length > 0 ? totalPrice / activeProducts.length : 0;

      // Calculate total inventory
      const totalInventory = activeProducts.reduce((sum, p) => sum + (p.inventory || 0), 0);

      const statistics = {
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        inactiveProducts: inactiveProducts.length,
        categories: categories.sort(),
        averagePrice: Math.round(averagePrice * 100) / 100,
        totalInventory
      };

      databaseService.log('debug', 'Product statistics calculated', statistics);
      return databaseService.createSuccessResponse(statistics, 'getProductStatistics');

    } catch (error) {
      return databaseService.handleError(error, 'getProductStatistics');
    }
  }

  /**
   * Permanently delete product (hard delete)
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Success response
   */
  async permanentlyDeleteProduct(productId) {
    try {
      if (!productId) {
        throw databaseService.createError('VALIDATION_ERROR', 'Product ID is required');
      }

      // Check if product exists
      const productResponse = await this.getProductById(productId);
      if (!productResponse.success || !productResponse.data) {
        throw databaseService.createError('NOT_FOUND_ERROR', 'Product not found');
      }

      // Hard delete from database
      const db = databaseService.getDatabase();
      const productRef = ref(db, `${this.collectionPath}/${productId}`);
      await remove(productRef);

      databaseService.log('warn', 'Product permanently deleted', { productId });
      return databaseService.createSuccessResponse({ deleted: true, permanent: true }, 'permanentlyDeleteProduct');

    } catch (error) {
      return databaseService.handleError(error, 'permanentlyDeleteProduct', { productId });
    }
  }
}

// Export singleton instance
const productService = new ProductService();

module.exports = productService;