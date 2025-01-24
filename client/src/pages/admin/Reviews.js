import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  Flag as FlagIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';
import { formatDate } from '../../utils/formatters';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');

  const statuses = ['all', 'pending', 'approved', 'rejected', 'flagged'];
  const ratings = ['all', '5', '4', '3', '2', '1'];

  useEffect(() => {
    fetchReviews();
  }, [searchQuery, statusFilter, ratingFilter]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `/api/admin/reviews?search=${searchQuery}&status=${statusFilter}&rating=${ratingFilter}`,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      const data = await response.json();
      setReviews(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setSuccess('Review status updated successfully');
        fetchReviews();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to update review status');
      }
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await fetch(`/api/admin/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });

        if (response.ok) {
          setSuccess('Review deleted successfully');
          fetchReviews();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to delete review');
        }
      } catch (error) {
        setError(error.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleReplySubmit = async () => {
    try {
      const response = await fetch(`/api/admin/reviews/${selectedReview._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ reply: replyText })
      });

      if (response.ok) {
        setSuccess('Reply posted successfully');
        setReplyDialogOpen(false);
        setReplyText('');
        fetchReviews();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to post reply');
      }
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      flagged: 'error'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Product Reviews
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Rating</InputLabel>
            <Select
              value={ratingFilter}
              label="Rating"
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              {ratings.map((rating) => (
                <MenuItem key={rating} value={rating}>
                  {rating === 'all' ? 'All Ratings' : `${rating} Stars`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Reviews Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Review</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={review.product.image}
                      alt={review.product.name}
                      variant="rounded"
                    />
                    <Typography variant="body2">
                      {review.product.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={review.user.avatar}
                      alt={review.user.name}
                    />
                    <Typography variant="body2">
                      {review.user.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Rating value={review.rating} readOnly size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                    {review.content}
                  </Typography>
                </TableCell>
                <TableCell>
                  {formatDate(review.createdAt)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={review.status.toUpperCase()}
                    color={getStatusColor(review.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleStatusChange(review._id, 'approved')}
                    color="success"
                    title="Approve"
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleStatusChange(review._id, 'rejected')}
                    color="error"
                    title="Reject"
                  >
                    <ClearIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleStatusChange(review._id, 'flagged')}
                    color="warning"
                    title="Flag"
                  >
                    <FlagIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedReview(review);
                      setReplyDialogOpen(true);
                    }}
                    color="primary"
                    title="Reply"
                  >
                    <ReplyIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteReview(review._id)}
                    color="error"
                    title="Delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reply Dialog */}
      <Dialog
        open={replyDialogOpen}
        onClose={() => setReplyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Reply to Review
        </DialogTitle>
        
        <DialogContent>
          {selectedReview && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  src={selectedReview.user.avatar}
                  alt={selectedReview.user.name}
                />
                <Box>
                  <Typography variant="subtitle1">
                    {selectedReview.user.name}
                  </Typography>
                  <Rating value={selectedReview.rating} readOnly size="small" />
                </Box>
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedReview.content}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReplySubmit}
            disabled={!replyText.trim()}
          >
            Post Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reviews;
