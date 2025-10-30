import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../config/axiosConfig";

const initialState = {
  loading: false,
  products: [],
  error: "",
};

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ filterCategory, sortCategory }, { rejectWithValue }) => {
    try {
      const res = await apiClient("/products");
      let data = [];

      if (res.data.success) {
        data = res.data.data.products;
      }

      // Filter
      if (filterCategory !== "") {
        data = data.filter(
          (product) =>
            product.category?.toLowerCase().trim() ===
              filterCategory.toLowerCase() ||
            product.color?.toLowerCase() === filterCategory.toLowerCase() ||
            product.material?.toLowerCase() === filterCategory.toLowerCase()
        );
      }

      // Sort
      if (sortCategory === "Sort by Price: Low to high") {
        data = data.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (sortCategory === "Sort by Price: High to low") {
        data = data.sort((a, b) => (b.price || 0) - (a.price || 0));
      } else if (sortCategory === "Sort by Rating") {
        data = data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      return data;
    } catch (error) {
      console.error("Fetch products error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload;
      state.error = "";
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.products = [];
      state.error = action.payload;
    });
  },
});

export default productSlice.reducer;
