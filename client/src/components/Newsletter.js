import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import { ArrowForward, Email } from '@mui/icons-material';

const Newsletter = ({ variant = 'default' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to subscribe');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const variants = {
    default: {
      wrapper: {
        bgcolor: 'background.paper',
        py: 8,
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider'
      },
      container: {
        maxWidth: 'sm',
        textAlign: 'center'
      },
      title: {
        variant: 'h3',
        gutterBottom: true
      }
    },
    minimal: {
      wrapper: {
        py: 4
      },
      container: {
        maxWidth: 'md'
      },
      title: {
        variant: 'h5',
        gutterBottom: false
      }
    },
    featured: {
      wrapper: {
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        py: 6
      },
      container: {
        maxWidth: 'md'
      },
      title: {
        variant: 'h4',
        gutterBottom: true
      }
    }
  };

  const currentVariant = variants[variant];

  return (
    <Box sx={currentVariant.wrapper}>
      <Container sx={currentVariant.container}>
        <Box
          component={variant === 'featured' ? Paper : 'div'}
          sx={{
            p: variant === 'featured' ? 4 : 0,
            borderRadius: variant === 'featured' ? 2 : 0,
            bgcolor: variant === 'featured' ? 'background.paper' : 'transparent',
            color: variant === 'featured' ? 'text.primary' : 'inherit'
          }}
        >
          <Typography {...currentVariant.title}>
            Join Our Newsletter
          </Typography>
          
          <Typography
            variant="body1"
            color={variant === 'featured' ? 'text.secondary' : 'inherit'}
            sx={{ mb: 4, opacity: 0.8 }}
          >
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              gap: 1,
              flexDirection: isMobile ? 'column' : 'row',
              maxWidth: 'md',
              mx: 'auto'
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: <Email color="action" sx={{ mr: 1 }} />
              }}
              sx={{
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: variant === 'featured' ? 'transparent' : 'inherit'
                  }
                }
              }}
            />
            <Button
              type="submit"
              variant={variant === 'featured' ? 'contained' : 'outlined'}
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                whiteSpace: 'nowrap',
                ...(variant === 'featured' && {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                })
              }}
            >
              Subscribe
            </Button>
          </Box>

          <Typography
            variant="body2"
            color={variant === 'featured' ? 'text.secondary' : 'inherit'}
            sx={{ mt: 2, opacity: 0.7 }}
          >
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </Typography>
        </Box>
      </Container>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          variant="filled"
        >
          Thank you for subscribing to our newsletter!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert
          onClose={() => setError('')}
          severity="error"
          variant="filled"
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Newsletter;
