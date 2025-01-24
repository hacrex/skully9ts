import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';
import {
  Line,
  Bar,
  Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setAnalyticsData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const revenueData = {
    labels: analyticsData.revenue.labels,
    datasets: [
      {
        label: 'Revenue',
        data: analyticsData.revenue.data,
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  };

  const ordersData = {
    labels: analyticsData.orders.labels,
    datasets: [
      {
        label: 'Orders',
        data: analyticsData.orders.data,
        backgroundColor: 'rgba(54, 162, 235, 0.8)'
      }
    ]
  };

  const categoryData = {
    labels: analyticsData.categories.labels,
    datasets: [
      {
        data: analyticsData.categories.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">
          Analytics
        </Typography>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
            <MenuItem value="1y">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">
                {formatCurrency(analyticsData.stats.totalRevenue)}
              </Typography>
              <Typography
                color={analyticsData.stats.revenueGrowth >= 0 ? 'success.main' : 'error.main'}
                variant="body2"
              >
                {analyticsData.stats.revenueGrowth >= 0 ? '+' : ''}
                {analyticsData.stats.revenueGrowth}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">
                {analyticsData.stats.totalOrders}
              </Typography>
              <Typography
                color={analyticsData.stats.ordersGrowth >= 0 ? 'success.main' : 'error.main'}
                variant="body2"
              >
                {analyticsData.stats.ordersGrowth >= 0 ? '+' : ''}
                {analyticsData.stats.ordersGrowth}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Order Value
              </Typography>
              <Typography variant="h4">
                {formatCurrency(analyticsData.stats.averageOrderValue)}
              </Typography>
              <Typography
                color={analyticsData.stats.aovGrowth >= 0 ? 'success.main' : 'error.main'}
                variant="body2"
              >
                {analyticsData.stats.aovGrowth >= 0 ? '+' : ''}
                {analyticsData.stats.aovGrowth}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h4">
                {analyticsData.stats.conversionRate}%
              </Typography>
              <Typography
                color={analyticsData.stats.conversionGrowth >= 0 ? 'success.main' : 'error.main'}
                variant="body2"
              >
                {analyticsData.stats.conversionGrowth >= 0 ? '+' : ''}
                {analyticsData.stats.conversionGrowth}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Over Time
            </Typography>
            <Line data={revenueData} options={chartOptions} />
          </Paper>
        </Grid>

        {/* Orders Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Orders Over Time
            </Typography>
            <Bar data={ordersData} options={chartOptions} />
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Sales by Category
            </Typography>
            <Doughnut data={categoryData} options={chartOptions} />
          </Paper>
        </Grid>

        {/* Additional Stats */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary" gutterBottom>
                  Customer Acquisition Cost
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(analyticsData.stats.customerAcquisitionCost)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary" gutterBottom>
                  Customer Lifetime Value
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(analyticsData.stats.customerLifetimeValue)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary" gutterBottom>
                  Return Rate
                </Typography>
                <Typography variant="h6">
                  {analyticsData.stats.returnRate}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary" gutterBottom>
                  Repeat Purchase Rate
                </Typography>
                <Typography variant="h6">
                  {analyticsData.stats.repeatPurchaseRate}%
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
