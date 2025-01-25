import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  textAlign: 'center',
  padding: theme.spacing(4),
}));

const NotFound = () => {
  return (
    <StyledContainer>
      <Typography
        variant="h1"
        sx={{
          fontFamily: "'UnifrakturMaguntia', cursive",
          mb: 4,
          color: 'primary.main',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        404
      </Typography>
      
      <Typography variant="h4" sx={{ mb: 2 }}>
        Page Not Found
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      
      <Box sx={{ '& > *': { m: 1 } }}>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          color="primary"
          size="large"
        >
          Back to Home
        </Button>
        
        <Button
          component={RouterLink}
          to="/shop"
          variant="outlined"
          color="primary"
          size="large"
        >
          Browse Shop
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default NotFound;
