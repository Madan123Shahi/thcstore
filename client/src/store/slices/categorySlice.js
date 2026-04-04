import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchCategories = createAsyncThunk('categories/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/categories');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (s) => { s.loading = true; })
      .addCase(fetchCategories.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchCategories.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export default categorySlice.reducer;
