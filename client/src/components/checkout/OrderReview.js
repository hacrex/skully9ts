import React from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Grid,
  Box,
  Button,
  Divider,
  Card,
  CardMedia
} from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

const OrderReview = ({ cart, shippingData, paymentData, onPlaceOrder }) => {
  const { items, subtotal, tax, shipping, total } = cart;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>

      <List disablePadding>
        {items.map((item) => (
          <ListItem key={item.id} sx={{ py: 2, px: 0 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={3} sm={2}>
                <Card>
                  <CardMedia
                    component="img"
                    image={item.image}
                    alt={item.name}
                    sx={{ aspectRatio: '1' }}
                  />
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={8}>
                <ListItemText
                  primary={item.name}
                  secondary={
                    <>
                      {item.customization && (
                        <Typography variant="body2" color="text.secondary">
                          Customization: {item.customization.text}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity}
                      </Typography>
                    </>
                  }
                />
              </Grid>
              
              <Grid item xs={3} sm={2}>
                <Typography variant="body2" align="right">
                  {formatCurrency(item.price * item.quantity)}
                </Typography>
              </Grid>
            </Grid>
          </ListItem>
        ))}

        <Divider sx={{ my: 2 }} />

        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Subtotal" />
          <Typography variant="body1">
            {formatCurrency(subtotal)}
          </Typography>
        </ListItem>
        
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Shipping" />
          <Typography variant="body1">
            {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
          </Typography>
        </ListItem>
        
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Tax" />
          <Typography variant="body1">
            {formatCurrency(tax)}
          </Typography>
        </ListItem>
        
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Total" />
          <Typography variant="h6" color="primary">
            {formatCurrency(total)}
          </Typography>
        </ListItem>
      </List>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            Shipping Address
          </Typography>
          <Typography gutterBottom>
            {shippingData.firstName} {shippingData.lastName}
          </Typography>
          <Typography gutterBottom>
            {shippingData.street}
          </Typography>
          <Typography gutterBottom>
            {shippingData.city}, {shippingData.state} {shippingData.zipCode}
          </Typography>
          <Typography gutterBottom>
            {shippingData.country}
          </Typography>
          <Typography gutterBottom>
            Phone: {shippingData.phone}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            Payment Details
          </Typography>
          <Typography gutterBottom>
            Card Type: {paymentData.cardType}
          </Typography>
          <Typography gutterBottom>
            Card Number: **** **** **** {paymentData.lastFour}
          </Typography>
          <Typography gutterBottom>
            Expiry: {paymentData.expMonth}/{paymentData.expYear}
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onPlaceOrder}
          size="large"
        >
          Place Order
        </Button>
      </Box>
    </Box>
  );
};

export default OrderReview;
