import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';

const FeaturedProducts = () => {
  // This will be replaced with actual API data later
  const featuredProducts = [
    {
      id: 1,
      name: "Classic Skull Tee",
      price: 29.99,
      image: "/images/products/classic-skull-tee.jpg",
      description: "Premium cotton t-shirt with classic skull design"
    },
    {
      id: 2,
      name: "Dark Rider Hoodie",
      price: 59.99,
      image: "/images/products/dark-rider-hoodie.jpg",
      description: "Comfortable hoodie with unique skull artwork"
    },
    {
      id: 3,
      name: "Skull Chain Necklace",
      price: 39.99,
      image: "/images/products/skull-chain.jpg",
      description: "Stainless steel skull pendant necklace"
    }
  ];

  return (
    <Box sx={{ py: 8 }}>
      <Container>
        <Typography 
          variant="h2" 
          align="center" 
          sx={{ 
            mb: 4,
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 'bold'
          }}
        >
          Featured Products
        </Typography>
        <Grid container spacing={4}>
          {featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturedProducts;