import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Divider,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CartItem from '../components/cart/CartItem';
import EmptyCart from '../components/cart/EmptyCart';

const Cart = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { items, total, quantity } = useSelector(state => state.cart);
  const shippingCost = total > 100 ? 0 : 10; // Free shipping over $100
  const finalTotal = total + shippingCost;

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Your Cart ({quantity} {quantity === 1 ? 'item' : 'items'})
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <AnimatePresence>
            {items.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Paper
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                position: 'sticky',
                top: 100
              }}
            >
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal</Typography>
                  <Typography>${total.toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Shipping</Typography>
                  <Typography>
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </Typography>
                </Box>
                
                {shippingCost > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add ${(100 - total).toFixed(2)} more for free shipping
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary">
                    ${finalTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => navigate('/checkout')}
                sx={{ mb: 2 }}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/shop')}
              >
                Continue Shopping
              </Button>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;
