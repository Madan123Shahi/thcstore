import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/**
 * Fetch All Products
 */
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();

      const res = await api.get(`/products?${query}`);

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch products",
      );
    }
  },
);

/**
 * Fetch Single Product
 */
export const fetchProduct = createAsyncThunk(
  "products/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/products/${id}`);

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Product not found",
      );
    }
  },
);

/**
 * Fetch Featured Products
 */
export const fetchFeatured = createAsyncThunk(
  "products/featured",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/products/featured");

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch featured products",
      );
    }
  },
);

/**
 * Fetch Best Sellers
 */
export const fetchBestSellers = createAsyncThunk(
  "products/bestSellers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/products/bestsellers");

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch best sellers",
      );
    }
  },
);

/**
 * Add Review
 */
export const addReview = createAsyncThunk(
  "products/addReview",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/products/${id}/reviews`, data);

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to submit review",
      );
    }
  },
);

/**
 * Create Product
 */
export const createProduct = createAsyncThunk(
  "products/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/products", data);

      return res.data;
    } catch (err) {
      console.log("🔴 status:", err.response?.status);
      console.log("🔴 full data:", JSON.stringify(err.response?.data));
      return rejectWithValue(
        err.response?.data?.message || "Failed to create product",
      );
    }
  },
);

/**
 * Update Product
 */
export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/products/${id}`, data);

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update product",
      );
    }
  },
);

/**
 * Delete Product
 */
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);

      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete product",
      );
    }
  },
);

const productSlice = createSlice({
  name: "products",

  initialState: {
    list: [],
    featured: [],
    bestSellers: [],
    current: null,
    pagination: null,
    loading: false,
    error: null,

    filters: {
      search: "",
      category: "",
      sort: "-createdAt",
      minPrice: "",
      maxPrice: "",
    },
  },

  reducers: {
    setFilters(state, action) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    clearFilters(state) {
      state.filters = {
        search: "",
        category: "",
        sort: "-createdAt",
        minPrice: "",
        maxPrice: "",
      };
    },

    clearCurrent(state) {
      state.current = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /**
       * Fetch Products
       */
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;

        state.list = action.payload.products;

        state.pagination = action.payload.pagination;
      })

      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      })

      /**
       * Fetch Single Product
       */
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;

        state.current = action.payload.product;
      })

      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      })

      /**
       * Featured Products
       */
      .addCase(fetchFeatured.fulfilled, (state, action) => {
        state.featured = action.payload.products;
      })

      /**
       * Best Sellers
       */
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.bestSellers = action.payload.products;
      })

      /**
       * Create Product
       */
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload.product);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProduct.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })

      /**
       * Update Product
       */
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updatedProduct = action.payload.product;

        const idx = state.list.findIndex((p) => p._id === updatedProduct._id);

        if (idx > -1) {
          state.list[idx] = updatedProduct;
        }

        if (state.current?._id === updatedProduct._id) {
          state.current = updatedProduct;
        }
      })

      /**
       * Delete Product
       */
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
      });
  },
});

export const { setFilters, clearFilters, clearCurrent } = productSlice.actions;

export default productSlice.reducer;
