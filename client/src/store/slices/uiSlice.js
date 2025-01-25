import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartOpen: false,
  searchOpen: false,
  notification: null,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    setNotification: (state, { payload }) => {
      state.notification = payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { toggleCart, toggleSearch, setNotification, clearNotification, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;