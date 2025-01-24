import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Card,
  CardMedia,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { removeFromCart, updateQuantity } from '../../store/slices/cartSlice';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item.id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card
        sx={{
          display: 'flex',
          mb: 2,
          p: 2,
          bgcolor: 'background.paper',
          position: 'relative'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Product Image */}
          <Grid item xs={4} sm={3}>
            <CardMedia
              component="img"
              sx={{
                width: '100%',
                height: 'auto',
                aspectRatio: '1',
                objectFit: 'cover',
                borderRadius: 1
              }}
              image={item.image}
              alt={item.name}
            />
          </Grid>

          {/* Product Details */}
          <Grid item xs={8} sm={9}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {item.name}
              </Typography>

              {item.customization && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Customization: {item.customization.text}
                </Typography>
              )}

              {/* Price and Quantity Controls */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: 2
                }}
              >
                <Typography variant="h6" color="primary">
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>

                  <TextField
                    size="small"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    inputProps={{
                      min: 1,
                      style: { textAlign: 'center', width: '50px' }
                    }}
                  />

                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                  >
                    <AddIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={handleRemove}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </motion.div>
  );
};

export default CartItem;
