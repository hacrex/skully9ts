import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Grid, Typography } from '@mui/material';

// Import components
import ProductGrid from '../components/products/ProductGrid';
import FilterSidebar from '../components/shop/FilterSidebar';
import ShopHeader from '../components/shop/ShopHeader';
import LoadingSkeleton from '../components/LoadingSkeleton';

// Import services and actions
import { setProducts, setLoading, setError } from '../store/slices/productSlice';
import ProductService from '../services/product.service';

const Shop = () => {
  const dispatch = useDispatch();
  const { category } = useParams();
  const { products, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        dispatch(setLoading(true));
        const response = await ProductService.getAllProducts({ category });
        dispatch(setProducts(response));
      } catch (err) {
        dispatch(setError(err.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchProducts();
  }, [dispatch, category]);

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ShopHeader category={category} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <FilterSidebar />
        </Grid>
        <Grid item xs={12} md={9}>
          {loading ? (
            <LoadingSkeleton count={6} />
          ) : (
            <ProductGrid products={products} />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Shop;
