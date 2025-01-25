import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Divider,
} from '@mui/material';

const ProductDetails = () => {
  const { id } = useParams();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: 500,
              bgcolor: 'background.paper',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {/* Image component will go here */}
          </Box>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            Product Name
          </Typography>
          
          <Typography variant="h5" color="primary" gutterBottom>
            $99.99
          </Typography>
          
          <Typography variant="body1" paragraph>
            Product description will go here...
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ mr: 2 }}
            >
              Add to Cart
            </Button>
            <Button variant="outlined" color="primary" size="large">
              Add to Wishlist
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetails;
