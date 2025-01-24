import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircleOutline as SuccessIcon,
  LocalShipping as ShippingIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';

const OrderConfirmation = ({ order }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          mb: 4
        }}
      >
        <motion.div variants={itemVariants}>
          <SuccessIcon
            color="success"
            sx={{ fontSize: 64, mb: 2 }}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom>
            Thank You For Your Order!
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Order #{order._id.slice(-8)}
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography color="text.secondary" paragraph>
            We'll send you a confirmation email with your order details and tracking information.
          </Typography>
        </motion.div>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <motion.div variants={itemVariants}>
            <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" gutterBottom>
                Order Details
              </Typography>

              <Grid container spacing={2}>
                {order.items.map((item) => (
                  <Grid item xs={12} key={item._id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>
                        {item.quantity}x {item.product.name}
                        {item.customization && (
                          <Typography variant="body2" color="text.secondary">
                            Customization: {item.customization.text}
                          </Typography>
                        )}
                      </Typography>
                      <Typography>
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal</Typography>
                    <Typography>{formatCurrency(order.subtotal)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Shipping</Typography>
                    <Typography>
                      {order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tax</Typography>
                    <Typography>{formatCurrency(order.tax)}</Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(order.total)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShippingIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Shipping Information
                </Typography>
              </Box>

              <Typography paragraph>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Estimated Delivery: 3-5 Business Days
              </Typography>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Order Updates
                </Typography>
              </Box>

              <Typography paragraph>
                We'll send order updates and tracking information to:
              </Typography>

              <Typography color="primary" gutterBottom>
                {order.email}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                You can also track your order in your account dashboard
              </Typography>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          mt: 4,
          flexDirection: isMobile ? 'column' : 'row'
        }}
      >
        <Button
          variant="contained"
          onClick={() => navigate('/profile')}
          sx={{ minWidth: 200 }}
        >
          View Order Status
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate('/shop')}
          sx={{ minWidth: 200 }}
        >
          Continue Shopping
        </Button>
      </Box>
    </motion.div>
  );
};

export default OrderConfirmation;
