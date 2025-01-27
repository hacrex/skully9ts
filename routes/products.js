const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const realtimeService = require('../realtimeService'); // Update to use realtimeService

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
      sortBy,
      page = 1,
      limit = 12
    } = req.query;

    const products = await realtimeService.getProductsRealtime(); // Use Realtime DB
    // Implement filtering and pagination logic here
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await realtimeService.getProductRealtime(req.params.id); // Use Realtime DB
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});

// @route   POST api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
  try {
    const product = req.body;
    const productId = await realtimeService.addProductRealtime(product); // Use Realtime DB
    res.status(201).json({ id: productId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const productId = req.params.id;
    await realtimeService.updateProductRealtime(productId, req.body); // Use Realtime DB
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// @route   POST api/products/:id/reviews
// @desc    Add a review to a product
// @access  Private
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await realtimeService.getProductRealtime(productId); // Use Realtime DB
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = { user: req.user.userId, rating, comment };
    product.reviews.push(review);

    await realtimeService.updateProductRealtime(productId, product); // Use Realtime DB
    res.status(201).json(product);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Server error while adding review' });
  }
});

module.exports = router;