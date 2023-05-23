import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  loading: false,
  cart: [],
  error: "",
};

export const fetchCartData = createAsyncThunk(
  "cart/fetchCartData",
  async (email) => {
    const res = await axios.get(
      `https://depot-d06m.onrender.com/${email}/cart`
    );
    const data = res.data;
    return data;
  }
);

export const addProductToCart = createAsyncThunk(
  "cart/addProductToCart",
  async ({ product, email }) => {
    const { id, price, title, image } = product;
    const qty = 1;
    try {
      const response = await axios.post(
        `https://depot-d06m.onrender.com/${email}/cart`,
        {
          email,
          id,
          price,
          title,
          image,
          qty,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const removeProductFromCart = createAsyncThunk(
  "cart/removeProductFromCart",
  async ({ product, email }) => {
    try {
      const response = await axios.delete(
        `https://depot-d06m.onrender.com/${email}/cart/${product.id}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
);

export const updateCart = createAsyncThunk(
  "cart/updateCart",
  async ({ email, product, qty }) => {
    try {
      const res = await axios.put(
        `https://depot-d06m.onrender.com/${email}/cart/${product.id}`,
        {
          qty,
        }
      );
      const data = res.data;
      console.log(data);
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
      state.loading = false;
      state.cart = state.cart.filter(
        (product) => product.id === action.payload
      );
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
      const { product } = action.payload;

      const updatedCart = state.cart.map((item) => {
        const updatedItem = product.find((p) => p.id === item.id);
        if (updatedItem) {
          return { ...item, qty: updatedItem.qty };
        }
        return item;
      });

      state.cart = updatedCart;
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
