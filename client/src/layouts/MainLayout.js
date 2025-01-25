import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';

// Components
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import CartDrawer from '../components/CartDrawer';
import SearchOverlay from '../components/SearchOverlay';
import ScrollToTop from '../components/ScrollToTop';

const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <Toast />
      <ScrollToTop />
    </Box>
  );
};

export default MainLayout;
