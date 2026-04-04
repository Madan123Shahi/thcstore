import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const res = await api.put(`/auth/wishlist/${productId}`);
    return res.data.wishlist;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update wishlist');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [] },
  reducers: {
    setWishlist(state, action) { state.items = action.payload; },
    clearWishlist(state) { state.items = []; },
  },
  extraReducers: (builder) => {
    builder.addCase(toggleWishlist.fulfilled, (state, action) => {
      state.items = action.payload;
    });
  },
});

export const { setWishlist, clearWishlist } = wishlistSlice.actions;
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some(id => id === productId || id?._id === productId);
export default wishlistSlice.reducer;
