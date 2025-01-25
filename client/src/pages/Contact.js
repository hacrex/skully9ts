import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
}));

const Contact = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontFamily: "'UnifrakturMaguntia', cursive",
            color: 'primary.main'
          }}>
            Get in Touch
          </Typography>
          
          <Typography variant="body1" paragraph>
            Have questions about our skull-themed apparel? Want to collaborate? 
            Or just want to say hi? Drop us a message!
          </Typography>
          
          <StyledPaper elevation={0}>
            <form>
              <Grid container spacing={3}>
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                  >
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </form>
          </StyledPaper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '100%', minHeight: 400 }}>
            {/* Map or additional contact information will go here */}
            <Typography variant="h5" gutterBottom>
              Our Location
            </Typography>
            <Typography variant="body1" paragraph>
              123 Skull Street
              <br />
              Gothic City, GC 12345
              <br />
              United States
            </Typography>
            
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Contact Info
            </Typography>
            <Typography variant="body1" paragraph>
              Email: info@skully9ts.com
              <br />
              Phone: (555) 123-4567
              <br />
              Hours: Mon-Fri 9am-6pm EST
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact;
