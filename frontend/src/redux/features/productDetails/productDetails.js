import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = { loading: false, product: [], error: "" };

export const fetchProductDetails = createAsyncThunk(
  "/productDetails/fetchProductDetails",
  async (productId) => {
    const res = await axios.get(
      `https://depot-d06m.onrender.com/products/${productId}`
    );
    const data = res.data;
    return data;
  }
);

const productDetailsSlice = createSlice({
  name: "productDetails",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchProductDetails.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProductDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.product = action.payload;
      state.error = "";
    });
    builder.addCase(fetchProductDetails.rejected, (state, action) => {
      state.loading = false;
      state.product = [];
      state.error = "";
    });
  },
});

export default productDetailsSlice.reducer;
