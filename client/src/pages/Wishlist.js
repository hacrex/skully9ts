import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Wishlist = () => {
  // Sample data - replace with actual data from your backend
  const wishlistItems = [
    {
      id: 1,
      name: 'Skull Print T-Shirt',
      price: '$29.99',
      image: '/path/to/image1.jpg',
    },
    {
      id: 2,
      name: 'Gothic Hoodie',
      price: '$49.99',
      image: '/path/to/image2.jpg',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontFamily: "'UnifrakturMaguntia', cursive",
        color: 'primary.main'
      }}>
        My Wishlist
      </Typography>

      <Grid container spacing={3}>
        {wishlistItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: 'background.paper',
                }}
                title={item.name}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="h6" color="primary">
                  {item.price}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  startIcon={<ShoppingCartIcon />}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Add to Cart
                </Button>
                <Button
                  startIcon={<DeleteOutlineIcon />}
                  color="error"
                >
                  Remove
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Wishlist;
