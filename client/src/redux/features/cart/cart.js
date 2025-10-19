// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import apiClient from "../../../config/axiosConfig";

// const initialState = {
//   loading: false,
//   cart: [],
//   error: "",
// };

// export const fetchCartData = createAsyncThunk(
//   "cart/fetchCartData",
//   async () => {
//     const res = await apiClient.get(`/cart`);
//     const data = res.data;
//     return data;
//   }
// );

// export const addProductToCart = createAsyncThunk(
//   "cart/addProductToCart",
//   async ({ product }) => {
//     const { id } = product;
//     const quantity = 1;
//     try {
//       const response = await apiClient.post(`/cart`, {
//         id,
//         quantity,
//       });
//       return response.data;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   }
// );

// export const removeProductFromCart = createAsyncThunk(
//   "cart/removeProductFromCart",
//   async ({ product }) => {
//     try {
//       const response = await apiClient.delete(`/cart/${product.id}`);
//       return response.data;
//     } catch (error) {
//       console.error(error);
//     }
//   }
// );

// export const updateCart = createAsyncThunk(
//   "cart/updateCart",
//   async ({ product, quantity }) => {
//     try {
//       const res = await apiClient.put(`/cart/${product.id}`, {
//         quantity,
//       });
//       const data = res.data;
//       return data;
//     } catch (error) {
//       console.error(error);
//     }
//   }
// );

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     // fetch cart data
//     builder.addCase(fetchCartData.pending, (state) => {
//       state.loading = true;
//     });
//     builder.addCase(fetchCartData.fulfilled, (state, action) => {
//       state.loading = false;
//       state.cart = action.payload;
//       state.error = "";
//     });
//     builder.addCase(fetchCartData.rejected, (state, action) => {
//       state.loading = false;
//       state.cart = [];
//       state.error = action.payload;
//     });
//     // add to cart
//     builder.addCase(addProductToCart.pending, (state) => {
//       state.loading = true;
//     });
//     builder.addCase(addProductToCart.fulfilled, (state, action) => {
//       state.loading = false;
//       state.cart.push(action.payload);
//       state.error = "";
//     });
//     builder.addCase(addProductToCart.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.error.message;
//     });
//     // remove from cart
//     builder.addCase(removeProductFromCart.pending, (state) => {
//       state.loading = true;
//     });
//     builder.addCase(removeProductFromCart.fulfilled, (state, action) => {
//       state.loading = false;
//       state.cart = action.payload;
//       state.error = "";
//     });
//     builder.addCase(removeProductFromCart.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.error.message;
//     });
//     // update cart
//     builder.addCase(updateCart.pending, (state) => {
//       state.loading = true;
//     });
//     builder.addCase(updateCart.fulfilled, (state, action) => {
//       state.loading = false;
//       state.cart = action.payload;
//       state.error = "";
//     });

//     builder.addCase(updateCart.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.error.message;
//     });
//   },
// });

// export const selectCartQty = (state) => state.cart.cart.length;

// export default cartSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../../config/axiosConfig";

const initialState = {
  loading: false,
  cart: [],
  error: "",
};

export const fetchCartData = createAsyncThunk(
  "cart/fetchCartData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/cart`);
      // API returns { success, data, message } structure
      // The actual cart items are in res.data.data
      if (res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (error) {
      console.error("Fetch cart error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

export const addProductToCart = createAsyncThunk(
  "cart/addProductToCart",
  async ({ product }, { rejectWithValue }) => {
    const { id } = product;
    const quantity = 1;
    try {
      const response = await apiClient.post(`/cart`, {
        id,
        quantity,
      });
      // API returns { success, data, message } structure
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to add to cart");
    } catch (error) {
      console.error("Add to cart error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to cart"
      );
    }
  }
);

export const removeProductFromCart = createAsyncThunk(
  "cart/removeProductFromCart",
  async ({ product }, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.delete(`/cart/${product.id}`);
      // After deletion, refetch the entire cart
      dispatch(fetchCartData());
      return product.id;
    } catch (error) {
      console.error("Remove from cart error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from cart"
      );
    }
  }
);

export const updateCart = createAsyncThunk(
  "cart/updateCart",
  async ({ product, quantity }, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.put(`/cart/${product.id}`, {
        quantity,
      });
      // After update, refetch the entire cart
      dispatch(fetchCartData());
      return { id: product.id, quantity };
    } catch (error) {
      console.error("Update cart error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update cart"
      );
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = [];
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    // fetch cart data
    builder.addCase(fetchCartData.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCartData.fulfilled, (state, action) => {
      state.loading = false;
      state.cart = action.payload || [];
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
      // Check if item already exists
      const existingIndex = state.cart.findIndex(
        (item) => item.id === action.payload.id
      );
      if (existingIndex >= 0) {
        // Update quantity if exists
        state.cart[existingIndex] = action.payload;
      } else {
        // Add new item
        state.cart.push(action.payload);
      }
      state.error = "";
    });
    builder.addCase(addProductToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // remove product from cart
    builder.addCase(removeProductFromCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(removeProductFromCart.fulfilled, (state) => {
      state.loading = false;
      // Cart will be refreshed by fetchCartData
    });
    builder.addCase(removeProductFromCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // update cart
    builder.addCase(updateCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateCart.fulfilled, (state) => {
      state.loading = false;
      // Cart will be refreshed by fetchCartData
    });
    builder.addCase(updateCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
