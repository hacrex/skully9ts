import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, { payload }) => {
      const existingItem = state.items.find(item => item.id === payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...payload, quantity: 1 });
      }
    },
    removeFromCart: (state, { payload }) => {
      state.items = state.items.filter(item => item.id !== payload);
    },
    updateQuantity: (state, { payload }) => {
      const item = state.items.find(item => item.id === payload.id);
      if (item) {
        item.quantity = payload.quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;