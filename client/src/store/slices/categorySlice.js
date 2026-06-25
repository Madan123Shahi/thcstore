import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/categories");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (categoryData, { rejectWithValue }) => {
    try {
      const res = await api.post("/categories", categoryData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/categories/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState: { list: [], loading: false, error: null },
  reducers: {
    clearCategoryError: (s) => {
      s.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchCategories.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchCategories.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchCategories.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // create
      .addCase(createCategory.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createCategory.fulfilled, (s, a) => {
        s.loading = false;
        s.list.push(a.payload);
      })
      .addCase(createCategory.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // update
      .addCase(updateCategory.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateCategory.fulfilled, (s, a) => {
        s.loading = false;
        const idx = s.list.findIndex((c) => c._id === a.payload._id);
        if (idx !== -1) s.list[idx] = a.payload;
      })
      .addCase(updateCategory.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // delete
      .addCase(deleteCategory.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(deleteCategory.fulfilled, (s, a) => {
        s.loading = false;
        s.list = s.list.filter((c) => c._id !== a.payload);
      })
      .addCase(deleteCategory.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
