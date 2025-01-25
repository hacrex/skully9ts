import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Card, CardContent, Skeleton } from '@mui/material';

// ... existing skeleton components ...

const LoadingSkeleton = ({ count = 6 }) => {
  return (
    <Grid container spacing={3}>
      {[...Array(count)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <Skeleton
              variant="rectangular"
              height={200}
              animation="wave"
              sx={{ bgcolor: 'grey.100' }}
            />
            <CardContent>
              <Skeleton
                variant="text"
                height={32}
                width="70%"
                animation="wave"
                sx={{ bgcolor: 'grey.100' }}
              />
              <Skeleton
                variant="text"
                height={24}
                width="40%"
                animation="wave"
                sx={{ bgcolor: 'grey.100' }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

LoadingSkeleton.propTypes = {
  count: PropTypes.number
};

// Export individual components
export {
  ProductSkeleton,
  CategorySkeleton,
  BannerSkeleton,
  ProductGridSkeleton,
  CategoryGridSkeleton,
  LoadingSkeleton
};