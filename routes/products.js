const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const productService = require('../services/productService');
const logger = require('../utils/logger');

// @route   GET api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
      includeInactive = false
    } = req.query;

    // Input validation
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 12)); // Cap at 100 items per page

    // Validate price filters
    let validMinPrice, validMaxPrice;
    if (minPrice !== undefined) {
      validMinPrice = parseFloat(minPrice);
      if (isNaN(validMinPrice) || validMinPrice < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid minPrice parameter. Must be a non-negative number.' 
        });
      }
    }

    if (maxPrice !== undefined) {
      validMaxPrice = parseFloat(maxPrice);
      if (isNaN(validMaxPrice) || validMaxPrice < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid maxPrice parameter. Must be a non-negative number.' 
        });
      }
    }

    // Validate sort parameters
    const validSortFields = ['name', 'price', 'createdAt', 'updatedAt', 'averageRating', 'category'];
    const validSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc';

    const filters = {
      category: category ? category.trim() : undefined,
      search: search ? search.trim() : undefined,
      minPrice: validMinPrice,
      maxPrice: validMaxPrice,
      sortBy: validSortBy,
      sortOrder: validSortOrder,
      page: pageNum,
      limit: limitNum,
      includeInactive: includeInactive === 'true'
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const result = await productService.getAllProducts(filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error?.message || 'Failed to fetch products',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data.products,
      pagination: result.data.pagination,
      filters: {
        category,
        search,
        minPrice: validMinPrice,
        maxPrice: validMaxPrice,
        sortBy: validSortBy,
        sortOrder: validSortOrder
      }
    });

  } catch (err) {
    logger.error('Error fetching products', {
      error: {
        message: err.message,
        stack: err.stack
      },
      filters
    }, req);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching products',
      error: {
        code: 'FETCH_PRODUCTS_ERROR',
        message: 'Failed to retrieve products',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

// @route   GET api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { 
      page = 1, 
      limit = 12, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      search
    } = req.query;

    // Input validation
    if (!category || category.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 12));

    const filters = {
      category: category.trim(),
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search: search ? search.trim() : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const result = await productService.getProductsByCategory(category.trim(), filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error?.message || 'Failed to fetch products by category',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data.products,
      pagination: result.data.pagination,
      category: category.trim()
    });

  } catch (err) {
    logger.error('Error fetching products by category', {
      error: {
        message: err.message,
        stack: err.stack
      },
      category: req.params.category,
      filters
    }, req);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching products by category',
      error: {
        code: 'FETCH_CATEGORY_ERROR',
        message: 'Failed to retrieve products by category',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

// @route   GET api/products/search/:term
// @desc    Search products
// @access  Public
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { 
      page = 1, 
      limit = 12, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      category,
      minPrice,
      maxPrice
    } = req.query;

    // Input validation
    if (!term || term.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 12));

    const filters = {
      search: term.trim(),
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder,
      category: category ? category.trim() : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const result = await productService.searchProducts(term.trim(), filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error?.message || 'Failed to search products',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data.products,
      pagination: result.data.pagination,
      searchTerm: term.trim()
    });

  } catch (err) {
    logger.error('Error searching products', {
      error: {
        message: err.message,
        stack: err.stack
      },
      searchTerm: req.params.term,
      filters
    }, req);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while searching products',
      error: {
        code: 'SEARCH_PRODUCTS_ERROR',
        message: 'Failed to search products',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Input validation
    if (!id || id.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

    const result = await productService.getProductById(id.trim());

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error?.message || 'Failed to fetch product',
        error: result.error
      });
    }

    if (!result.data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (err) {
    logger.error('Error fetching product by ID', {
      error: {
        message: err.message,
        stack: err.stack
      },
      productId: req.params.id
    }, req);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching product',
      error: {
        code: 'FETCH_PRODUCT_ERROR',
        message: 'Failed to retrieve product',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

// @route   POST api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { name, description, price, category, images, inventory, supplierVariantId } = req.body;

    // Input validation
    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, price, category'
      });
    }

    // Validate name and description
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product name must be a non-empty string'
      });
    }

    if (typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product description must be a non-empty string'
      });
    }

    // Validate price
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number'
      });
    }

    // Validate category
    if (typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Category must be a non-empty string'
      });
    }

    // Validate inventory if provided
    let numInventory = 0;
    if (inventory !== undefined) {
      numInventory = parseInt(inventory);
      if (isNaN(numInventory) || numInventory < 0) {
        return res.status(400).json({
          success: false,
          message: 'Inventory must be a non-negative number'
        });
      }
    }

    // Validate images if provided
    if (images && !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Images must be an array'
      });
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      images: images || [],
      inventory: numInventory,
      supplierVariantId: supplierVariantId || null
    };

    const result = await productService.createProduct(productData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error?.message || 'Failed to create product',
        error: result.error
      });
    }

    res.status(201).json({
      success: true,
      data: result.data,
      message: 'Product created successfully'
    });

  } catch (err) {
    logger.error('Error creating product', {
      error: {
        message: err.message,
        stack: err.stack
      },
      productData: {
        name: req.body.name,
        category: req.body.category,
        price: req.body.price
      },
      userId: req.user?.userId
    }, req);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating product',
      error: {
        code: 'CREATE_PRODUCT_ERROR',
        message: 'Failed to create product',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Input validation
    if (!id || id.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required'
      });
    }

    // Validate specific fields if provided
    if (updateData.name !== undefined) {
      if (typeof updateData.name !== 'string' || updateData.name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Product name must be a non-empty string'
        });
      }
    }

    if (updateData.description !== undefined) {
      if (typeof updateData.description !== 'string' || updateData.description.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Product description must be a non-empty string'
        });
      }
    }

    if (updateData.price !== undefined) {
      const numPrice = parseFloat(updateData.price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a non-negative number'
        });
      }
      updateData.price = numPrice;
    }

    if (updateData.category !== undefined) {
      if (typeof updateData.category !== 'string' || updateData.category.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Category must be a non-empty string'
        });
      }
    }

    if (updateData.inventory !== undefined) {
      const numInventory = parseInt(updateData.inventory);
      if (isNaN(numInventory) || numInventory < 0) {
        return res.status(400).json({
          success: false,
          message: 'Inventory must be a non-negative number'
        });
      }
      updateData.inventory = numInventory;
    }

    if (updateData.images !== undefined && !Array.isArray(updateData.images)) {
      return res.status(400).json({
        success: false,
        message: 'Images must be an array'
      });
    }

    const result = await productService.updateProduct(id.trim(), updateData);

    if (!result.success) {
      if (result.error?.code === 'NOT_FOUND_ERROR') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      return res.status(400).json({
        success: false,
        message: result.error?.message || 'Failed to update product',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      message: 'Product updated successfully'
    });

  } catch (err) {
    logger.error('Error updating product', {
      error: {
        message: err.message,
        stack: err.stack
      },
      productId: req.params.id,
      updateFields: Object.keys(req.body),
      userId: req.user?.userId
    }, req);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating product',
      error: {
        code: 'UPDATE_PRODUCT_ERROR',
        message: 'Failed to update product',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

// @route   DELETE api/products/:id
// @desc    Delete a product (soft delete)
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;

    // Input validation
    if (!id || id.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const result = await productService.deleteProduct(id.trim());

    if (!result.success) {
      if (result.error?.code === 'NOT_FOUND_ERROR') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      return res.status(400).json({
        success: false,
        message: result.error?.message || 'Failed to delete product',
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (err) {
    logger.error('Error deleting product', {
      error: {
        message: err.message,
        stack: err.stack
      },
      productId: req.params.id,
      userId: req.user?.userId
    }, req);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting product',
      error: {
        code: 'DELETE_PRODUCT_ERROR',
        message: 'Failed to delete product',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

// @route   POST api/products/:id/reviews
// @desc    Add a review to a product
// @access  Private
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id: productId } = req.params;
    const userId = req.user.userId;

    // Input validation
    if (!productId || productId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (rating === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required'
      });
    }

    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5'
      });
    }

    // Validate comment if provided
    if (comment !== undefined && typeof comment !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Comment must be a string'
      });
    }

    const reviewData = {
      userId,
      rating: numRating,
      comment: comment ? comment.trim() : ''
    };

    const result = await productService.addProductReview(productId.trim(), reviewData);

    if (!result.success) {
      if (result.error?.code === 'NOT_FOUND_ERROR') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      return res.status(400).json({
        success: false,
        message: result.error?.message || 'Failed to add review',
        error: result.error
      });
    }

    res.status(201).json({
      success: true,
      data: result.data,
      message: 'Review added successfully'
    });

  } catch (err) {
    logger.error('Error adding review', {
      error: {
        message: err.message,
        stack: err.stack
      },
      productId: req.params.id,
      userId: req.user?.userId,
      rating: req.body.rating
    }, req);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while adding review',
      error: {
        code: 'ADD_REVIEW_ERROR',
        message: 'Failed to add product review',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

// @route   GET api/products/:id/reviews
// @desc    Get reviews for a product
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Input validation
    if (!productId || productId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const validSortFields = ['createdAt', 'updatedAt', 'rating'];
    const validSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc';

    const options = {
      limit: limitNum,
      sortBy: validSortBy,
      sortOrder: validSortOrder
    };

    const result = await productService.getProductReviews(productId.trim(), options);

    if (!result.success) {
      if (result.error?.code === 'NOT_FOUND_ERROR') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      return res.status(500).json({
        success: false,
        message: result.error?.message || 'Failed to fetch reviews',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (err) {
    logger.error('Error fetching reviews', {
      error: {
        message: err.message,
        stack: err.stack
      },
      productId: req.params.id,
      options
    }, req);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching reviews',
      error: {
        code: 'FETCH_REVIEWS_ERROR',
        message: 'Failed to retrieve product reviews',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

// @route   DELETE api/products/:id/reviews
// @desc    Remove user's review from a product
// @access  Private
router.delete('/:id/reviews', auth, async (req, res) => {
  try {
    const { id: productId } = req.params;
    const userId = req.user.userId;

    // Input validation
    if (!productId || productId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const result = await productService.removeProductReview(productId.trim(), userId);

    if (!result.success) {
      if (result.error?.code === 'NOT_FOUND_ERROR') {
        return res.status(404).json({
          success: false,
          message: result.error.message
        });
      }
      return res.status(400).json({
        success: false,
        message: result.error?.message || 'Failed to remove review',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      message: 'Review removed successfully'
    });

  } catch (err) {
    logger.error('Error removing review', {
      error: {
        message: err.message,
        stack: err.stack
      },
      productId: req.params.id,
      userId: req.user?.userId
    }, req);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while removing review',
      error: {
        code: 'REMOVE_REVIEW_ERROR',
        message: 'Failed to remove product review',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});

module.exports = router;