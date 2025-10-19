import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../../config/axiosConfig";

const initialState = {
  loading: false,
  cart: [],
  error: "",
};

export const fetchCartData = createAsyncThunk(
  "cart/fetchCartData",
  async () => {
    const res = await apiClient.get(`/cart`);
    const data = res.data.products;
    return data;
  }
);

export const addProductToCart = createAsyncThunk(
  "cart/addProductToCart",
  async ({ product }) => {
    const { id } = product;
    const quantity = 1;
    try {
      const response = await apiClient.post(`/cart`, {
        id,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const removeProductFromCart = createAsyncThunk(
  "cart/removeProductFromCart",
  async ({ product }) => {
    try {
      const response = await apiClient.delete(`/cart/${product.id}`);
      return response.data.products;
    } catch (error) {
      console.error(error);
    }
  }
);

export const updateCart = createAsyncThunk(
  "cart/updateCart",
  async ({ product, quantity }) => {
    try {
      const res = await apiClient.put(`/cart/${product.id}`, {
        quantity,
      });
      const data = res.data.products;
      return data;
    } catch (error) {
      console.error(error);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetch cart data
    builder.addCase(fetchCartData.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCartData.fulfilled, (state, action) => {
      state.loading = false;
      state.cart = action.payload;
      state.error = "";
    });
    builder.addCase(fetchCartData.rejected, (state, action) => {
      state.loading = false;
      state.cart = [];
      state.error = action.payload;
    });
    // add to cart
    builder.addCase(addProductToCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addProductToCart.fulfilled, (state, action) => {
      state.loading = false;
      state.cart.push(action.payload);
      state.error = "";
    });
    builder.addCase(addProductToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    // remove from cart
    builder.addCase(removeProductFromCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(removeProductFromCart.fulfilled, (state, action) => {
      console.log(state, action);
      state.loading = false;
      state.cart = action.payload;
      state.error = "";
    });
    builder.addCase(removeProductFromCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    // update cart
    builder.addCase(updateCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateCart.fulfilled, (state, action) => {
      state.loading = false;
      state.cart = action.payload;
      state.error = "";
    });

    builder.addCase(updateCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export const selectCartQty = (state) => state.cart.cart.length;

export default cartSlice.reducer;
