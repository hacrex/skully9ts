import React, { useState } from 'react';
import {
  Container,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  Paper
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AddressForm from '../components/checkout/AddressForm';
import PaymentForm from '../components/checkout/PaymentForm';
import OrderReview from '../components/checkout/OrderReview';
import OrderConfirmation from '../components/checkout/OrderConfirmation';

const steps = ['Shipping Address', 'Payment Details', 'Review Order'];

const Checkout = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [shippingData, setShippingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const cart = useSelector(state => state.cart);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleShippingSubmit = (data) => {
    setShippingData(data);
    handleNext();
  };

  const handlePaymentSubmit = async (data) => {
    setPaymentData(data);
    handleNext();
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
          items: cart.items,
          shipping: shippingData,
          payment: paymentData,
          total: cart.total
        })
      });

      const order = await response.json();
      setOrderData(order);
      handleNext();
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <AddressForm onSubmit={handleShippingSubmit} />;
      case 1:
        return <PaymentForm onSubmit={handlePaymentSubmit} />;
      case 2:
        return (
          <OrderReview
            cart={cart}
            shippingData={shippingData}
            paymentData={paymentData}
            onPlaceOrder={handlePlaceOrder}
          />
        );
      case 3:
        return <OrderConfirmation order={orderData} />;
      default:
        return 'Unknown step';
    }
  };

  // Redirect to cart if it's empty
  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, bgcolor: 'background.paper' }}
      >
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Checkout
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length ? (
          <OrderConfirmation order={orderData} />
        ) : (
          <>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep !== 0 && (
                <Button
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
              )}
              
              {activeStep !== steps.length - 1 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 3, ml: 1 }}
                >
                  Next
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Checkout;
