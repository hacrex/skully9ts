import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CartItem from './cart/CartItem';
import { toggleCart } from '../store/slices/uiSlice';
import { formatPrice } from '../utils/formatters';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const { isCartOpen } = useSelector(state => state.ui);
  const { items, loading, error } = useSelector(state => state.cart);
  
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleClose = () => {
    dispatch(toggleCart(false));
  };

  const handleCheckout = () => {
    // Add checkout logic
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => dispatch(fetchCart())}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    if (items.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography color="text.secondary" paragraph>
            Add some products to your cart and they will show up here
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleClose}
          >
            Continue Shopping
          </Button>
        </Box>
      );
    }

    return (
      <>
        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
          {items.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </List>

        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1">
              Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              {formatPrice(totalAmount)}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth
            onClick={handleCheckout}
            disabled={loading}
          >
            Proceed to Checkout
          </Button>
        </Box>
      </>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%'
      }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6">Shopping Cart</Typography>
          <IconButton onClick={handleClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        {renderContent()}
      </Box>
    </Drawer>
  );
};

CartDrawer.propTypes = {
  // Add props if needed in the future
};

export default CartDrawer;