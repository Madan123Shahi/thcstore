import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const createOrder = createAsyncThunk(
  "orders/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/orders", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to place order",
      );
    }
  },
);

export const fetchMyOrders = createAsyncThunk(
  "orders/mine",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/orders/mine");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  },
);

export const fetchOrder = createAsyncThunk(
  "orders/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/orders/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  },
);

export const fetchAllOrders = createAsyncThunk(
  "orders/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/orders/admin?${query}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, status, trackingNumber }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/orders/${id}/status`, {
        status,
        trackingNumber,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  },
);

// ✅ New — refund a paid Stripe order (admin only)
export const refundOrder = createAsyncThunk(
  "orders/refund",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`/orders/${id}/refund`);
      return res.data.order; // ✅ return updated order from backend
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Refund failed");
    }
  },
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    myOrders: [],
    allOrders: [],
    current: null,
    loading: false,
    refunding: false, // ✅ separate loading state for refund
    error: null,
    success: false,
  },
  reducers: {
    clearOrderState(state) {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── createOrder ──────────────────────────────
      .addCase(createOrder.pending, (s) => {
        s.loading = true;
        s.error = null;
        s.success = false;
      })
      .addCase(createOrder.fulfilled, (s, a) => {
        s.loading = false;
        s.success = true;
        s.current = a.payload;
        s.myOrders.unshift(a.payload);
      })
      .addCase(createOrder.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ── fetchMyOrders ────────────────────────────
      .addCase(fetchMyOrders.fulfilled, (s, a) => {
        s.myOrders = a.payload;
      })

      // ── fetchOrder ───────────────────────────────
      .addCase(fetchOrder.fulfilled, (s, a) => {
        s.current = a.payload;
      })

      // ── fetchAllOrders ───────────────────────────
      .addCase(fetchAllOrders.fulfilled, (s, a) => {
        s.allOrders = a.payload.orders || [];
      })

      // ── updateOrderStatus ────────────────────────
      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        const idx = s.allOrders.findIndex((o) => o._id === a.payload._id);
        if (idx > -1) s.allOrders[idx] = a.payload;
      })

      // ── refundOrder ──────────────────────────────
      .addCase(refundOrder.pending, (s) => {
        s.refunding = true;
        s.error = null;
      })
      .addCase(refundOrder.fulfilled, (s, a) => {
        s.refunding = false;
        // ✅ Update the refunded order in allOrders list immediately
        const idx = s.allOrders.findIndex((o) => o._id === a.payload._id);
        if (idx > -1) s.allOrders[idx] = a.payload;
        // ✅ Update current order if it's the same one
        if (s.current?._id === a.payload._id) s.current = a.payload;
      })
      .addCase(refundOrder.rejected, (s, a) => {
        s.refunding = false;
        s.error = a.payload;
      });
  },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
