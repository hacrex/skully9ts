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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as ShippingIcon,
  Settings as SettingsIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatCurrency } from '../../utils/formatters';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  carrier: Yup.string().required('Carrier is required'),
  rate: Yup.number().required('Rate is required').min(0, 'Rate must be positive'),
  estimatedDays: Yup.number().required('Estimated days is required').min(1, 'Must be at least 1 day'),
  regions: Yup.array().min(1, 'At least one region must be selected'),
  weightLimit: Yup.number().required('Weight limit is required').min(0, 'Must be positive'),
  restrictions: Yup.string()
});

const Shipping = () => {
  const [tabValue, setTabValue] = useState(0);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const carriers = ['FedEx', 'UPS', 'USPS', 'DHL'];
  const regions = [
    'North America',
    'South America',
    'Europe',
    'Asia',
    'Africa',
    'Oceania'
  ];

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    try {
      const response = await fetch('/api/admin/shipping', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setMethods(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      setError('Failed to load shipping methods');
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      carrier: '',
      rate: '',
      estimatedDays: '',
      regions: [],
      weightLimit: '',
      restrictions: '',
      isActive: true,
      isFreeShipping: false,
      hasTracking: true
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const endpoint = editingMethod
          ? `/api/admin/shipping/${editingMethod._id}`
          : '/api/admin/shipping';
        
        const method = editingMethod ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          setSuccess(editingMethod ? 'Method updated successfully' : 'Method created successfully');
          handleCloseDialog();
          fetchShippingMethods();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to save shipping method');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  });

  const handleAddMethod = () => {
    setEditingMethod(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleEditMethod = (method) => {
    setEditingMethod(method);
    formik.setValues(method);
    setDialogOpen(true);
  };

  const handleDeleteMethod = async (methodId) => {
    if (window.confirm('Are you sure you want to delete this shipping method?')) {
      try {
        const response = await fetch(`/api/admin/shipping/${methodId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (response.ok) {
          setSuccess('Shipping method deleted successfully');
          fetchShippingMethods();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to delete shipping method');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMethod(null);
    formik.resetForm();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
          <Tab icon={<ShippingIcon />} label="Shipping Methods" />
          <Tab icon={<MapIcon />} label="Zones & Rates" />
          <Tab icon={<SettingsIcon />} label="Settings" />
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
              Shipping Methods
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddMethod}
            >
              Add Method
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Carrier</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Estimated Days</TableCell>
                  <TableCell>Regions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {methods.map((method) => (
                  <TableRow key={method._id}>
                    <TableCell>{method.name}</TableCell>
                    <TableCell>{method.carrier}</TableCell>
                    <TableCell>
                      {method.isFreeShipping ? 'Free' : formatCurrency(method.rate)}
                    </TableCell>
                    <TableCell>{method.estimatedDays} days</TableCell>
                    <TableCell>
                      {method.regions.join(', ')}
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={method.isActive}
                            onChange={async () => {
                              try {
                                const response = await fetch(
                                  `/api/admin/shipping/${method._id}/toggle`,
                                  {
                                    method: 'PUT',
                                    headers: {
                                      'x-auth-token': localStorage.getItem('token')
                                    }
                                  }
                                );
                                if (response.ok) {
                                  fetchShippingMethods();
                                }
                              } catch (error) {
                                console.error('Error toggling status:', error);
                              }
                            }}
                          />
                        }
                        label={method.isActive ? 'Active' : 'Inactive'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleEditMethod(method)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteMethod(method._id)}
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
        </>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h4" sx={{ mb: 4 }}>
            Shipping Zones & Rates
          </Typography>
          {/* Add zone management UI here */}
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h4" sx={{ mb: 4 }}>
            Shipping Settings
          </Typography>
          {/* Add global shipping settings UI here */}
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
            {editingMethod ? 'Edit Shipping Method' : 'Add Shipping Method'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Method Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Carrier</InputLabel>
                  <Select
                    name="carrier"
                    value={formik.values.carrier}
                    label="Carrier"
                    onChange={formik.handleChange}
                    error={formik.touched.carrier && Boolean(formik.errors.carrier)}
                  >
                    {carriers.map((carrier) => (
                      <MenuItem key={carrier} value={carrier}>
                        {carrier}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="rate"
                  label="Rate"
                  type="number"
                  value={formik.values.rate}
                  onChange={formik.handleChange}
                  error={formik.touched.rate && Boolean(formik.errors.rate)}
                  helperText={formik.touched.rate && formik.errors.rate}
                  disabled={formik.values.isFreeShipping}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="estimatedDays"
                  label="Estimated Days"
                  type="number"
                  value={formik.values.estimatedDays}
                  onChange={formik.handleChange}
                  error={formik.touched.estimatedDays && Boolean(formik.errors.estimatedDays)}
                  helperText={formik.touched.estimatedDays && formik.errors.estimatedDays}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={regions}
                  value={formik.values.regions}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('regions', newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Regions"
                      error={formik.touched.regions && Boolean(formik.errors.regions)}
                      helperText={formik.touched.regions && formik.errors.regions}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="weightLimit"
                  label="Weight Limit (kg)"
                  type="number"
                  value={formik.values.weightLimit}
                  onChange={formik.handleChange}
                  error={formik.touched.weightLimit && Boolean(formik.errors.weightLimit)}
                  helperText={formik.touched.weightLimit && formik.errors.weightLimit}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="restrictions"
                  label="Restrictions"
                  multiline
                  rows={2}
                  value={formik.values.restrictions}
                  onChange={formik.handleChange}
                  error={formik.touched.restrictions && Boolean(formik.errors.restrictions)}
                  helperText={formik.touched.restrictions && formik.errors.restrictions}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={formik.values.isActive}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Active"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isFreeShipping"
                      checked={formik.values.isFreeShipping}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Free Shipping"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="hasTracking"
                      checked={formik.values.hasTracking}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Tracking Available"
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
              startIcon={editingMethod ? <EditIcon /> : <AddIcon />}
            >
              {editingMethod ? 'Update Method' : 'Add Method'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Shipping;
