import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const CategoryCard = ({
  category,
  variant = 'default',
  showCount = true,
  imageHeight = 300
}) => {
  const theme = useTheme();

  const variants = {
    default: {
      card: {
        position: 'relative',
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      },
      content: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'background.paper',
        borderTopLeftRadius: theme.shape.borderRadius,
        borderTopRightRadius: theme.shape.borderRadius
      }
    },
    overlay: {
      card: {
        position: 'relative',
        height: '100%',
        '&:hover img': {
          transform: 'scale(1.05)'
        },
        '&:hover .MuiBox-root': {
          bgcolor: alpha(theme.palette.common.black, 0.6)
        }
      },
      content: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: alpha(theme.palette.common.black, 0.4),
        transition: 'background-color 0.3s'
      }
    },
    minimal: {
      card: {
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      },
      content: {
        textAlign: 'center'
      }
    }
  };

  const currentVariant = variants[variant];

  return (
    <Card
      component={Link}
      to={`/category/${category.slug}`}
      sx={{
        ...currentVariant.card,
        textDecoration: 'none'
      }}
    >
      <CardMedia
        component="img"
        height={imageHeight}
        image={category.image}
        alt={category.name}
        sx={{
          transition: 'transform 0.3s ease-in-out'
        }}
      />
      
      <Box sx={currentVariant.content}>
        <CardContent>
          {variant === 'overlay' ? (
            <>
              <Typography
                variant="h5"
                component="h3"
                color="common.white"
                align="center"
                gutterBottom
              >
                {category.name}
              </Typography>
              {showCount && (
                <Typography
                  variant="subtitle1"
                  color="common.white"
                  align="center"
                  sx={{ opacity: 0.8 }}
                >
                  {category.productCount} Products
                </Typography>
              )}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 2
                }}
              >
                <IconButton
                  sx={{
                    color: 'common.white',
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                >
                  <ArrowForward />
                </IconButton>
              </Box>
            </>
          ) : (
            <>
              <Typography
                variant="h6"
                component="h3"
                color="text.primary"
                gutterBottom
              >
                {category.name}
              </Typography>
              {showCount && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {category.productCount} Products
                </Typography>
              )}
            </>
          )}
        </CardContent>
      </Box>
    </Card>
  );
};

export default CategoryCard;
