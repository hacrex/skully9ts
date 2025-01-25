import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  margin: '0 auto',
  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
}));

const Register = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <StyledPaper>
        <Typography variant="h4" align="center" gutterBottom sx={{ 
          fontFamily: "'UnifrakturMaguntia', cursive",
          color: 'primary.main'
        }}>
          Create Account
        </Typography>
        
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                required
              />
            </Grid>
          </Grid>
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            required
          />
          
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
          >
            Register
          </Button>
        </form>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link
              component={RouterLink}
              to="/login"
              color="primary"
              underline="hover"
            >
              Login
            </Link>
          </Typography>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default Register;
