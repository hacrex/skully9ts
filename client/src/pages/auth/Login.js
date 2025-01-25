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
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  margin: '0 auto',
  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
}));

const Login = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <StyledPaper>
        <Typography variant="h4" align="center" gutterBottom sx={{ 
          fontFamily: "'UnifrakturMaguntia', cursive",
          color: 'primary.main'
        }}>
          Login
        </Typography>
        
        <form>
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
          
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
          >
            Login
          </Button>
        </form>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link
            component={RouterLink}
            to="/forgot-password"
            color="primary"
            underline="hover"
          >
            Forgot Password?
          </Link>
        </Box>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              color="primary"
              underline="hover"
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default Login;
