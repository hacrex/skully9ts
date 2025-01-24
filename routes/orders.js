const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createDropshipOrder } = require('../services/dropshipping');

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

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    const order = new Order({
      user: req.user.userId,
      items,
      shippingAddress,
      billingAddress,
      paymentInfo: {
        method: paymentMethod,
        transactionId: paymentIntentId,
        status: 'completed'
      },
      subtotal: paymentIntent.amount / 100,
      shippingCost: 0, // Calculate based on shipping method
      tax: 0, // Calculate based on location
      total: paymentIntent.amount / 100
    });

    await order.save();

    // Create dropshipping order
    const dropshipResponse = await createDropshipOrder(order);
    
    // Update order with tracking info
    order.tracking = {
      number: dropshipResponse.trackingNumber,
      carrier: dropshipResponse.carrier,
      url: dropshipResponse.trackingUrl
    };
    order.status = 'processing';
    
    await order.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/orders/create-payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: { userId: req.user.userId }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
