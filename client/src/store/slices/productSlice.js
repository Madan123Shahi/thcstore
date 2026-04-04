import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/products?${query}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch products');
  }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Product not found');
  }
});

export const fetchFeatured = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products/featured');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const fetchBestSellers = createAsyncThunk('products/bestSellers', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products/bestsellers');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const addReview = createAsyncThunk('products/addReview', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/products/${id}/reviews`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to submit review');
  }
});

export const createProduct = createAsyncThunk('products/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/products', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create product');
  }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update product');
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete product');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    list: [],
    featured: [],
    bestSellers: [],
    current: null,
    pagination: null,
    loading: false,
    error: null,
    filters: { search: '', category: '', sort: '-createdAt', minPrice: '', maxPrice: '' },
  },
  reducers: {
    setFilters(state, action) { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters(state) {
      state.filters = { search: '', category: '', sort: '-createdAt', minPrice: '', maxPrice: '' };
    },
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchFeatured.fulfilled, (state, action) => { state.featured = action.payload; })
      .addCase(fetchBestSellers.fulfilled, (state, action) => { state.bestSellers = action.payload; })

      .addCase(createProduct.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.list.findIndex(p => p._id === action.payload._id);
        if (idx > -1) state.list[idx] = action.payload;
        if (state.current?._id === action.payload._id) state.current = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p._id !== action.payload);
      });
  },
});

export const { setFilters, clearFilters, clearCurrent } = productSlice.actions;
export default productSlice.reducer;
