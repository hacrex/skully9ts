import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`settings-tabpanel-${index}`}
    aria-labelledby={`settings-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setSettings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings');
      setLoading(false);
    }
  };

  const generalFormik = useFormik({
    initialValues: {
      storeName: settings?.general.storeName || '',
      storeEmail: settings?.general.storeEmail || '',
      supportEmail: settings?.general.supportEmail || '',
      phoneNumber: settings?.general.phoneNumber || '',
      address: settings?.general.address || '',
      currency: settings?.general.currency || 'USD',
      timezone: settings?.general.timezone || 'UTC'
    },
    validationSchema: Yup.object({
      storeName: Yup.string().required('Store name is required'),
      storeEmail: Yup.string().email('Invalid email').required('Store email is required'),
      supportEmail: Yup.string().email('Invalid email').required('Support email is required'),
      phoneNumber: Yup.string().required('Phone number is required'),
      address: Yup.string().required('Address is required'),
      currency: Yup.string().required('Currency is required'),
      timezone: Yup.string().required('Timezone is required')
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch('/api/admin/settings/general', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          throw new Error('Failed to update settings');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    },
    enableReinitialize: true
  });

  const emailFormik = useFormik({
    initialValues: {
      smtpHost: settings?.email.smtpHost || '',
      smtpPort: settings?.email.smtpPort || '',
      smtpUser: settings?.email.smtpUser || '',
      smtpPassword: settings?.email.smtpPassword || '',
      enableSSL: settings?.email.enableSSL || false,
      fromName: settings?.email.fromName || '',
      fromEmail: settings?.email.fromEmail || ''
    },
    validationSchema: Yup.object({
      smtpHost: Yup.string().required('SMTP host is required'),
      smtpPort: Yup.number().required('SMTP port is required'),
      smtpUser: Yup.string().required('SMTP user is required'),
      smtpPassword: Yup.string().required('SMTP password is required'),
      fromName: Yup.string().required('From name is required'),
      fromEmail: Yup.string().email('Invalid email').required('From email is required')
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch('/api/admin/settings/email', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          throw new Error('Failed to update email settings');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    },
    enableReinitialize: true
  });

  const shippingFormik = useFormik({
    initialValues: {
      enableShipping: settings?.shipping.enableShipping || false,
      freeShippingThreshold: settings?.shipping.freeShippingThreshold || '',
      defaultShippingRate: settings?.shipping.defaultShippingRate || '',
      shippingCalculationMethod: settings?.shipping.shippingCalculationMethod || 'flat',
      enableInternationalShipping: settings?.shipping.enableInternationalShipping || false,
      restrictedCountries: settings?.shipping.restrictedCountries || []
    },
    validationSchema: Yup.object({
      freeShippingThreshold: Yup.number().min(0, 'Must be positive'),
      defaultShippingRate: Yup.number().min(0, 'Must be positive')
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch('/api/admin/settings/shipping', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          throw new Error('Failed to update shipping settings');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    },
    enableReinitialize: true
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Settings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings updated successfully
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ bgcolor: 'background.paper' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="General" />
          <Tab label="Email" />
          <Tab label="Shipping" />
        </Tabs>

        {/* General Settings */}
        <TabPanel value={activeTab} index={0}>
          <form onSubmit={generalFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="storeName"
                  label="Store Name"
                  value={generalFormik.values.storeName}
                  onChange={generalFormik.handleChange}
                  error={generalFormik.touched.storeName && Boolean(generalFormik.errors.storeName)}
                  helperText={generalFormik.touched.storeName && generalFormik.errors.storeName}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="storeEmail"
                  label="Store Email"
                  value={generalFormik.values.storeEmail}
                  onChange={generalFormik.handleChange}
                  error={generalFormik.touched.storeEmail && Boolean(generalFormik.errors.storeEmail)}
                  helperText={generalFormik.touched.storeEmail && generalFormik.errors.storeEmail}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="supportEmail"
                  label="Support Email"
                  value={generalFormik.values.supportEmail}
                  onChange={generalFormik.handleChange}
                  error={generalFormik.touched.supportEmail && Boolean(generalFormik.errors.supportEmail)}
                  helperText={generalFormik.touched.supportEmail && generalFormik.errors.supportEmail}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="phoneNumber"
                  label="Phone Number"
                  value={generalFormik.values.phoneNumber}
                  onChange={generalFormik.handleChange}
                  error={generalFormik.touched.phoneNumber && Boolean(generalFormik.errors.phoneNumber)}
                  helperText={generalFormik.touched.phoneNumber && generalFormik.errors.phoneNumber}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="address"
                  label="Store Address"
                  value={generalFormik.values.address}
                  onChange={generalFormik.handleChange}
                  error={generalFormik.touched.address && Boolean(generalFormik.errors.address)}
                  helperText={generalFormik.touched.address && generalFormik.errors.address}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="currency"
                  label="Currency"
                  value={generalFormik.values.currency}
                  onChange={generalFormik.handleChange}
                  error={generalFormik.touched.currency && Boolean(generalFormik.errors.currency)}
                  helperText={generalFormik.touched.currency && generalFormik.errors.currency}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="timezone"
                  label="Timezone"
                  value={generalFormik.values.timezone}
                  onChange={generalFormik.handleChange}
                  error={generalFormik.touched.timezone && Boolean(generalFormik.errors.timezone)}
                  helperText={generalFormik.touched.timezone && generalFormik.errors.timezone}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        {/* Email Settings */}
        <TabPanel value={activeTab} index={1}>
          <form onSubmit={emailFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="smtpHost"
                  label="SMTP Host"
                  value={emailFormik.values.smtpHost}
                  onChange={emailFormik.handleChange}
                  error={emailFormik.touched.smtpHost && Boolean(emailFormik.errors.smtpHost)}
                  helperText={emailFormik.touched.smtpHost && emailFormik.errors.smtpHost}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="smtpPort"
                  label="SMTP Port"
                  type="number"
                  value={emailFormik.values.smtpPort}
                  onChange={emailFormik.handleChange}
                  error={emailFormik.touched.smtpPort && Boolean(emailFormik.errors.smtpPort)}
                  helperText={emailFormik.touched.smtpPort && emailFormik.errors.smtpPort}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="smtpUser"
                  label="SMTP Username"
                  value={emailFormik.values.smtpUser}
                  onChange={emailFormik.handleChange}
                  error={emailFormik.touched.smtpUser && Boolean(emailFormik.errors.smtpUser)}
                  helperText={emailFormik.touched.smtpUser && emailFormik.errors.smtpUser}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="smtpPassword"
                  label="SMTP Password"
                  type={showPassword ? 'text' : 'password'}
                  value={emailFormik.values.smtpPassword}
                  onChange={emailFormik.handleChange}
                  error={emailFormik.touched.smtpPassword && Boolean(emailFormik.errors.smtpPassword)}
                  helperText={emailFormik.touched.smtpPassword && emailFormik.errors.smtpPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="fromName"
                  label="From Name"
                  value={emailFormik.values.fromName}
                  onChange={emailFormik.handleChange}
                  error={emailFormik.touched.fromName && Boolean(emailFormik.errors.fromName)}
                  helperText={emailFormik.touched.fromName && emailFormik.errors.fromName}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="fromEmail"
                  label="From Email"
                  value={emailFormik.values.fromEmail}
                  onChange={emailFormik.handleChange}
                  error={emailFormik.touched.fromEmail && Boolean(emailFormik.errors.fromEmail)}
                  helperText={emailFormik.touched.fromEmail && emailFormik.errors.fromEmail}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="enableSSL"
                      checked={emailFormik.values.enableSSL}
                      onChange={emailFormik.handleChange}
                    />
                  }
                  label="Enable SSL"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                >
                  Save Email Settings
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        {/* Shipping Settings */}
        <TabPanel value={activeTab} index={2}>
          <form onSubmit={shippingFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="enableShipping"
                      checked={shippingFormik.values.enableShipping}
                      onChange={shippingFormik.handleChange}
                    />
                  }
                  label="Enable Shipping"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="freeShippingThreshold"
                  label="Free Shipping Threshold"
                  type="number"
                  value={shippingFormik.values.freeShippingThreshold}
                  onChange={shippingFormik.handleChange}
                  error={shippingFormik.touched.freeShippingThreshold && Boolean(shippingFormik.errors.freeShippingThreshold)}
                  helperText={shippingFormik.touched.freeShippingThreshold && shippingFormik.errors.freeShippingThreshold}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="defaultShippingRate"
                  label="Default Shipping Rate"
                  type="number"
                  value={shippingFormik.values.defaultShippingRate}
                  onChange={shippingFormik.handleChange}
                  error={shippingFormik.touched.defaultShippingRate && Boolean(shippingFormik.errors.defaultShippingRate)}
                  helperText={shippingFormik.touched.defaultShippingRate && shippingFormik.errors.defaultShippingRate}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="enableInternationalShipping"
                      checked={shippingFormik.values.enableInternationalShipping}
                      onChange={shippingFormik.handleChange}
                    />
                  }
                  label="Enable International Shipping"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                >
                  Save Shipping Settings
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Settings;
