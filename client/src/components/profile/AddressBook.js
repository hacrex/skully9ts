import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const addressValidationSchema = Yup.object({
  street: Yup.string().required('Street address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zipCode: Yup.string().required('ZIP code is required'),
  country: Yup.string().required('Country is required'),
  isDefault: Yup.boolean()
});

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const formik = useFormik({
    initialValues: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false
    },
    validationSchema: addressValidationSchema,
    onSubmit: async (values) => {
      try {
        const endpoint = editingAddress
          ? `/api/users/addresses/${editingAddress._id}`
          : '/api/users/addresses';
        
        const method = editingAddress ? 'PUT' : 'POST';
        
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          const updatedAddress = await response.json();
          if (editingAddress) {
            setAddresses(addresses.map(addr =>
              addr._id === editingAddress._id ? updatedAddress : addr
            ));
          } else {
            setAddresses([...addresses, updatedAddress]);
          }
          handleCloseDialog();
        }
      } catch (error) {
        console.error('Failed to save address:', error);
      }
    }
  });

  const handleAddAddress = () => {
    setEditingAddress(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    formik.setValues(address);
    setDialogOpen(true);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await fetch(`/api/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      if (response.ok) {
        setAddresses(addresses.filter(addr => addr._id !== addressId));
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAddress(null);
    formik.resetForm();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Saved Addresses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAddress}
        >
          Add New Address
        </Button>
      </Box>

      <Grid container spacing={3}>
        {addresses.map((address) => (
          <Grid item xs={12} sm={6} key={address._id}>
            <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {address.isDefault && (
                      <Typography
                        component="span"
                        color="primary"
                        sx={{ mr: 1, fontSize: '0.875rem' }}
                      >
                        (Default)
                      </Typography>
                    )}
                    Shipping Address
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditAddress(address)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteAddress(address._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2">
                  {address.street}<br />
                  {address.city}, {address.state} {address.zipCode}<br />
                  {address.country}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Address Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="street"
                  label="Street Address"
                  value={formik.values.street}
                  onChange={formik.handleChange}
                  error={formik.touched.street && Boolean(formik.errors.street)}
                  helperText={formik.touched.street && formik.errors.street}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="city"
                  label="City"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  error={formik.touched.city && Boolean(formik.errors.city)}
                  helperText={formik.touched.city && formik.errors.city}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="state"
                  label="State"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  error={formik.touched.state && Boolean(formik.errors.state)}
                  helperText={formik.touched.state && formik.errors.state}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="zipCode"
                  label="ZIP Code"
                  value={formik.values.zipCode}
                  onChange={formik.handleChange}
                  error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
                  helperText={formik.touched.zipCode && formik.errors.zipCode}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
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
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isDefault"
                      checked={formik.values.isDefault}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Set as default address"
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingAddress ? 'Save Changes' : 'Add Address'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AddressBook;
