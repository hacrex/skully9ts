import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondary,
  ListItemAvatar,
  Avatar,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Badge,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as AlertIcon,
  ShoppingCart as OrderIcon,
  Inventory as InventoryIcon,
  Person as UserIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderAlerts: true,
    inventoryAlerts: true,
    userAlerts: true,
    systemAlerts: true
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
    fetchActivityLog();
  }, [selectedType, selectedPriority]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `/api/admin/notifications?type=${selectedType}&priority=${selectedPriority}`,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      const data = await response.json();
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      setLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const response = await fetch('/api/admin/activity-log', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setActivityLog(data);
    } catch (error) {
      console.error('Error fetching activity log:', error);
      setError('Failed to load activity log');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      if (response.ok) {
        fetchNotifications();
        setSuccess('Notification marked as read');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to update notification');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      if (response.ok) {
        fetchNotifications();
        setSuccess('All notifications marked as read');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to update notifications');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      if (response.ok) {
        fetchNotifications();
        setSuccess('Notification deleted');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to delete notification');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        const response = await fetch('/api/admin/notifications/clear-all', {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (response.ok) {
          fetchNotifications();
          setSuccess('All notifications cleared');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (error) {
        setError('Failed to clear notifications');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSettingsSave = async () => {
    try {
      const response = await fetch('/api/admin/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(notificationSettings)
      });

      if (response.ok) {
        setSettingsOpen(false);
        setSuccess('Settings updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to update settings');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <OrderIcon />;
      case 'inventory':
        return <InventoryIcon />;
      case 'user':
        return <UserIcon />;
      case 'alert':
        return <AlertIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'create':
        return <CheckIcon color="success" />;
      case 'update':
        return <InfoIcon color="info" />;
      case 'delete':
        return <DeleteIcon color="error" />;
      default:
        return <InfoIcon />;
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
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="h4">
              Notifications & Activity
            </Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={handleFilterClick}>
              <FilterIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Grid>
        </Grid>
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab
            icon={<NotificationsIcon />}
            label={
              <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                Notifications
              </Badge>
            }
          />
          <Tab icon={<InfoIcon />} label="Activity Log" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Paper>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleMarkAllAsRead}
              disabled={!notifications.some(n => !n.read)}
            >
              Mark All as Read
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              Clear All
            </Button>
          </Box>
          <List>
            {notifications.map((notification) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        onClick={() => handleMarkAsRead(notification._id)}
                        disabled={notification.read}
                      >
                        {notification.read ? <CheckIcon /> : <WarningIcon />}
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteNotification(notification._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.read ? 'grey.300' : 'primary.main' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </Typography>
                        <Chip
                          label={notification.priority.toUpperCase()}
                          color={getPriorityColor(notification.priority)}
                          size="small"
                        />
                      </Box>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
            {notifications.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No notifications"
                  secondary="You're all caught up!"
                />
              </ListItem>
            )}
          </List>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper>
          <List>
            {activityLog.map((activity) => (
              <React.Fragment key={activity._id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      {getActivityIcon(activity.action)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.description}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          by {activity.user}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={selectedType}
              label="Type"
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="order">Orders</MenuItem>
              <MenuItem value="inventory">Inventory</MenuItem>
              <MenuItem value="user">Users</MenuItem>
              <MenuItem value="alert">Alerts</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={selectedPriority}
              label="Priority"
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Menu>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Notification Settings
        </DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive notifications via email"
              />
              <Switch
                edge="end"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  emailNotifications: e.target.checked
                }))}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Push Notifications"
                secondary="Receive push notifications in browser"
              />
              <Switch
                edge="end"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  pushNotifications: e.target.checked
                }))}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Order Alerts"
                secondary="Get notified about new orders and updates"
              />
              <Switch
                edge="end"
                checked={notificationSettings.orderAlerts}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  orderAlerts: e.target.checked
                }))}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Inventory Alerts"
                secondary="Get notified about low stock and inventory changes"
              />
              <Switch
                edge="end"
                checked={notificationSettings.inventoryAlerts}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  inventoryAlerts: e.target.checked
                }))}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="User Alerts"
                secondary="Get notified about user activities"
              />
              <Switch
                edge="end"
                checked={notificationSettings.userAlerts}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  userAlerts: e.target.checked
                }))}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="System Alerts"
                secondary="Get notified about system updates and maintenance"
              />
              <Switch
                edge="end"
                checked={notificationSettings.systemAlerts}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  systemAlerts: e.target.checked
                }))}
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSettingsSave}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Notifications;
