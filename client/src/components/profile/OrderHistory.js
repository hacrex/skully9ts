import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Card,
  CardMedia,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'error'
    };
    return statusColors[status] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  if (orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          No Orders Yet
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Start shopping to see your order history here
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href="/shop"
          sx={{ mt: 2 }}
        >
          Shop Now
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {orders.map((order) => (
        <Accordion key={order._id} sx={{ mb: 2, bgcolor: 'background.paper' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Order #{order._id.slice(-8)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Chip
                  label={order.status.toUpperCase()}
                  color={getStatusColor(order.status)}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" align="right">
                  ${order.total.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Order Items */}
              <Grid item xs={12}>
                {order.items.map((item) => (
                  <Box key={item._id} sx={{ mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={3} sm={2}>
                        <Card>
                          <CardMedia
                            component="img"
                            image={item.product.images[0]}
                            alt={item.product.name}
                            sx={{ aspectRatio: '1' }}
                          />
                        </Card>
                      </Grid>
                      
                      <Grid item xs={9} sm={10}>
                        <Typography variant="subtitle1">
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {item.quantity} × ${item.price.toFixed(2)}
                        </Typography>
                        {item.customization && (
                          <Typography variant="body2" color="text.secondary">
                            Customization: {item.customization.text}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Shipping Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Shipping Details
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ShippingIcon sx={{ mr: 1 }} />
                  {order.tracking ? (
                    <Typography>
                      Tracking: {order.tracking.number}
                      <Button
                        href={order.tracking.url}
                        target="_blank"
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        Track
                      </Button>
                    </Typography>
                  ) : (
                    <Typography color="text.secondary">
                      Tracking information will be available soon
                    </Typography>
                  )}
                </Box>
                <Typography variant="body2">
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                  {order.shippingAddress.country}
                </Typography>
              </Grid>

              {/* Order Summary */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal</Typography>
                  <Typography>${order.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Shipping</Typography>
                  <Typography>${order.shippingCost.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax</Typography>
                  <Typography>${order.tax.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1">Total</Typography>
                  <Typography variant="subtitle1" color="primary">
                    ${order.total.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default OrderHistory;
