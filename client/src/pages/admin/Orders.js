import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const orderStatuses = [
    'all',
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ];

  useEffect(() => {
    fetchOrders();
  }, [searchQuery, statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `/api/admin/orders?search=${searchQuery}&status=${statusFilter}`,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleTrackingUpdate = async (orderId, trackingInfo) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(trackingInfo)
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating tracking info:', error);
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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Orders
      </Typography>

      {/* Search and Filter */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            {orderStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>#{order._id.slice(-8)}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  {order.user.firstName} {order.user.lastName}
                </TableCell>
                <TableCell>{order.items.length} items</TableCell>
                <TableCell align="right">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.status.toUpperCase()}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleViewOrder(order)}
                    color="primary"
                  >
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              Order #{selectedOrder._id.slice(-8)}
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                {/* Order Status */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle1">
                      Status:
                    </Typography>
                    <TextField
                      select
                      size="small"
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    >
                      {orderStatuses.slice(1).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Grid>

                {/* Customer Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Customer Information
                  </Typography>
                  <Typography>
                    {selectedOrder.user.firstName} {selectedOrder.user.lastName}
                  </Typography>
                  <Typography>
                    {selectedOrder.user.email}
                  </Typography>
                  <Typography>
                    {selectedOrder.user.phone}
                  </Typography>
                </Grid>

                {/* Shipping Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Shipping Information
                  </Typography>
                  <Typography>
                    {selectedOrder.shippingAddress.street}
                  </Typography>
                  <Typography>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                  </Typography>
                  <Typography>
                    {selectedOrder.shippingAddress.country}
                  </Typography>
                </Grid>

                {/* Tracking Info */}
                {selectedOrder.status === 'shipped' && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ShippingIcon />
                      <TextField
                        size="small"
                        label="Tracking Number"
                        value={selectedOrder.tracking?.number || ''}
                        onChange={(e) => handleTrackingUpdate(selectedOrder._id, {
                          number: e.target.value,
                          url: selectedOrder.tracking?.url
                        })}
                      />
                      <TextField
                        size="small"
                        label="Tracking URL"
                        value={selectedOrder.tracking?.url || ''}
                        onChange={(e) => handleTrackingUpdate(selectedOrder._id, {
                          number: selectedOrder.tracking?.number,
                          url: e.target.value
                        })}
                      />
                    </Box>
                  </Grid>
                )}

                {/* Order Items */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Order Items
                  </Typography>
                  <List>
                    {selectedOrder.items.map((item) => (
                      <React.Fragment key={item._id}>
                        <ListItem>
                          <Box
                            component="img"
                            src={item.product.images[0]}
                            alt={item.product.name}
                            sx={{ width: 50, height: 50, objectFit: 'cover', mr: 2 }}
                          />
                          <ListItemText
                            primary={item.product.name}
                            secondary={
                              <>
                                Quantity: {item.quantity}
                                {item.customization && (
                                  <Typography variant="body2" color="text.secondary">
                                    Customization: {item.customization.text}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                          <Typography>
                            {formatCurrency(item.price * item.quantity)}
                          </Typography>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </Grid>

                {/* Order Summary */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                    <Typography>
                      Subtotal: {formatCurrency(selectedOrder.subtotal)}
                    </Typography>
                    <Typography>
                      Shipping: {formatCurrency(selectedOrder.shippingCost)}
                    </Typography>
                    <Typography>
                      Tax: {formatCurrency(selectedOrder.tax)}
                    </Typography>
                    <Typography variant="h6">
                      Total: {formatCurrency(selectedOrder.total)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Orders;
