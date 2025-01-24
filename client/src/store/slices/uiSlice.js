import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCartOpen: false,
  isSearchOpen: false,
  toast: {
    open: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
  },
  loading: {
    global: false,
    products: false,
    checkout: false,
  },
  modal: {
    open: false,
    type: null, // 'quickView', 'login', 'signup', 'confirm'
    data: null,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
      if (state.isCartOpen) {
        state.isSearchOpen = false;
      }
    },
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
      if (state.isSearchOpen) {
        state.isCartOpen = false;
      }
    },
    showToast: (state, action) => {
      state.toast = {
        open: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
      };
    },
    hideToast: (state) => {
      state.toast.open = false;
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    openModal: (state, action) => {
      state.modal = {
        open: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modal = {
        open: false,
        type: null,
        data: null,
      };
    },
  },
});

export const {
  toggleCart,
  toggleSearch,
  showToast,
  hideToast,
  setLoading,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
