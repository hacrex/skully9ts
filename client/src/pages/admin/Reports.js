import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  People as PeopleIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/reports?timeRange=${timeRange}`,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      const data = await response.json();
      setReportData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load report data');
      setLoading(false);
    }
  };

  const handleExportReport = async (reportType) => {
    try {
      setExportLoading(true);
      const response = await fetch(
        `/api/admin/reports/export?type=${reportType}&timeRange=${timeRange}`,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${timeRange}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setExportLoading(false);
    } catch (error) {
      console.error('Error exporting report:', error);
      setError('Failed to export report');
      setExportLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderSalesChart = () => {
    if (!reportData?.salesData) return null;

    const data = {
      labels: reportData.salesData.map(d => formatDate(d.date)),
      datasets: [
        {
          label: 'Revenue',
          data: reportData.salesData.map(d => d.revenue),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Orders',
          data: reportData.salesData.map(d => d.orders),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }
      ]
    };

    return (
      <Box sx={{ height: 400, p: 2 }}>
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top'
              },
              title: {
                display: true,
                text: 'Sales Overview'
              }
            }
          }}
        />
      </Box>
    );
  };

  const renderProductChart = () => {
    if (!reportData?.productData) return null;

    const data = {
      labels: reportData.productData.map(d => d.name),
      datasets: [
        {
          label: 'Units Sold',
          data: reportData.productData.map(d => d.unitsSold),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ]
        }
      ]
    };

    return (
      <Box sx={{ height: 400, p: 2 }}>
        <Bar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top'
              },
              title: {
                display: true,
                text: 'Top Products'
              }
            }
          }}
        />
      </Box>
    );
  };

  const renderCustomerChart = () => {
    if (!reportData?.customerData) return null;

    const data = {
      labels: ['New', 'Returning'],
      datasets: [
        {
          data: [
            reportData.customerData.newCustomers,
            reportData.customerData.returningCustomers
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 99, 132, 0.5)'
          ]
        }
      ]
    };

    return (
      <Box sx={{ height: 300, p: 2 }}>
        <Pie
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top'
              },
              title: {
                display: true,
                text: 'Customer Distribution'
              }
            }
          }}
        />
      </Box>
    );
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
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="h4">
              Reports & Analytics
            </Typography>
          </Grid>
          <Grid item>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                {timeRanges.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchReportData} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Revenue</Typography>
              </Box>
              <Typography variant="h4">
                {formatCurrency(reportData?.metrics?.revenue || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reportData?.metrics?.revenueGrowth > 0 ? '+' : ''}
                {reportData?.metrics?.revenueGrowth}% vs previous period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Orders</Typography>
              </Box>
              <Typography variant="h4">
                {reportData?.metrics?.orders || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reportData?.metrics?.orderGrowth > 0 ? '+' : ''}
                {reportData?.metrics?.orderGrowth}% vs previous period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Customers</Typography>
              </Box>
              <Typography variant="h4">
                {reportData?.metrics?.customers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reportData?.metrics?.customerGrowth > 0 ? '+' : ''}
                {reportData?.metrics?.customerGrowth}% vs previous period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Conversion Rate</Typography>
              </Box>
              <Typography variant="h4">
                {reportData?.metrics?.conversionRate || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reportData?.metrics?.conversionGrowth > 0 ? '+' : ''}
                {reportData?.metrics?.conversionGrowth}% vs previous period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Report Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<MoneyIcon />} label="Sales" />
          <Tab icon={<InventoryIcon />} label="Products" />
          <Tab icon={<PeopleIcon />} label="Customers" />
          <Tab icon={<ShippingIcon />} label="Shipping" />
        </Tabs>
      </Box>

      {/* Export Button */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => handleExportReport(
            ['sales', 'products', 'customers', 'shipping'][tabValue]
          )}
          disabled={exportLoading}
        >
          Export Report
        </Button>
        {exportLoading && (
          <LinearProgress sx={{ mt: 1 }} />
        )}
      </Box>

      {/* Tab Panels */}
      {tabValue === 0 && (
        <Paper sx={{ p: 2 }}>
          {renderSalesChart()}
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Avg. Order Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData?.salesData?.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>{formatDate(row.date)}</TableCell>
                    <TableCell align="right">{row.orders}</TableCell>
                    <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.revenue / row.orders)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 2 }}>
          {renderProductChart()}
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Units Sold</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Profit Margin</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData?.productData?.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{row.unitsSold}</TableCell>
                    <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                    <TableCell align="right">{row.profitMargin}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 2 }}>
          {renderCustomerChart()}
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer Segment</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Avg. Order Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData?.customerSegments?.map((row) => (
                  <TableRow key={row.segment}>
                    <TableCell>{row.segment}</TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                    <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.avgOrderValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 3 && (
        <Paper sx={{ p: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Shipping Method</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Avg. Delivery Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData?.shippingData?.map((row) => (
                  <TableRow key={row.method}>
                    <TableCell>{row.method}</TableCell>
                    <TableCell align="right">{row.orders}</TableCell>
                    <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                    <TableCell align="right">{row.avgDeliveryTime} days</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default Reports;
