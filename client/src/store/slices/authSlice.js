import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// ───────────────── REGISTER ─────────────────
export const register = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Registration failed",
      );
    }
  },
);

// ───────────────── LOGIN ─────────────────
export const login = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Login failed");
    }
  },
);

// ───────────────── FETCH USER ─────────────────
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch user",
      );
    }
  },
);

// ───────────────── UPDATE PROFILE ─────────────────
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.put("/auth/profile", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Update failed");
    }
  },
);

// ───────────────── ADD ADDRESS ─────────────────
export const addAddress = createAsyncThunk(
  "auth/addAddress",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/address", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to add address",
      );
    }
  },
);

// ───────────────── SLICE ─────────────────
const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    token: null,

    // Separate loading states
    registerLoading: false,
    loginLoading: false,
    fetchMeLoading: false,
    updateProfileLoading: false,
    addAddressLoading: false,

    // Separate error states
    registerError: null,
    loginError: null,
    fetchMeError: null,
    updateProfileError: null,
    addAddressError: null,
  },

  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
    },

    clearError(state) {
      state.registerError = null;
      state.loginError = null;
      state.fetchMeError = null;
      state.updateProfileError = null;
      state.addAddressError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ───────── REGISTER ─────────
      .addCase(register.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
      })

      .addCase(register.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })

      .addCase(register.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError = action.payload;
      })

      // ───────── LOGIN ─────────
      .addCase(login.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })

      .addCase(login.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload;
      })

      // ───────── FETCH USER ─────────
      .addCase(fetchMe.pending, (state) => {
        state.fetchMeLoading = true;
        state.fetchMeError = null;
      })

      .addCase(fetchMe.fulfilled, (state, action) => {
        state.fetchMeLoading = false;
        state.user = action.payload;
      })

      .addCase(fetchMe.rejected, (state, action) => {
        state.fetchMeLoading = false;
        state.fetchMeError = action.payload;
      })

      // ───────── UPDATE PROFILE ─────────
      .addCase(updateProfile.pending, (state) => {
        state.updateProfileLoading = true;
        state.updateProfileError = null;
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateProfileLoading = false;
        state.user = action.payload;
      })

      .addCase(updateProfile.rejected, (state, action) => {
        state.updateProfileLoading = false;
        state.updateProfileError = action.payload;
      })

      // ───────── ADD ADDRESS ─────────
      .addCase(addAddress.pending, (state) => {
        state.addAddressLoading = true;
        state.addAddressError = null;
      })

      .addCase(addAddress.fulfilled, (state, action) => {
        state.addAddressLoading = false;

        if (state.user) {
          state.user.addresses = action.payload;
        }
      })

      .addCase(addAddress.rejected, (state, action) => {
        state.addAddressLoading = false;
        state.addAddressError = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
