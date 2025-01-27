const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const realtimeService = require('../realtimeService'); // Update to use realtimeService

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

    const orderData = {
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
      total: paymentIntent.amount / 100
    };

    const orderId = await realtimeService.addOrderRealtime(orderData); // Use Realtime DB
    res.status(201).json({ id: orderId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await realtimeService.getOrdersRealtime(req.user.userId); // Use Realtime DB
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await realtimeService.getOrderRealtime(req.params.id); // Use Realtime DB
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('Error fetching order by ID:', err);
    res.status(500).json({ message: 'Server error while fetching order' });
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