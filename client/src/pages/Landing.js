import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Rating,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
  Paper,
  Divider
} from '@mui/material';
import {
  FavoriteBorder,
  Favorite,
  ShoppingCart,
  ArrowForward,
  LocalShipping,
  Security,
  CreditCard,
  Support
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/Hero';

const featuredCategories = [
  {
    id: 1,
    name: 'T-Shirts',
    image: '/images/categories/tshirts.jpg',
    count: 120,
    link: '/category/t-shirts'
  },
  {
    id: 2,
    name: 'Hoodies',
    image: '/images/categories/hoodies.jpg',
    count: 85,
    link: '/category/hoodies'
  },
  {
    id: 3,
    name: 'Accessories',
    image: '/images/categories/accessories.jpg',
    count: 95,
    link: '/category/accessories'
  },
  {
    id: 4,
    name: 'Limited Edition',
    image: '/images/categories/limited.jpg',
    count: 25,
    link: '/category/limited-edition'
  }
];

const features = [
  {
    icon: <LocalShipping />,
    title: 'Free Shipping',
    description: 'On orders over $50'
  },
  {
    icon: <Security />,
    title: 'Secure Payment',
    description: '100% secure payment'
  },
  {
    icon: <CreditCard />,
    title: 'Money Back',
    description: '30 days guarantee'
  },
  {
    icon: <Support />,
    title: '24/7 Support',
    description: 'Dedicated support'
  }
];

const Landing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(new Set());

  useEffect(() => {
    fetchFeaturedProducts();
    fetchWishlist();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products/featured');
      const data = await response.json();
      setFeaturedProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();
      setWishlist(new Set(data.map(item => item._id)));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleToggleWishlist = async (productId) => {
    try {
      const method = wishlist.has(productId) ? 'DELETE' : 'POST';
      const response = await fetch(`/api/wishlist/${productId}`, { method });
      
      if (response.ok) {
        setWishlist(prev => {
          const newWishlist = new Set(prev);
          if (method === 'DELETE') {
            newWishlist.delete(productId);
          } else {
            newWishlist.add(productId);
          }
          return newWishlist;
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <Hero />

      {/* Featured Categories */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 6
          }}
        >
          Shop by Category
        </Typography>

        <Grid container spacing={4}>
          {featuredCategories.map((category) => (
            <Grid item xs={12} sm={6} md={3} key={category.id}>
              <Card
                component={Link}
                to={category.link}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={category.image}
                  alt={category.name}
                />
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography variant="h6" component="h3">
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.count} Products
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features */}
      <Box sx={{ bgcolor: 'background.default', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    textAlign: 'center',
                    bgcolor: 'transparent'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      '& .MuiSvgIcon-root': {
                        fontSize: 40,
                        color: 'primary.main'
                      }
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            Featured Products
          </Typography>
          <Button
            component={Link}
            to="/products"
            endIcon={<ArrowForward />}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            View All Products
          </Button>
        </Box>

        <Grid container spacing={4}>
          {(loading ? Array(8).fill(null) : featuredProducts).map((product, index) => (
            <Grid item xs={12} sm={6} md={3} key={product?._id || index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {loading ? (
                  <Skeleton variant="rectangular" height={200} />
                ) : (
                  <>
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.image}
                      alt={product.name}
                    />
                    {product.isNew && (
                      <Chip
                        label="New"
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          left: 16
                        }}
                      />
                    )}
                    <IconButton
                      onClick={() => handleToggleWishlist(product._id)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'background.paper'
                        }
                      }}
                    >
                      {wishlist.has(product._id) ? (
                        <Favorite color="error" />
                      ) : (
                        <FavoriteBorder />
                      )}
                    </IconButton>
                  </>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  {loading ? (
                    <>
                      <Skeleton width="60%" />
                      <Skeleton width="40%" />
                      <Skeleton width="80%" />
                    </>
                  ) : (
                    <>
                      <Typography gutterBottom variant="h6" component="h3">
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={product.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({product.reviewCount})
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="primary">
                        ${product.price.toFixed(2)}
                      </Typography>
                    </>
                  )}
                </CardContent>

                <CardActions>
                  {loading ? (
                    <Skeleton width="100%" height={36} />
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      component={Link}
                      to={`/product/${product._id}`}
                    >
                      Add to Cart
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', mt: 4 }}>
          <Button
            component={Link}
            to="/products"
            endIcon={<ArrowForward />}
          >
            View All Products
          </Button>
        </Box>
      </Container>

      {/* Newsletter */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          py: 8,
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom>
            Join Our Newsletter
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </Typography>
          <Box
            component="form"
            sx={{
              display: 'flex',
              gap: 1,
              flexDirection: isMobile ? 'column' : 'row'
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{ px: 4 }}
            >
              Subscribe
            </Button>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Landing;
