import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../../config/axiosConfig";

const initialState = {
  loading: false,
  wishlist: [],
  error: "",
};

export const fetchWishlistData = createAsyncThunk(
  "wishlist/fetchWishlistData",
  async () => {
    const res = await apiClient.get(`/wishlist`);
    const data = res.data.data.wishlist;
    return data;
  }
);

export const addProductToWishlist = createAsyncThunk(
  "wishlist/addProductToWishlist",
  async ({ product }) => {
    const { id } = product;
    try {
      const response = await apiClient.post(`/wishlist`, {
        id,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const removeProductFromWishlist = createAsyncThunk(
  "cart/removeProductFromWishlist",
  async ({ product }) => {
    try {
      const response = await apiClient.delete(`/wishlist/${product.id}`);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchWishlistData.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchWishlistData.fulfilled, (state, action) => {
      state.loading = false;
      state.wishlist = action.payload;
      state.error = "";
    });
    builder.addCase(fetchWishlistData.rejected, (state, action) => {
      state.loading = false;
      state.wishlist = [];
      state.error = action.payload;
    });
    builder.addCase(addProductToWishlist.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addProductToWishlist.fulfilled, (state, action) => {
      state.loading = false;
      state.wishlist.push(action.payload);
      state.error = "";
    });
    builder.addCase(addProductToWishlist.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(removeProductFromWishlist.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(removeProductFromWishlist.fulfilled, (state, action) => {
      state.loading = false;
      state.wishlist = state.wishlist.filter(
        (product) => product.id === action.payload
      );
      state.error = "";
    });
    builder.addCase(removeProductFromWishlist.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export const selectWishlistQty = (state) => state.wishlist.wishlist.length;

export default wishlistSlice.reducer;
