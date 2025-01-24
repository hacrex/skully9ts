import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper
} from '@mui/material';
import { ShoppingCart as CartIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CartIcon
              sx={{
                fontSize: 100,
                color: 'primary.main',
                opacity: 0.8,
                mb: 3
              }}
            />
          </motion.div>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Your Cart is Empty
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like you haven't added any items to your cart yet.
            Start shopping to find awesome skull-themed products!
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/shop')}
            >
              Start Shopping
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/collections')}
            >
              View Collections
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default EmptyCart;
