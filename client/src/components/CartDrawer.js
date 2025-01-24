import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  TextField,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart,
  LocalShipping
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const CartDrawer = ({
  open,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  subtotal = 0,
  shipping = 0,
  tax = 0
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const total = subtotal + shipping + tax;
  const freeShippingThreshold = 50;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 400,
          bgcolor: 'background.default'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCart />
            Shopping Cart ({cartItems.length})
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Free Shipping Progress */}
        {remainingForFreeShipping > 0 && (
          <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocalShipping />
              <Typography variant="body2">
                Add ${remainingForFreeShipping.toFixed(2)} more for FREE shipping!
              </Typography>
            </Box>
            <Box
              sx={{
                height: 4,
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${(subtotal / freeShippingThreshold) * 100}%`,
                  bgcolor: 'primary.contrastText',
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
          </Box>
        )}

        {/* Cart Items */}
        {cartItems.length > 0 ? (
          <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
            {cartItems.map((item) => (
              <ListItem
                key={item._id}
                sx={{
                  py: 2,
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={item.image}
                    alt={item.name}
                    sx={{ width: 80, height: 80, mr: 2 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      component={Link}
                      to={`/product/${item._id}`}
                      onClick={onClose}
                      sx={{
                        textDecoration: 'none',
                        color: 'text.primary',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      {item.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Size: {item.size}
                      </Typography>
                      <Typography variant="subtitle2" color="primary" sx={{ mt: 0.5 }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          size="small"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value > 0) {
                              onUpdateQuantity(item._id, value);
                            }
                          }}
                          inputProps={{
                            min: 1,
                            style: { textAlign: 'center', width: 40 }
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onRemoveItem(item._id)}
                          sx={{ ml: 'auto', color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              textAlign: 'center'
            }}
          >
            <ShoppingCart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Looks like you haven't added anything to your cart yet.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/products"
              onClick={onClose}
            >
              Start Shopping
            </Button>
          </Box>
        )}

        {/* Summary */}
        {cartItems.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography variant="body2">
                  ${subtotal.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Shipping
                </Typography>
                <Typography variant="body2">
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Tax
                </Typography>
                <Typography variant="body2">
                  ${tax.toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">
                  Total
                </Typography>
                <Typography variant="subtitle1" color="primary">
                  ${total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              fullWidth
              component={Link}
              to="/checkout"
              onClick={onClose}
            >
              Proceed to Checkout
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
