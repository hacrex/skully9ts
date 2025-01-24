import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  InputBase,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  TrendingUp,
  History as HistoryIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import debounce from 'lodash/debounce';

const SearchOverlay = ({ open, onClose }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchRecentSearches();
      fetchPopularSearches();
    }
  }, [open]);

  const fetchRecentSearches = () => {
    // Get from localStorage
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));
  };

  const fetchPopularSearches = async () => {
    try {
      const response = await fetch('/api/search/popular');
      const data = await response.json();
      setPopularSearches(data);
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  };

  const searchProducts = async (term) => {
    if (!term) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce(searchProducts, 300);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleSearchSubmit = () => {
    if (!searchTerm) return;

    // Save to recent searches
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [searchTerm, ...recent.filter(s => s !== searchTerm)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate to search results page
    onClose();
    window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  return (
    <Drawer
      anchor="top"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          height: '100%',
          bgcolor: 'background.default'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Search Input */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 3,
            bgcolor: 'background.paper',
            borderRadius: 1,
            p: 1,
            boxShadow: 1
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary' }} />
          <InputBase
            autoFocus
            fullWidth
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
            sx={{ ml: 1 }}
          />
          {searchTerm && (
            <IconButton size="small" onClick={() => setSearchTerm('')}>
              <ClearIcon />
            </IconButton>
          )}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Search Results */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : results.length > 0 ? (
          <List>
            {results.map((product) => (
              <ListItem
                key={product._id}
                component={Link}
                to={`/product/${product._id}`}
                onClick={onClose}
                sx={{
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={product.image}
                    alt={product.name}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={product.name}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        color="primary"
                      >
                        ${product.price.toFixed(2)}
                      </Typography>
                      {product.category && (
                        <Chip
                          label={product.category}
                          size="small"
                          sx={{ height: 20 }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          // Recent and Popular Searches
          <Box>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <HistoryIcon fontSize="small" />
                    Recent Searches
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={clearRecentSearches}
                    sx={{ color: 'text.secondary' }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {recentSearches.map((term, index) => (
                    <Chip
                      key={index}
                      label={term}
                      onClick={() => {
                        setSearchTerm(term);
                        searchProducts(term);
                      }}
                      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}
                >
                  <TrendingUp fontSize="small" />
                  Popular Searches
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {popularSearches.map((term, index) => (
                    <Chip
                      key={index}
                      label={term}
                      variant="outlined"
                      onClick={() => {
                        setSearchTerm(term);
                        searchProducts(term);
                      }}
                      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default SearchOverlay;
