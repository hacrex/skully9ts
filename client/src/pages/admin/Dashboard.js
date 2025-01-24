import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/formatters';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }),
        fetch('/api/admin/orders/recent', {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        })
      ]);

      const statsData = await statsResponse.json();
      const ordersData = await ordersResponse.json();

      setStats(statsData);
      setRecentOrders(ordersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const salesData = {
    labels: stats.salesChart.labels,
    datasets: [
      {
        label: 'Sales',
        data: stats.salesChart.data,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const salesOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Sales Overview'
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                  <Typography variant="body2">Total Revenue</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CartIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.totalOrders}
                  </Typography>
                  <Typography variant="body2">Total Orders</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.totalCustomers}
                  </Typography>
                  <Typography variant="body2">Total Customers</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ArticleIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.totalProducts}
                  </Typography>
                  <Typography variant="body2">Total Products</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Lists */}
      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Sales Overview
            </Typography>
            <Line data={salesData} options={salesOptions} />
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <List>
              {recentOrders.map((order) => (
                <React.Fragment key={order._id}>
                  <ListItem>
                    <ListItemText
                      primary={`Order #${order._id.slice(-8)}`}
                      secondary={`${order.items.length} items - ${formatCurrency(order.total)}`}
                    />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: (() => {
                            switch (order.status) {
                              case 'pending':
                                return 'warning.light';
                              case 'processing':
                                return 'info.light';
                              case 'shipped':
                                return 'primary.light';
                              case 'delivered':
                                return 'success.light';
                              default:
                                return 'grey.light';
                            }
                          })(),
                          color: (() => {
                            switch (order.status) {
                              case 'pending':
                                return 'warning.dark';
                              case 'processing':
                                return 'info.dark';
                              case 'shipped':
                                return 'primary.dark';
                              case 'delivered':
                                return 'success.dark';
                              default:
                                return 'grey.dark';
                            }
                          })()
                        }}
                      >
                        {order.status.toUpperCase()}
                      </Typography>
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              href="/admin/orders"
            >
              View All Orders
            </Button>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Top Products
            </Typography>
            <List>
              {stats.topProducts.map((product) => (
                <ListItem key={product._id}>
                  <ListItemText
                    primary={product.name}
                    secondary={`${product.sales} sales`}
                  />
                  <Typography color="primary">
                    {formatCurrency(product.revenue)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Customer Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Customer Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary">
                    {stats.customerStats.newCustomers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Customers
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary">
                    {stats.customerStats.repeatCustomers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Repeat Customers
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary">
                    {stats.customerStats.averageOrderValue}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Order Value
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary">
                    {stats.customerStats.conversionRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conversion Rate
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
