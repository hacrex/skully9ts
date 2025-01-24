import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Badge,
  Button,
  Container,
  Avatar,
  Link,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useScrollTrigger,
  Slide
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  Person,
  Search,
  Close
} from '@mui/icons-material';
import SearchBar from './SearchBar';

const HideOnScroll = ({ children }) => {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const cartItems = useSelector(state => state.cart.items);
  const user = useSelector(state => state.auth.user);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Implement logout logic
    handleMenuClose();
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      {user ? (
        [
          <MenuItem key="profile" onClick={() => navigate('/profile')}>Profile</MenuItem>,
          <MenuItem key="orders" onClick={() => navigate('/orders')}>Orders</MenuItem>,
          <MenuItem key="logout" onClick={handleLogout}>Logout</MenuItem>
        ]
      ) : (
        [
          <MenuItem key="login" onClick={() => navigate('/login')}>Login</MenuItem>,
          <MenuItem key="register" onClick={() => navigate('/register')}>Register</MenuItem>
        ]
      )}
    </Menu>
  );

  const navigationLinks = [
    { text: 'Shop', path: '/shop' },
    { text: 'T-Shirts', path: '/category/t-shirts' },
    { text: 'Hoodies', path: '/category/hoodies' },
    { text: 'Accessories', path: '/category/accessories' },
    { text: 'Blog', path: '/blog' }
  ];

  return (
    <>
      <HideOnScroll>
        <AppBar position="fixed" sx={{ bgcolor: 'background.paper' }}>
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              {/* Mobile Menu Icon */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>

              {/* Logo */}
              <Typography
                variant="h6"
                noWrap
                component={RouterLink}
                to="/"
                sx={{
                  mr: 2,
                  display: 'flex',
                  fontFamily: 'Cinzel Decorative',
                  fontWeight: 700,
                  color: 'primary.main',
                  textDecoration: 'none',
                }}
              >
                SKULLY9TS
              </Typography>

              {/* Desktop Navigation Links */}
              <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
                {navigationLinks.map((link) => (
                  <Button
                    key={link.text}
                    component={RouterLink}
                    to={link.path}
                    sx={{ my: 2, color: 'text.primary', display: 'block' }}
                  >
                    {link.text}
                  </Button>
                ))}
              </Box>

              {/* Search, Cart, and Profile Icons */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  color="inherit"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search />
                </IconButton>

                <IconButton
                  color="inherit"
                  component={RouterLink}
                  to="/cart"
                >
                  <Badge badgeContent={cartItems.length} color="primary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>

                <IconButton
                  edge="end"
                  aria-label="account"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  {user ? (
                    <Avatar
                      alt={user.firstName}
                      src={user.avatar}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <Person />
                  )}
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setMobileMenuOpen(false)}
        >
          <List>
            {navigationLinks.map((link) => (
              <ListItem
                key={link.text}
                component={RouterLink}
                to={link.path}
                button
              >
                <ListItemText primary={link.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Search Overlay */}
      <Drawer
        anchor="top"
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            height: '100%',
            bgcolor: 'background.default'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              onClick={() => setSearchOpen(false)}
              sx={{ mb: 2 }}
            >
              <Close />
            </IconButton>
          </Box>
          <SearchBar onSearch={() => setSearchOpen(false)} />
        </Box>
      </Drawer>

      {renderMenu}
    </>
  );
};

export default Navbar;
