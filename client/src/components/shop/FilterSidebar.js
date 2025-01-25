import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Button,
} from '@mui/material';
import { setProducts, setLoading } from '../../store/slices/productSlice';
import ProductService from '../../services/product.service';

const FilterSidebar = () => {
  const dispatch = useDispatch();
  const [priceRange, setPriceRange] = React.useState([0, 1000]);
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [selectedSizes, setSelectedSizes] = React.useState([]);
  
  const categories = ['All', 'T-Shirts', 'Hoodies', 'Accessories'];
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleApplyFilters = async () => {
    try {
      dispatch(setLoading(true));
      const filters = {
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      };
      
      const products = await ProductService.getAllProducts(filters);
      dispatch(setProducts(products));
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Categories
      </Typography>
      <List>
        {categories.map((category) => (
          <ListItem 
            button 
            key={category}
            selected={selectedCategory === category}
            onClick={() => handleCategoryClick(category)}
          >
            <ListItemText primary={category} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Price Range
      </Typography>
      <Box sx={{ px: 2 }}>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography>${priceRange[0]}</Typography>
          <Typography>${priceRange[1]}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Size
      </Typography>
      <FormGroup>
        {sizes.map((size) => (
          <FormControlLabel
            key={size}
            control={
              <Checkbox 
                checked={selectedSizes.includes(size)}
                onChange={() => handleSizeToggle(size)}
              />
            }
            label={size}
          />
        ))}
      </FormGroup>

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 3 }}
        onClick={handleApplyFilters}
      >
        Apply Filters
      </Button>
    </Box>
  );
};

export default FilterSidebar;
import PropTypes from 'prop-types';

// ... existing component code ...

FilterSidebar.propTypes = {
  // Add any props if needed in the future
};