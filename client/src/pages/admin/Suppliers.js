import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Rating,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatCurrency, formatDate } from '../../utils/formatters';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone is required'),
  address: Yup.string().required('Address is required'),
  country: Yup.string().required('Country is required'),
  paymentTerms: Yup.string().required('Payment terms are required'),
  minimumOrder: Yup.number().min(0, 'Must be positive'),
  leadTime: Yup.number().min(1, 'Must be at least 1 day')
});

const Suppliers = () => {
  const [tabValue, setTabValue] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierStats, setSupplierStats] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/admin/suppliers', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setSuppliers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Failed to load suppliers');
      setLoading(false);
    }
  };

  const fetchSupplierStats = async (supplierId) => {
    try {
      const response = await fetch(`/api/admin/suppliers/${supplierId}/stats`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setSupplierStats(data);
    } catch (error) {
      console.error('Error fetching supplier stats:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      country: '',
      website: '',
      paymentTerms: '',
      minimumOrder: '',
      leadTime: '',
      notes: '',
      isActive: true
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const endpoint = editingSupplier
          ? `/api/admin/suppliers/${editingSupplier._id}`
          : '/api/admin/suppliers';
        
        const method = editingSupplier ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          setSuccess(editingSupplier ? 'Supplier updated successfully' : 'Supplier added successfully');
          handleCloseDialog();
          fetchSuppliers();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to save supplier');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  });

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    formik.setValues(supplier);
    setDialogOpen(true);
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await fetch(`/api/admin/suppliers/${supplierId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (response.ok) {
          setSuccess('Supplier deleted successfully');
          fetchSuppliers();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to delete supplier');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSupplier(null);
    formik.resetForm();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
    fetchSupplierStats(supplier._id);
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
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<BusinessIcon />} label="Suppliers" />
          <Tab icon={<AssessmentIcon />} label="Performance" />
          <Tab icon={<InventoryIcon />} label="Products" />
        </Tabs>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {tabValue === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h4">
              Suppliers
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSupplier}
            >
              Add Supplier
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={selectedSupplier ? 7 : 12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Performance</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow
                        key={supplier._id}
                        hover
                        onClick={() => handleSupplierSelect(supplier)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={supplier.logo}>
                              {supplier.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {supplier.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {supplier.isActive ? 'Active' : 'Inactive'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                              {supplier.email}
                            </Typography>
                            <Typography variant="body2">
                              <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                              {supplier.phone}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                            {supplier.country}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Rating
                            value={supplier.rating || 0}
                            readOnly
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSupplier(supplier);
                            }}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSupplier(supplier._id);
                            }}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {selectedSupplier && (
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Supplier Details
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <BusinessIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Company"
                        secondary={selectedSupplier.name}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <MoneyIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Payment Terms"
                        secondary={selectedSupplier.paymentTerms}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <ShippingIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Lead Time"
                        secondary={`${selectedSupplier.leadTime} days`}
                      />
                    </ListItem>
                  </List>

                  {supplierStats && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Performance Metrics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Card>
                            <CardContent>
                              <Typography color="text.secondary" gutterBottom>
                                On-Time Delivery
                              </Typography>
                              <Typography variant="h5">
                                {supplierStats.onTimeDelivery}%
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card>
                            <CardContent>
                              <Typography color="text.secondary" gutterBottom>
                                Quality Rating
                              </Typography>
                              <Typography variant="h5">
                                {supplierStats.qualityRating}%
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card>
                            <CardContent>
                              <Typography color="text.secondary" gutterBottom>
                                Response Time
                              </Typography>
                              <Typography variant="h5">
                                {supplierStats.responseTime} hrs
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card>
                            <CardContent>
                              <Typography color="text.secondary" gutterBottom>
                                Order Accuracy
                              </Typography>
                              <Typography variant="h5">
                                {supplierStats.orderAccuracy}%
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h4" sx={{ mb: 4 }}>
            Supplier Performance
          </Typography>
          {/* Add supplier performance analytics UI here */}
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h4" sx={{ mb: 4 }}>
            Supplier Products
          </Typography>
          {/* Add supplier products UI here */}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Company Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="website"
                  label="Website"
                  value={formik.values.website}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  multiline
                  rows={2}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="country"
                  label="Country"
                  value={formik.values.country}
                  onChange={formik.handleChange}
                  error={formik.touched.country && Boolean(formik.errors.country)}
                  helperText={formik.touched.country && formik.errors.country}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="paymentTerms"
                  label="Payment Terms"
                  value={formik.values.paymentTerms}
                  onChange={formik.handleChange}
                  error={formik.touched.paymentTerms && Boolean(formik.errors.paymentTerms)}
                  helperText={formik.touched.paymentTerms && formik.errors.paymentTerms}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="minimumOrder"
                  label="Minimum Order Value"
                  type="number"
                  value={formik.values.minimumOrder}
                  onChange={formik.handleChange}
                  error={formik.touched.minimumOrder && Boolean(formik.errors.minimumOrder)}
                  helperText={formik.touched.minimumOrder && formik.errors.minimumOrder}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="leadTime"
                  label="Lead Time (Days)"
                  type="number"
                  value={formik.values.leadTime}
                  onChange={formik.handleChange}
                  error={formik.touched.leadTime && Boolean(formik.errors.leadTime)}
                  helperText={formik.touched.leadTime && formik.errors.leadTime}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="notes"
                  label="Notes"
                  multiline
                  rows={3}
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={editingSupplier ? <EditIcon /> : <AddIcon />}
            >
              {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Suppliers;
