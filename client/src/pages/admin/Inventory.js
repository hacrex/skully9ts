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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatCurrency } from '../../utils/formatters';

const validationSchema = Yup.object({
  sku: Yup.string().required('SKU is required'),
  name: Yup.string().required('Name is required'),
  quantity: Yup.number().required('Quantity is required').min(0, 'Quantity must be non-negative'),
  reorderPoint: Yup.number().required('Reorder point is required').min(0, 'Must be non-negative'),
  location: Yup.string().required('Location is required'),
  supplier: Yup.string().required('Supplier is required'),
  cost: Yup.number().required('Cost is required').min(0, 'Cost must be positive')
});

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const locations = [
    'all',
    'warehouse-a',
    'warehouse-b',
    'store-front'
  ];

  useEffect(() => {
    fetchInventory();
  }, [searchQuery, locationFilter]);

  const fetchInventory = async () => {
    try {
      const response = await fetch(
        `/api/admin/inventory?search=${searchQuery}&location=${locationFilter}`,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      const data = await response.json();
      setInventory(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to load inventory');
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      sku: '',
      name: '',
      quantity: '',
      reorderPoint: '',
      location: '',
      supplier: '',
      cost: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const endpoint = editingItem
          ? `/api/admin/inventory/${editingItem._id}`
          : '/api/admin/inventory';
        
        const method = editingItem ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          setSuccess(editingItem ? 'Item updated successfully' : 'Item added successfully');
          handleCloseDialog();
          fetchInventory();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to save inventory item');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  });

  const handleAddItem = () => {
    setEditingItem(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    formik.setValues(item);
    setDialogOpen(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/admin/inventory/${itemId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (response.ok) {
          setSuccess('Item deleted successfully');
          fetchInventory();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to delete item');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    formik.resetForm();
  };

  const handleAdjustQuantity = async (itemId, adjustment) => {
    try {
      const response = await fetch(`/api/admin/inventory/${itemId}/adjust`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ adjustment })
      });

      if (response.ok) {
        setSuccess('Quantity adjusted successfully');
        fetchInventory();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to adjust quantity');
      }
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
        >
          Add Item
        </Button>
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

      {/* Search and Filter */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              value={locationFilter}
              label="Location"
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Inventory Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell align="right">Cost</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.quantity}
                    <IconButton
                      size="small"
                      onClick={() => handleAdjustQuantity(item._id, 1)}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleAdjustQuantity(item._id, -1)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{item.supplier}</TableCell>
                <TableCell align="right">
                  {formatCurrency(item.cost)}
                </TableCell>
                <TableCell>
                  {item.quantity <= item.reorderPoint ? (
                    <Chip
                      icon={<WarningIcon />}
                      label="Low Stock"
                      color="warning"
                      size="small"
                    />
                  ) : (
                    <Chip
                      label="In Stock"
                      color="success"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleEditItem(item)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteItem(item._id)}
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

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="sku"
                  label="SKU"
                  value={formik.values.sku}
                  onChange={formik.handleChange}
                  error={formik.touched.sku && Boolean(formik.errors.sku)}
                  helperText={formik.touched.sku && formik.errors.sku}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                  helperText={formik.touched.quantity && formik.errors.quantity}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="reorderPoint"
                  label="Reorder Point"
                  type="number"
                  value={formik.values.reorderPoint}
                  onChange={formik.handleChange}
                  error={formik.touched.reorderPoint && Boolean(formik.errors.reorderPoint)}
                  helperText={formik.touched.reorderPoint && formik.errors.reorderPoint}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    name="location"
                    value={formik.values.location}
                    label="Location"
                    onChange={formik.handleChange}
                    error={formik.touched.location && Boolean(formik.errors.location)}
                  >
                    {locations.slice(1).map((location) => (
                      <MenuItem key={location} value={location}>
                        {location.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="supplier"
                  label="Supplier"
                  value={formik.values.supplier}
                  onChange={formik.handleChange}
                  error={formik.touched.supplier && Boolean(formik.errors.supplier)}
                  helperText={formik.touched.supplier && formik.errors.supplier}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="cost"
                  label="Cost"
                  type="number"
                  value={formik.values.cost}
                  onChange={formik.handleChange}
                  error={formik.touched.cost && Boolean(formik.errors.cost)}
                  helperText={formik.touched.cost && formik.errors.cost}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
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
              startIcon={editingItem ? <RefreshIcon /> : <AddIcon />}
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Inventory;
