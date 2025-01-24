import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useScrollTrigger,
  Slide
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  LocalShipping as ShippingIcon,
  Support as SupportIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const pages = [
  { title: 'New Arrivals', path: '/new-arrivals' },
  { title: 'Collections', path: '/collections' },
  { title: 'Skull Art', path: '/skull-art' },
  { title: 'Accessories', path: '/accessories' },
  { title: 'Sale', path: '/sale' }
];

const Header = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const navigate = useNavigate();
  const trigger = useScrollTrigger();

  useEffect(() => {
    // Fetch cart and wishlist counts
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const [cartResponse, wishlistResponse] = await Promise.all([
        fetch('/api/cart/count'),
        fetch('/api/wishlist/count')
      ]);
      
      const cartData = await cartResponse.json();
      const wishlistData = await wishlistResponse.json();
      
      setCartCount(cartData.count);
      setWishlistCount(wishlistData.count);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      navigate(`/search?q=${event.target.value}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <AppBar position="fixed" sx={{ bgcolor: 'background.default', boxShadow: 1 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile Menu */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page.title}
                    onClick={handleCloseNavMenu}
                    component={Link}
                    to={page.path}
                  >
                    <Typography textAlign="center">{page.title}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Logo */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                flexGrow: { xs: 1, md: 0 },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none'
              }}
            >
              SKULLY9TS
            </Typography>

            {/* Desktop Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              {pages.map((page) => (
                <Button
                  key={page.title}
                  component={Link}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                  sx={{
                    my: 2,
                    color: 'text.primary',
                    display: 'block',
                    mx: 2,
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  {page.title}
                </Button>
              ))}
            </Box>

            {/* Right Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" onClick={() => setIsSearchOpen(true)}>
                <SearchIcon />
              </IconButton>
              
              <IconButton
                color="inherit"
                component={Link}
                to="/wishlist"
                sx={{ ml: 1 }}
              >
                <Badge badgeContent={wishlistCount} color="error">
                  <FavoriteIcon />
                </Badge>
              </IconButton>
              
              <IconButton
                color="inherit"
                component={Link}
                to="/cart"
                sx={{ ml: 1 }}
              >
                <Badge badgeContent={cartCount} color="error">
                  <CartIcon />
                </Badge>
              </IconButton>
              
              <Tooltip title="Account">
                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{ ml: 1 }}
                >
                  <PersonIcon />
                </IconButton>
              </Tooltip>
              
              <Menu
                sx={{ mt: '45px' }}
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem component={Link} to="/account">
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>My Account</ListItemText>
                </MenuItem>
                <MenuItem component={Link} to="/orders">
                  <ListItemIcon>
                    <ShippingIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Orders</ListItemText>
                </MenuItem>
                <MenuItem component={Link} to="/support">
                  <ListItemIcon>
                    <SupportIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Support</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem>
                  <ListItemIcon>
                    <LoginIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>

        {/* Search Drawer */}
        <Drawer
          anchor="top"
          open={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              height: '100px',
              bgcolor: 'background.default'
            }
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <input
              type="text"
              placeholder="Search products..."
              onKeyPress={handleSearch}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              autoFocus
            />
            <IconButton onClick={() => setIsSearchOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Drawer>
      </AppBar>
    </Slide>
  );
};

export default Header;
