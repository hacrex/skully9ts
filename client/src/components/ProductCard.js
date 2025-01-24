import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Box,
  Chip,
  Rating,
  Tooltip,
  Fade
} from '@mui/material';
import {
  FavoriteBorder,
  Favorite,
  ShoppingCart,
  Visibility,
  Share as ShareIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import QuickView from './QuickView';

const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  showQuickView = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

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
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image */}
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="280"
            image={product.image}
            alt={product.name}
            sx={{
              transition: 'transform 0.3s ease-in-out',
              ...(isHovered && {
                transform: 'scale(1.05)'
              })
            }}
          />

          {/* Overlay Actions */}
          <Fade in={isHovered}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              {showQuickView && (
                <Tooltip title="Quick View">
                  <IconButton
                    onClick={() => setQuickViewOpen(true)}
                    sx={{
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.default' }
                    }}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Share">
                <IconButton
                  onClick={handleShare}
                  sx={{
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.default' }
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Fade>

          {/* Product Labels */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            {product.isNew && (
              <Chip
                label="New"
                color="primary"
                size="small"
              />
            )}
            {product.discount && (
              <Chip
                label={`-${product.discount}%`}
                color="error"
                size="small"
              />
            )}
          </Box>

          {/* Wishlist Button */}
          <IconButton
            onClick={onToggleWishlist}
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
            {isInWishlist ? (
              <Favorite color="error" />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
        </Box>

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
          >
            {product.category}
          </Typography>
          
          <Typography
            variant="h6"
            component={Link}
            to={`/product/${product._id}`}
            sx={{
              textDecoration: 'none',
              color: 'text.primary',
              '&:hover': {
                color: 'primary.main'
              }
            }}
          >
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
            <Rating
              value={product.rating}
              readOnly
              size="small"
              precision={0.5}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              ({product.reviewCount})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h6" color="primary">
              ${product.price.toFixed(2)}
            </Typography>
            {product.originalPrice && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                ${product.originalPrice.toFixed(2)}
              </Typography>
            )}
          </Box>
        </CardContent>

        <CardActions>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={() => onAddToCart(product)}
          >
            Add to Cart
          </Button>
        </CardActions>
      </Card>

      {/* Quick View Dialog */}
      <QuickView
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        product={product}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        isInWishlist={isInWishlist}
      />
    </>
  );
};

export default ProductCard;
