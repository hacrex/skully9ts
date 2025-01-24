import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Grid,
  Typography,
  Box,
  Button,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  ImageList,
  ImageListItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  ShoppingCart,
  FavoriteBorder,
  Favorite,
  Share as ShareIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const QuickView = ({ open, onClose, product, onAddToCart, onToggleWishlist, isInWishlist }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart({
      ...product,
      size: selectedSize,
      quantity
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'text.secondary',
          zIndex: 1
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={4}>
          {/* Product Images */}
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={product.images[selectedImage]}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                mb: 2
              }}
            />
            <ImageList cols={4} gap={8}>
              {product.images.map((image, index) => (
                <ImageListItem
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    cursor: 'pointer',
                    opacity: selectedImage === index ? 1 : 0.6,
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 1 }
                  }}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    loading="lazy"
                    style={{
                      borderRadius: 4,
                      border: selectedImage === index ? `2px solid ${theme.palette.primary.main}` : 'none'
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4" component="h2" gutterBottom>
                {product.name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={product.rating} readOnly precision={0.5} />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({product.reviewCount} reviews)
                </Typography>
              </Box>

              <Typography variant="h5" color="primary" gutterBottom>
                ${product.price.toFixed(2)}
                {product.originalPrice && (
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through', ml: 1 }}
                  >
                    ${product.originalPrice.toFixed(2)}
                  </Typography>
                )}
              </Typography>

              {product.isNew && (
                <Chip
                  label="New Arrival"
                  color="primary"
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}

              <Typography variant="body1" color="text.secondary" paragraph>
                {product.description}
              </Typography>

              <Box sx={{ my: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Size</InputLabel>
                  <Select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    label="Size"
                  >
                    {product.sizes.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  type="number"
                  label="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  InputProps={{ inputProps: { min: 1 } }}
                  fullWidth
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                >
                  Add to Cart
                </Button>
                <IconButton onClick={onToggleWishlist}>
                  {isInWishlist ? (
                    <Favorite color="error" />
                  ) : (
                    <FavoriteBorder />
                  )}
                </IconButton>
                <IconButton onClick={handleShare}>
                  <ShareIcon />
                </IconButton>
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <Typography variant="subtitle2" gutterBottom>
                  SKU: {product.sku}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Category: {product.category}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {product.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      component={Link}
                      to={`/products?tag=${tag}`}
                      onClick={onClose}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default QuickView;
