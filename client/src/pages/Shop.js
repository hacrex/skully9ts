import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Grid, Typography } from '@mui/material';

// Import components as needed
import ProductGrid from '../components/shop/ProductGrid';
import FilterSidebar from '../components/shop/FilterSidebar';
import ShopHeader from '../components/shop/ShopHeader';

const Shop = () => {
  const { category } = useParams();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ShopHeader category={category} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <FilterSidebar />
        </Grid>
        
        <Grid item xs={12} md={9}>
          <ProductGrid category={category} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Shop;
