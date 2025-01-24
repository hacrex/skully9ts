import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  TextField,
  Button,
  Link,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  Pinterest,
  YouTube,
  Email,
  Phone,
  LocationOn,
  ArrowForward
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        pt: 8,
        pb: 3,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                mb: 2
              }}
            >
              SKULLY9TS
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Discover our unique collection of skull-themed apparel and accessories.
              Express your style with our exclusive designs crafted for the bold and
              adventurous.
            </Typography>
            <Box sx={{ mb: 2 }}>
              <IconButton
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                <Facebook />
              </IconButton>
              <IconButton
                component="a"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                <Twitter />
              </IconButton>
              <IconButton
                component="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                <Instagram />
              </IconButton>
              <IconButton
                component="a"
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                <Pinterest />
              </IconButton>
              <IconButton
                component="a"
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box component="nav">
              <Link
                component={RouterLink}
                to="/new-arrivals"
                color="inherit"
                sx={{ display: 'block', mb: 1 }}
              >
                New Arrivals
              </Link>
              <Link
                component={RouterLink}
                to="/best-sellers"
                color="inherit"
                sx={{ display: 'block', mb: 1 }}
              >
                Best Sellers
              </Link>
              <Link
                component={RouterLink}
                to="/sale"
                color="inherit"
                sx={{ display: 'block', mb: 1 }}
              >
                Sale
              </Link>
              <Link
                component={RouterLink}
                to="/gift-cards"
                color="inherit"
                sx={{ display: 'block', mb: 1 }}
              >
                Gift Cards
              </Link>
              <Link
                component={RouterLink}
                to="/blog"
                color="inherit"
                sx={{ display: 'block', mb: 1 }}
              >
                Blog
              </Link>
            </Box>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom>
              Customer Service
            </Typography>
            <Box component="nav">
              <Link
                component={RouterLink}
                to="/contact"
                color="inherit"
                sx={{ display: 'block', mb: 1 }}
              >
                Contact Us
              </Link>
              <Link
                component={RouterLink}
                to="/shipping"
                color="inherit"
                sx={{ display: 'block', mb: 1 }}
              >
                Shipping Info
              </Link>
              <Link
                component={RouterLink}
                to="/returns"
                color="inherit"
                sx={{ display: 'block', mb: 1 }}
              >
                Returns
              </Link>
              <Link
                component={RouterLink}
                to="/faq"
                color="inherit"
                sx={{ display: 'block', mb: 1 }}
              >
                FAQ
              </Link>
              <Link
                component={RouterLink}
                to="/size-guide"
                color="inherit"
                sx={{ display: 'block', mb: 1 }}
              >
                Size Guide
              </Link>
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Join Our Newsletter
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Subscribe to get special offers, free giveaways, and amazing deals.
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubscribe}
              sx={{
                display: 'flex',
                gap: 1,
                flexDirection: isMobile ? 'column' : 'row'
              }}
            >
              <TextField
                fullWidth
                placeholder="Enter your email"
                size="small"
                sx={{ bgcolor: 'background.default' }}
              />
              <Button
                type="submit"
                variant="contained"
                endIcon={<ArrowForward />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Subscribe
              </Button>
            </Box>

            {/* Contact Info */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Contact Us
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ mr: 1 }} />
                <Typography variant="body2">
                  support@skully9ts.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone sx={{ mr: 1 }} />
                <Typography variant="body2">
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1 }} />
                <Typography variant="body2">
                  123 Skull Street, Fashion District
                  <br />
                  New York, NY 10001
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Footer */}
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item xs={12} md="auto">
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Skully9Ts. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} md="auto">
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Link
                component={RouterLink}
                to="/privacy"
                color="inherit"
                variant="body2"
              >
                Privacy Policy
              </Link>
              <Link
                component={RouterLink}
                to="/terms"
                color="inherit"
                variant="body2"
              >
                Terms of Service
              </Link>
              <Link
                component={RouterLink}
                to="/accessibility"
                color="inherit"
                variant="body2"
              >
                Accessibility
              </Link>
              <Link
                component={RouterLink}
                to="/sitemap"
                color="inherit"
                variant="body2"
              >
                Sitemap
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
