import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/orders', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to place order');
  }
});

export const fetchMyOrders = createAsyncThunk('orders/mine', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders/mine');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/orders/admin?${query}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status, trackingNumber }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/${id}/status`, { status, trackingNumber });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    myOrders: [], allOrders: [], current: null,
    loading: false, error: null, success: false,
  },
  reducers: {
    clearOrderState(state) { state.success = false; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (s) => { s.loading = true; s.error = null; s.success = false; })
      .addCase(createOrder.fulfilled, (s, a) => { s.loading = false; s.success = true; s.current = a.payload; s.myOrders.unshift(a.payload); })
      .addCase(createOrder.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchMyOrders.fulfilled, (s, a) => { s.myOrders = a.payload; })
      .addCase(fetchOrder.fulfilled, (s, a) => { s.current = a.payload; })
      .addCase(fetchAllOrders.fulfilled, (s, a) => { s.allOrders = a.payload.orders || []; })
      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        const idx = s.allOrders.findIndex(o => o._id === a.payload._id);
        if (idx > -1) s.allOrders[idx] = a.payload;
      });
  },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
