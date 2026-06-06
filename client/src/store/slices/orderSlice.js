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

export const refundOrder = createAsyncThunk('orders/refund', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/${id}/refund`);
    return res.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Refund failed');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    myOrders:  [],
    allOrders: [],
    current:   null,
    loading:   false,
    refunding: false,
    error:     null,
    success:   false,
  },
  reducers: {
    clearOrderState(state) {
      state.success = false;
      state.error   = null;
    },

    // ✅ Real-time order update from Socket.io
    // Called by useSocket when order:updated event is received
    updateOrderRealTime(state, action) {
      const { orderId, orderStatus, isPaid, trackingNumber } = action.payload;

      // Update in myOrders list
      const myIdx = state.myOrders.findIndex(o => o._id === orderId);
      if (myIdx > -1) {
        state.myOrders[myIdx] = {
          ...state.myOrders[myIdx],
          orderStatus,
          isPaid:        isPaid ?? state.myOrders[myIdx].isPaid,
          trackingNumber: trackingNumber || state.myOrders[myIdx].trackingNumber,
        };
      }

      // Update in allOrders list (admin)
      const allIdx = state.allOrders.findIndex(o => o._id === orderId);
      if (allIdx > -1) {
        state.allOrders[allIdx] = {
          ...state.allOrders[allIdx],
          orderStatus,
          isPaid:        isPaid ?? state.allOrders[allIdx].isPaid,
          trackingNumber: trackingNumber || state.allOrders[allIdx].trackingNumber,
        };
      }

      // Update current order if viewing it
      if (state.current?._id === orderId) {
        state.current = {
          ...state.current,
          orderStatus,
          isPaid:        isPaid ?? state.current.isPaid,
          trackingNumber: trackingNumber || state.current.trackingNumber,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending,   (s) => { s.loading = true; s.error = null; s.success = false; })
      .addCase(createOrder.fulfilled, (s, a) => { s.loading = false; s.success = true; s.current = a.payload; s.myOrders.unshift(a.payload); })
      .addCase(createOrder.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchMyOrders.fulfilled, (s, a) => { s.myOrders = a.payload; })
      .addCase(fetchOrder.fulfilled,    (s, a) => { s.current  = a.payload; })
      .addCase(fetchAllOrders.fulfilled,(s, a) => { s.allOrders = a.payload.orders || []; })

      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        const idx = s.allOrders.findIndex(o => o._id === a.payload._id);
        if (idx > -1) s.allOrders[idx] = a.payload;
      })

      .addCase(refundOrder.pending,   (s) => { s.refunding = true; s.error = null; })
      .addCase(refundOrder.fulfilled, (s, a) => {
        s.refunding = false;
        const idx = s.allOrders.findIndex(o => o._id === a.payload._id);
        if (idx > -1) s.allOrders[idx] = a.payload;
        if (s.current?._id === a.payload._id) s.current = a.payload;
      })
      .addCase(refundOrder.rejected,  (s, a) => { s.refunding = false; s.error = a.payload; });
  },
});

export const { clearOrderState, updateOrderRealTime } = orderSlice.actions;
export default orderSlice.reducer;