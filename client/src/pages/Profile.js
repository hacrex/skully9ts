import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Avatar,
  Button,
  Divider
} from '@mui/material';
import { useSelector } from 'react-redux';
import OrderHistory from '../components/profile/OrderHistory';
import AddressBook from '../components/profile/AddressBook';
import AccountSettings from '../components/profile/AccountSettings';
import { motion } from 'framer-motion';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`profile-tabpanel-${index}`}
    aria-labelledby={`profile-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const Profile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const user = useSelector(state => state.auth.user);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  src={user?.avatar}
                  alt={user?.firstName}
                  sx={{ width: 100, height: 100 }}
                />
                <Box>
                  <Typography variant="h4">
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Edit Profile
                  </Button>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Profile Content */}
        <Grid item xs={12}>
          <Paper sx={{ bgcolor: 'background.paper' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 2
              }}
            >
              <Tab label="Orders" />
              <Tab label="Addresses" />
              <Tab label="Account Settings" />
            </Tabs>

            <Box sx={{ p: 2 }}>
              <TabPanel value={activeTab} index={0}>
                <OrderHistory />
              </TabPanel>
              <TabPanel value={activeTab} index={1}>
                <AddressBook />
              </TabPanel>
              <TabPanel value={activeTab} index={2}>
                <AccountSettings />
              </TabPanel>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
                <Typography variant="h6">Total Orders</Typography>
                <Typography variant="h4" color="primary">
                  {user?.orders?.length || 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
                <Typography variant="h6">Wishlist Items</Typography>
                <Typography variant="h4" color="primary">
                  {user?.wishlist?.length || 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
                <Typography variant="h6">Reviews</Typography>
                <Typography variant="h4" color="primary">
                  {user?.reviews?.length || 0}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
