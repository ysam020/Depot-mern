import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  products: [],
  error: "",
};

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ filterCategory, sortCategory }) => {
    const res = await axios.get("https://depot-d06m.onrender.com/products");
    let data = res.data;
    // Filter
    if (filterCategory !== "") {
      data = data.filter(
        (product) =>
          product.category.toLowerCase().trim() ===
            filterCategory.toLowerCase() ||
          product.color.toLowerCase() === filterCategory.toLowerCase() ||
          product.material.toLowerCase() === filterCategory.toLowerCase()
      );
    }
    // Sort
    if (sortCategory === "Sort by Price: Low to high") {
      data = data.sort((a, b) => a.price - b.price);
    } else if (sortCategory === "Sort by Price: High to low") {
      data = data.sort((a, b) => b.price - a.price);
    } else if (sortCategory === "Sort by Rating") {
      data = data.sort((a, b) => b.rating.rate - a.rating.rate);
    }
    return data;
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
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
