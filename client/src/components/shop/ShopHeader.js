import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { setProducts, setLoading } from '../../store/slices/productSlice';
import ProductService from '../../services/product.service';

const ShopHeader = ({ category }) => {
  const dispatch = useDispatch();
  const { products } = useSelector(state => state.products);
  const [sortBy, setSortBy] = React.useState('newest');

  const handleSortChange = async (event) => {
    const value = event.target.value;
    setSortBy(value);
    
    let sortedProducts = [...products];
    
    switch (value) {
      case 'price-low':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        sortedProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    dispatch(setProducts(sortedProducts));
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {category ? `${category} Collection` : 'All Products'}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </Typography>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} onChange={handleSortChange} label="Sort By">
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="price-low">Price: Low to High</MenuItem>
            <MenuItem value="price-high">Price: High to Low</MenuItem>
            <MenuItem value="popular">Most Popular</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default ShopHeader;