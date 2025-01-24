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
  Autocomplete,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
  Settings as SettingsIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  rate: Yup.number()
    .required('Rate is required')
    .min(0, 'Rate must be positive')
    .max(100, 'Rate cannot exceed 100%'),
  country: Yup.string().required('Country is required'),
  state: Yup.string(),
  category: Yup.string().required('Category is required'),
  description: Yup.string()
});

const TaxManager = () => {
  const [tabValue, setTabValue] = useState(0);
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const categories = [
    'General',
    'Digital Goods',
    'Physical Goods',
    'Services',
    'Shipping',
    'Custom'
  ];

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      const response = await fetch('/api/admin/taxes', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setTaxes(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching taxes:', error);
      setError('Failed to load tax rates');
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      rate: '',
      country: '',
      state: '',
      category: '',
      description: '',
      isActive: true,
      applyToShipping: false,
      isCompound: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const endpoint = editingTax
          ? `/api/admin/taxes/${editingTax._id}`
          : '/api/admin/taxes';
        
        const method = editingTax ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          setSuccess(editingTax ? 'Tax rate updated successfully' : 'Tax rate created successfully');
          handleCloseDialog();
          fetchTaxes();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to save tax rate');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  });

  const handleAddTax = () => {
    setEditingTax(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleEditTax = (tax) => {
    setEditingTax(tax);
    formik.setValues(tax);
    setDialogOpen(true);
  };

  const handleDeleteTax = async (taxId) => {
    if (window.confirm('Are you sure you want to delete this tax rate?')) {
      try {
        const response = await fetch(`/api/admin/taxes/${taxId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (response.ok) {
          setSuccess('Tax rate deleted successfully');
          fetchTaxes();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to delete tax rate');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTax(null);
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
          <Tab icon={<CalculateIcon />} label="Tax Rates" />
          <Tab icon={<PublicIcon />} label="Tax Zones" />
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
              Tax Rates
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTax}
            >
              Add Tax Rate
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Country/State</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Rate</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taxes.map((tax) => (
                  <TableRow key={tax._id}>
                    <TableCell>{tax.name}</TableCell>
                    <TableCell>
                      {tax.country}
                      {tax.state && ` / ${tax.state}`}
                    </TableCell>
                    <TableCell>{tax.category}</TableCell>
                    <TableCell align="right">{tax.rate}%</TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={tax.isActive}
                            onChange={async () => {
                              try {
                                const response = await fetch(
                                  `/api/admin/taxes/${tax._id}/toggle`,
                                  {
                                    method: 'PUT',
                                    headers: {
                                      'x-auth-token': localStorage.getItem('token')
                                    }
                                  }
                                );
                                if (response.ok) {
                                  fetchTaxes();
                                }
                              } catch (error) {
                                console.error('Error toggling status:', error);
                              }
                            }}
                          />
                        }
                        label={tax.isActive ? 'Active' : 'Inactive'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleEditTax(tax)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteTax(tax._id)}
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
            Tax Zones
          </Typography>
          {/* Add tax zone management UI here */}
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h4" sx={{ mb: 4 }}>
            Tax Settings
          </Typography>
          {/* Add global tax settings UI here */}
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
            {editingTax ? 'Edit Tax Rate' : 'Add Tax Rate'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Tax Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="rate"
                  label="Tax Rate"
                  type="number"
                  value={formik.values.rate}
                  onChange={formik.handleChange}
                  error={formik.touched.rate && Boolean(formik.errors.rate)}
                  helperText={formik.touched.rate && formik.errors.rate}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
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
                  name="state"
                  label="State/Province (Optional)"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  error={formik.touched.state && Boolean(formik.errors.state)}
                  helperText={formik.touched.state && formik.errors.state}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formik.values.category}
                    label="Category"
                    onChange={formik.handleChange}
                    error={formik.touched.category && Boolean(formik.errors.category)}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description (Optional)"
                  multiline
                  rows={2}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
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
                      name="applyToShipping"
                      checked={formik.values.applyToShipping}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Apply to Shipping"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isCompound"
                      checked={formik.values.isCompound}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Compound Tax"
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
              startIcon={editingTax ? <EditIcon /> : <AddIcon />}
            >
              {editingTax ? 'Update Tax Rate' : 'Add Tax Rate'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default TaxManager;
