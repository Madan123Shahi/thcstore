import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// ✅ Validate coupon at checkout
export const validateCoupon = createAsyncThunk(
  "coupon/validate",
  async ({ code, orderTotal, shippingPrice }, { rejectWithValue }) => {
    try {
      const res = await api.post("/coupons/validate", {
        code,
        orderTotal,
        shippingPrice,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Invalid coupon");
    }
  },
);

const couponSlice = createSlice({
  name: "coupon",
  initialState: {
    code: "",
    discountAmount: 0,
    discountType: null,
    description: null,
    loading: false,
    error: null,
    applied: false,
  },
  reducers: {
    // ✅ Remove applied coupon
    removeCoupon(state) {
      state.code = "";
      state.discountAmount = 0;
      state.discountType = null;
      state.description = null;
      state.applied = false;
      state.error = null;
    },
    clearCouponError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateCoupon.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(validateCoupon.fulfilled, (s, a) => {
        s.loading = false;
        s.applied = true;
        s.code = a.payload.coupon.code;
        s.discountAmount = a.payload.discountAmount;
        s.discountType = a.payload.coupon.discountType;
        s.description = a.payload.coupon.description;
        s.error = null;
      })
      .addCase(validateCoupon.rejected, (s, a) => {
        s.loading = false;
        s.applied = false;
        s.discountAmount = 0;
        s.error = a.payload;
      });
  },
});

export const { removeCoupon, clearCouponError } = couponSlice.actions;
export default couponSlice.reducer;
