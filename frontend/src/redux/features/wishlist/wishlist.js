import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  loading: false,
  wishlist: [],
  error: "",
};

export const fetchWishlistData = createAsyncThunk(
  "wishlist/fetchWishlistData",
  async (email) => {
    const res = await axios.get(
      `https://depot-d06m.onrender.com/${email}/wishlist`
    );
    const data = res.data;
    return data;
  }
);

export const addProductToWishlist = createAsyncThunk(
  "wishlist/addProductToWishlist",
  async ({ product, email }) => {
    const { id, price, title, image, rating, shortDescription } = product;
    const qty = 1;
    try {
      const response = await axios.post(
        `https://depot-d06m.onrender.com/${email}/wishlist`,
        {
          email,
          id,
          price,
          title,
          image,
          qty,
          rating,
          shortDescription,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const removeProductFromWishlist = createAsyncThunk(
  "cart/removeProductFromWishlist",
  async ({ product, email }) => {
    try {
      const response = await axios.delete(
        `https://depot-d06m.onrender.com/${email}/wishlist/${product.id}`
      );
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
