import React from 'react';
import { Box, Skeleton, Grid, Card, CardContent } from '@mui/material';

export const ProductSkeleton = () => (
  <Card>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton width="60%" />
      <Skeleton width="40%" />
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
        <Skeleton width={100} />
        <Skeleton width={30} sx={{ ml: 1 }} />
      </Box>
      <Skeleton width="80%" />
      <Skeleton width="100%" height={36} sx={{ mt: 2 }} />
    </CardContent>
  </Card>
);

export const CategorySkeleton = () => (
  <Card>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton width="40%" sx={{ mx: 'auto' }} />
      <Skeleton width="60%" sx={{ mx: 'auto' }} />
    </CardContent>
  </Card>
);

export const HeroSkeleton = () => (
  <Box sx={{ width: '100%', height: { xs: '80vh', md: '90vh' } }}>
    <Skeleton variant="rectangular" width="100%" height="100%" />
  </Box>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <Grid container spacing={4}>
    {Array(count).fill(null).map((_, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <ProductSkeleton />
      </Grid>
    ))}
  </Grid>
);

export const CategoryGridSkeleton = ({ count = 4 }) => (
  <Grid container spacing={4}>
    {Array(count).fill(null).map((_, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <CategorySkeleton />
      </Grid>
    ))}
  </Grid>
);

export default {
  ProductSkeleton,
  CategorySkeleton,
  HeroSkeleton,
  ProductGridSkeleton,
  CategoryGridSkeleton
};
