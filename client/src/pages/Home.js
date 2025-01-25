import React from 'react';
import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Components will be imported here
import FeaturedProducts from '../components/products/FeaturedProducts';
import CollectionShowcase from '../components/home/CollectionShowcase';
import Newsletter from '../components/common/Newsletter';

const Home = () => {
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Box>
      {/* Hero Section */}
      <Box
        ref={heroRef}
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : {}}
        sx={{
          height: '100vh',
          background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("/images/hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={heroInView ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.2 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    mb: 2,
                    fontWeight: 'bold',
                  }}
                >
                  EMBRACE THE DARKNESS
                </Typography>
                <Typography variant="h5" sx={{ mb: 4 }}>
                  Discover our exclusive collection of skull-themed apparel
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  href="/shop"
                  sx={{ mr: 2 }}
                >
                  Shop Now
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  href="/collections"
                >
                  View Collections
                </Button>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Products */}
      <Box sx={{ py: 8 }}>
        <Container>
          <Typography
            variant="h2"
            sx={{ mb: 4, textAlign: 'center' }}
          >
            Featured Products
          </Typography>
          <FeaturedProducts />
        </Container>
      </Box>

      {/* Collection Showcase */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container>
          <CollectionShowcase />
        </Container>
      </Box>

      {/* Newsletter Section */}
      <Box sx={{ py: 8 }}>
        <Container>
          <Newsletter />
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
