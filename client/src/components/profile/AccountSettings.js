import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const AccountSettings = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(true);

  const profileFormik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      phone: Yup.string().required('Phone number is required')
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
      } catch (error) {
        console.error('Failed to update profile:', error);
      }
    }
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm password is required')
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch('/api/users/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword
          })
        });

        if (response.ok) {
          setShowPasswordDialog(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          passwordFormik.resetForm();
        }
      } catch (error) {
        console.error('Failed to update password:', error);
      }
    }
  });

  const handleNotificationChange = async (type, value) => {
    try {
      await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
          [type]: value
        })
      });

      if (type === 'emailNotifications') {
        setEmailNotifications(value);
      } else if (type === 'marketingEmails') {
        setMarketingEmails(value);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  return (
    <Box>
      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Changes saved successfully!
        </Alert>
      )}

      {/* Profile Information */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          Profile Information
        </Typography>
        
        <form onSubmit={profileFormik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                value={profileFormik.values.firstName}
                onChange={profileFormik.handleChange}
                error={profileFormik.touched.firstName && Boolean(profileFormik.errors.firstName)}
                helperText={profileFormik.touched.firstName && profileFormik.errors.firstName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                value={profileFormik.values.lastName}
                onChange={profileFormik.handleChange}
                error={profileFormik.touched.lastName && Boolean(profileFormik.errors.lastName)}
                helperText={profileFormik.touched.lastName && profileFormik.errors.lastName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={profileFormik.values.email}
                onChange={profileFormik.handleChange}
                error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                helperText={profileFormik.touched.email && profileFormik.errors.email}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="phone"
                label="Phone Number"
                value={profileFormik.values.phone}
                onChange={profileFormik.handleChange}
                error={profileFormik.touched.phone && Boolean(profileFormik.errors.phone)}
                helperText={profileFormik.touched.phone && profileFormik.errors.phone}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button type="submit" variant="contained">
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Password */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          Password
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Change your password to keep your account secure
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setShowPasswordDialog(true)}
        >
          Change Password
        </Button>
      </Paper>

      {/* Notification Preferences */}
      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          Notification Preferences
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={emailNotifications}
                onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
              />
            }
            label="Order Updates & Shipping Notifications"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            Receive updates about your orders and shipping status
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={marketingEmails}
                onChange={(e) => handleNotificationChange('marketingEmails', e.target.checked)}
              />
            }
            label="Marketing Communications"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            Receive news about new products, sales, and special offers
          </Typography>
        </Box>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={passwordFormik.handleSubmit}>
          <DialogTitle>Change Password</DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                  helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type="password"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                  helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                  helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Change Password
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AccountSettings;
