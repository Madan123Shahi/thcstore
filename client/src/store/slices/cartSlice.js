import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    shippingAddress: null,
    paymentMethod: 'cod',
  },
  reducers: {
    addToCart(state, action) {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find(i => i.product._id === product._id);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      } else {
        state.items.push({ product, quantity });
      }
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(i => i.product._id !== action.payload);
    },
    updateQuantity(state, action) {
      const { productId, quantity } = action.payload;
      const item = state.items.find(i => i.product._id === productId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(i => i.product._id !== productId);
        } else {
          item.quantity = quantity;
        }
      }
    },
    clearCart(state) {
      state.items = [];
    },
    setShippingAddress(state, action) {
      state.shippingAddress = action.payload;
    },
    setPaymentMethod(state, action) {
      state.paymentMethod = action.payload;
    },
  },
});

export const {
  addToCart, removeFromCart, updateQuantity,
  clearCart, setShippingAddress, setPaymentMethod,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((a, i) => a + i.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((a, i) => a + i.product.price * i.quantity, 0);
export const selectCartShipping = (state) =>
  selectCartSubtotal(state) >= 999 ? 0 : 99;
export const selectCartTax = (state) =>
  Math.round(selectCartSubtotal(state) * 0.05);
export const selectCartTotal = (state) =>
  selectCartSubtotal(state) + selectCartShipping(state) + selectCartTax(state);

export default cartSlice.reducer;
