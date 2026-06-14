import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api"; // your axios instance

// ─────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────
export const fetchLoyaltySummary = createAsyncThunk(
  "loyalty/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/loyalty");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load loyalty data");
    }
  }
);

export const redeemLoyaltyPoints = createAsyncThunk(
  "loyalty/redeem",
  async ({ points, orderId, redeemType }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/loyalty/redeem", {
        points,
        orderId,
        redeemType,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Redemption failed");
    }
  }
);

export const applyReferralCode = createAsyncThunk(
  "loyalty/applyReferral",
  async (referralCode, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/loyalty/referral/apply", {
        referralCode,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Invalid referral code");
    }
  }
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────
const loyaltySlice = createSlice({
  name: "loyalty",
  initialState: {
    loyaltyPoints: 0,
    totalPointsEarned: 0,
    referralCode: null,
    discountValue: 0,
    minRedeemPoints: 500,
    freeShippingPoints: 300,
    canRedeem: false,
    transactions: [],
    loading: false,
    error: null,
    redeemSuccess: null,
    referralSuccess: null,
  },
  reducers: {
    clearLoyaltyMessages(state) {
      state.error = null;
      state.redeemSuccess = null;
      state.referralSuccess = null;
    },
  },
  extraReducers: (builder) => {
    // fetchLoyaltySummary
    builder
      .addCase(fetchLoyaltySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoyaltySummary.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchLoyaltySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // redeemLoyaltyPoints
    builder
      .addCase(redeemLoyaltyPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemLoyaltyPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.loyaltyPoints = action.payload.remainingPoints;
        state.redeemSuccess = `₹${action.payload.discountAmount} discount applied!`;
      })
      .addCase(redeemLoyaltyPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // applyReferralCode
    builder
      .addCase(applyReferralCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyReferralCode.fulfilled, (state, action) => {
        state.loading = false;
        state.referralSuccess = action.payload.message;
      })
      .addCase(applyReferralCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLoyaltyMessages } = loyaltySlice.actions;
export default loyaltySlice.reducer;
