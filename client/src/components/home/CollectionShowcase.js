import React from 'react';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

const CollectionShowcase = () => {
  const collections = [
    {
      title: 'Classic Collection',
      image: '/images/collections/classic.jpg',
      description: 'Timeless skull designs that never go out of style'
    },
    {
      title: 'Modern Collection',
      image: '/images/collections/modern.jpg',
      description: 'Contemporary takes on skull aesthetics'
    },
    {
      title: 'Limited Edition',
      image: '/images/collections/limited.jpg',
      description: 'Exclusive designs for the true collectors'
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
      <Container>
        <Typography 
          variant="h2" 
          align="center" 
          sx={{ 
            mb: 6,
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 'bold'
          }}
        >
          Our Collections
        </Typography>
        <Grid container spacing={4}>
          {collections.map((collection, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                component={motion.div}
                whileHover={{ scale: 1.05 }}
                sx={{ 
                  height: '100%',
                  backgroundColor: 'background.paper',
                  boxShadow: 3
                }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={collection.image}
                  alt={collection.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {collection.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {collection.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CollectionShowcase;