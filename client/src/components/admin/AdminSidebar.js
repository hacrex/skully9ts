import React from 'react';
import { List, ListItem, ListItemText, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <div>
      <List>
        <ListItem button component={RouterLink} to="/admin">
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={RouterLink} to="/admin/products">
          <ListItemText primary="Products" />
        </ListItem>
        <ListItem button component={RouterLink} to="/admin/categories">
          <ListItemText primary="Categories" />
        </ListItem>
        <ListItem button component={RouterLink} to="/admin/orders">
          <ListItemText primary="Orders" />
        </ListItem>
        <ListItem button component={RouterLink} to="/admin/customers">
          <ListItemText primary="Customers" />
        </ListItem>
      </List>
      <Divider />
    </div>
  );
};

export default AdminSidebar;