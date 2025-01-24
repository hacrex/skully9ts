import React from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  IconButton,
  Avatar,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  ShoppingCart,
  Favorite
} from '@mui/icons-material';

const icons = {
  success: SuccessIcon,
  error: ErrorIcon,
  info: InfoIcon,
  warning: WarningIcon,
  cart: ShoppingCart,
  wishlist: Favorite
};

const Toast = ({
  open,
  onClose,
  message,
  severity = 'success',
  autoHideDuration = 5000,
  variant = 'standard',
  action,
  product
}) => {
  const theme = useTheme();
  const Icon = icons[severity];

  if (variant === 'product') {
    return (
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box
          sx={{
            minWidth: 300,
            maxWidth: 400,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: theme.shadows[3],
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              bgcolor: severity === 'error' ? 'error.light' : 'primary.light',
              color: severity === 'error' ? 'error.contrastText' : 'primary.contrastText'
            }}
          >
            {icons[action] && <Box component={icons[action]} />}
            <Typography variant="subtitle2">
              {action === 'cart' ? 'Added to Cart' : 'Added to Wishlist'}
            </Typography>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ ml: 'auto', color: 'inherit' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {product && (
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                variant="rounded"
                src={product.image}
                alt={product.name}
                sx={{ width: 60, height: 60 }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.size && `Size: ${product.size}`}
                  {product.quantity && ` • Qty: ${product.quantity}`}
                </Typography>
                <Typography variant="subtitle2" color="primary" sx={{ mt: 0.5 }}>
                  ${product.price.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Snackbar>
    );
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity={severity}
        variant={variant}
        onClose={onClose}
        icon={Icon ? <Icon /> : null}
        sx={{
          minWidth: 300,
          alignItems: 'center',
          ...(variant === 'filled' && {
            bgcolor: `${severity}.main`,
            color: `${severity}.contrastText`
          })
        }}
      >
        <Typography variant="body2">{message}</Typography>
      </Alert>
    </Snackbar>
  );
};

export const useToast = () => {
  const [state, setState] = React.useState({
    open: false,
    message: '',
    severity: 'success',
    variant: 'standard',
    action: null,
    product: null
  });

  const showToast = (options) => {
    setState({ ...options, open: true });
  };

  const hideToast = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  return {
    ...state,
    showToast,
    hideToast
  };
};

export default Toast;
