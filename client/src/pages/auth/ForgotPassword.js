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

const ForgotPassword = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <StyledPaper>
        <Typography variant="h4" align="center" gutterBottom sx={{ 
          fontFamily: "'UnifrakturMaguntia', cursive",
          color: 'primary.main'
        }}>
          Reset Password
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>
        
        <form>
          <TextField
            fullWidth
            label="Email"
            type="email"
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
            Send Reset Link
          </Button>
        </form>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Remember your password?{' '}
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

export default ForgotPassword;
