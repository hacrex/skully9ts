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
  Switch,
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatDate, formatCurrency } from '../../utils/formatters';

const validationSchema = Yup.object({
  code: Yup.string()
    .required('Code is required')
    .matches(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, numbers, underscores, or hyphens'),
  type: Yup.string().required('Type is required'),
  value: Yup.number()
    .required('Value is required')
    .min(0, 'Value must be positive'),
  minPurchase: Yup.number()
    .required('Minimum purchase is required')
    .min(0, 'Must be positive'),
  maxUses: Yup.number()
    .required('Maximum uses is required')
    .min(1, 'Must be at least 1'),
  startDate: Yup.date()
    .required('Start date is required'),
  endDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('startDate'), 'End date must be after start date'),
  description: Yup.string()
    .required('Description is required')
});

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const statuses = ['all', 'active', 'scheduled', 'expired'];
  const promoTypes = ['percentage', 'fixed', 'shipping'];

  useEffect(() => {
    fetchPromotions();
  }, [searchQuery, statusFilter]);

  const fetchPromotions = async () => {
    try {
      const response = await fetch(
        `/api/admin/promotions?search=${searchQuery}&status=${statusFilter}`,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      const data = await response.json();
      setPromotions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setError('Failed to load promotions');
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      code: '',
      type: '',
      value: '',
      minPurchase: '',
      maxUses: '',
      startDate: '',
      endDate: '',
      description: '',
      isActive: true
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const endpoint = editingPromo
          ? `/api/admin/promotions/${editingPromo._id}`
          : '/api/admin/promotions';
        
        const method = editingPromo ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          setSuccess(editingPromo ? 'Promotion updated successfully' : 'Promotion created successfully');
          handleCloseDialog();
          fetchPromotions();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to save promotion');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  });

  const handleAddPromo = () => {
    setEditingPromo(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleEditPromo = (promo) => {
    setEditingPromo(promo);
    formik.setValues({
      ...promo,
      startDate: promo.startDate.split('T')[0],
      endDate: promo.endDate.split('T')[0]
    });
    setDialogOpen(true);
  };

  const handleDeletePromo = async (promoId) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        const response = await fetch(`/api/admin/promotions/${promoId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (response.ok) {
          setSuccess('Promotion deleted successfully');
          fetchPromotions();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to delete promotion');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPromo(null);
    formik.resetForm();
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setSuccess('Promotion code copied to clipboard');
    setTimeout(() => setSuccess(''), 3000);
  };

  const getStatusChip = (promo) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);

    if (!promo.isActive) {
      return <Chip label="INACTIVE" color="default" size="small" />;
    } else if (now < start) {
      return <Chip label="SCHEDULED" color="info" size="small" />;
    } else if (now > end) {
      return <Chip label="EXPIRED" color="error" size="small" />;
    } else {
      return <Chip label="ACTIVE" color="success" size="small" />;
    }
  };

  const formatValue = (type, value) => {
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'fixed':
        return formatCurrency(value);
      case 'shipping':
        return 'Free Shipping';
      default:
        return value;
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
          Promotions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPromo}
        >
          Add Promotion
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
            placeholder="Search promotions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Promotions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Usage</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {promotions.map((promo) => (
              <TableRow key={promo._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {promo.code}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyCode(promo.code)}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  {promo.type.charAt(0).toUpperCase() + promo.type.slice(1)}
                </TableCell>
                <TableCell>
                  {formatValue(promo.type, promo.value)}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="caption">
                      Start: {formatDate(promo.startDate)}
                    </Typography>
                    <Typography variant="caption">
                      End: {formatDate(promo.endDate)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {promo.usedCount} / {promo.maxUses}
                </TableCell>
                <TableCell>
                  {getStatusChip(promo)}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleEditPromo(promo)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeletePromo(promo._id)}
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
            {editingPromo ? 'Edit Promotion' : 'Add Promotion'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="code"
                  label="Promotion Code"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  error={formik.touched.code && Boolean(formik.errors.code)}
                  helperText={formik.touched.code && formik.errors.code}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formik.values.type}
                    label="Type"
                    onChange={formik.handleChange}
                    error={formik.touched.type && Boolean(formik.errors.type)}
                  >
                    {promoTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="value"
                  label="Value"
                  type="number"
                  value={formik.values.value}
                  onChange={formik.handleChange}
                  error={formik.touched.value && Boolean(formik.errors.value)}
                  helperText={formik.touched.value && formik.errors.value}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {formik.values.type === 'percentage' ? '%' : '$'}
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="minPurchase"
                  label="Minimum Purchase"
                  type="number"
                  value={formik.values.minPurchase}
                  onChange={formik.handleChange}
                  error={formik.touched.minPurchase && Boolean(formik.errors.minPurchase)}
                  helperText={formik.touched.minPurchase && formik.errors.minPurchase}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="maxUses"
                  label="Maximum Uses"
                  type="number"
                  value={formik.values.maxUses}
                  onChange={formik.handleChange}
                  error={formik.touched.maxUses && Boolean(formik.errors.maxUses)}
                  helperText={formik.touched.maxUses && formik.errors.maxUses}
                />
              </Grid>

              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="startDate"
                  label="Start Date"
                  type="date"
                  value={formik.values.startDate}
                  onChange={formik.handleChange}
                  error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                  helperText={formik.touched.startDate && formik.errors.startDate}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon />
                      </InputAdornment>
                    )
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="endDate"
                  label="End Date"
                  type="date"
                  value={formik.values.endDate}
                  onChange={formik.handleChange}
                  error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                  helperText={formik.touched.endDate && formik.errors.endDate}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon />
                      </InputAdornment>
                    )
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
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
              startIcon={editingPromo ? <EditIcon /> : <AddIcon />}
            >
              {editingPromo ? 'Update Promotion' : 'Create Promotion'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Promotions;
