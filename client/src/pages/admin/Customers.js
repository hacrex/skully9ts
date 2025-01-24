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
  Grid,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  LocalShipping as ShippingIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../utils/formatters';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`customer-tabpanel-${index}`}
    aria-labelledby={`customer-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `/api/admin/customers?search=${searchQuery}`,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      const data = await response.json();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const handleViewCustomer = async (customerId) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setSelectedCustomer(data);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const handleEmailCustomer = async (email) => {
    // Implement email functionality
    console.log('Email customer:', email);
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
        Customers
      </Typography>

      {/* Search */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />
            }}
          />
        </Grid>
      </Grid>

      {/* Customers Table */}
      <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Orders</TableCell>
              <TableCell align="right">Total Spent</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={customer.avatar}
                      alt={customer.firstName}
                      sx={{ mr: 2 }}
                    />
                    <Typography>
                      {customer.firstName} {customer.lastName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{formatDate(customer.createdAt)}</TableCell>
                <TableCell align="right">{customer.orderCount}</TableCell>
                <TableCell align="right">
                  {formatCurrency(customer.totalSpent)}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleViewCustomer(customer._id)}
                    color="primary"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleEmailCustomer(customer.email)}
                    color="primary"
                  >
                    <EmailIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Customer Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCustomer && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedCustomer.avatar}
                  alt={selectedCustomer.firstName}
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography variant="h6">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {formatDate(selectedCustomer.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              {/* Quick Stats */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Orders
                      </Typography>
                      <Typography variant="h4">
                        {selectedCustomer.orderCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Spent
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(selectedCustomer.totalSpent)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Average Order Value
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(selectedCustomer.averageOrderValue)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                >
                  <Tab label="Orders" />
                  <Tab label="Addresses" />
                  <Tab label="Preferences" />
                </Tabs>
              </Box>

              {/* Orders Tab */}
              <TabPanel value={activeTab} index={0}>
                <List>
                  {selectedCustomer.orders.map((order) => (
                    <ListItem
                      key={order._id}
                      sx={{
                        bgcolor: 'background.paper',
                        mb: 1,
                        borderRadius: 1
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <CartIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>
                              Order #{order._id.slice(-8)}
                            </Typography>
                            <Typography>
                              {formatCurrency(order.total)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2">
                              {formatDate(order.createdAt)}
                            </Typography>
                            <Chip
                              label={order.status.toUpperCase()}
                              size="small"
                              color={
                                order.status === 'delivered'
                                  ? 'success'
                                  : order.status === 'cancelled'
                                  ? 'error'
                                  : 'primary'
                              }
                              sx={{ mt: 1 }}
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>

              {/* Addresses Tab */}
              <TabPanel value={activeTab} index={1}>
                <List>
                  {selectedCustomer.addresses.map((address) => (
                    <ListItem
                      key={address._id}
                      sx={{
                        bgcolor: 'background.paper',
                        mb: 1,
                        borderRadius: 1
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <ShippingIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          address.isDefault && (
                            <Chip
                              label="Default"
                              size="small"
                              color="primary"
                              sx={{ mb: 1 }}
                            />
                          )
                        }
                        secondary={
                          <>
                            <Typography>
                              {address.street}
                            </Typography>
                            <Typography>
                              {address.city}, {address.state} {address.zipCode}
                            </Typography>
                            <Typography>
                              {address.country}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>

              {/* Preferences Tab */}
              <TabPanel value={activeTab} index={2}>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Email Notifications"
                      secondary={selectedCustomer.preferences.emailNotifications ? 'Enabled' : 'Disabled'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Marketing Communications"
                      secondary={selectedCustomer.preferences.marketingEmails ? 'Subscribed' : 'Unsubscribed'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Language"
                      secondary={selectedCustomer.preferences.language || 'English'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Currency"
                      secondary={selectedCustomer.preferences.currency || 'USD'}
                    />
                  </ListItem>
                </List>
              </TabPanel>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Customers;
