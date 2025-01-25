import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, { payload }) => {
      state.products = payload;
    },
    setFeaturedProducts: (state, { payload }) => {
      state.featuredProducts = payload;
    },
    setCurrentProduct: (state, { payload }) => {
      state.currentProduct = payload;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    },
  },
});

export const { setProducts, setFeaturedProducts, setCurrentProduct, setLoading, setError } = productSlice.actions;
export default productSlice.reducer;