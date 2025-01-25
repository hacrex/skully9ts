import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
}));

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h2" gutterBottom sx={{ 
          fontFamily: "'UnifrakturMaguntia', cursive",
          color: 'primary.main'
        }}>
          About Skully9ts
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Where Style Meets the Dark Side
        </Typography>
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h4" gutterBottom>
              Our Story
            </Typography>
            <Typography variant="body1" paragraph>
              Founded in 2024, Skully9ts emerged from a passion for unique, 
              skull-themed fashion that speaks to those who dare to be different. 
              We believe that fashion should be both bold and comfortable, 
              making a statement while remaining wearable for everyday life.
            </Typography>
            <Typography variant="body1" paragraph>
              Our collection features carefully curated skull-themed apparel 
              that combines edgy designs with premium quality materials. Each piece 
              is created to help you express your individuality and stand out 
              from the crowd.
            </Typography>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h4" gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body1" paragraph>
              At Skully9ts, our mission is to provide unique, high-quality 
              skull-themed apparel that empowers individuals to express their 
              authentic selves. We're committed to:
            </Typography>
            <ul>
              <li>
                <Typography variant="body1" paragraph>
                  Creating unique designs that stand out
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Using high-quality materials for lasting comfort
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Supporting artistic expression and creativity
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Building a community of like-minded individuals
                </Typography>
              </li>
            </ul>
          </StyledPaper>
        </Grid>

        {/* Values Section */}
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h4" gutterBottom align="center">
              Our Values
            </Typography>
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h6" gutterBottom>
                    Quality
                  </Typography>
                  <Typography variant="body1">
                    Premium materials and attention to detail in every piece
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h6" gutterBottom>
                    Creativity
                  </Typography>
                  <Typography variant="body1">
                    Unique designs that push boundaries and inspire
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h6" gutterBottom>
                    Community
                  </Typography>
                  <Typography variant="body1">
                    Building connections through shared passion for style
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default About;
