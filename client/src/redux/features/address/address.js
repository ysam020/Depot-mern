import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = { loading: false, address: [], error: "" };

export const fetchAddress = createAsyncThunk(
  "/address/fetchAddress",
  async (email) => {
    const res = await axios.get(`http://localhost:9002/${email}/address`);
    const data = res.data;
    return data;
  }
);

export const addAddress = createAsyncThunk(
  "/address/addAddress",
  async ({ email, address }) => {
    const res = await axios.post(
      `http://localhost:9002/${email}/address`,
      address
    );
    const data = res.data;
    return data;
  }
);

export const deleteAddress = createAsyncThunk(
  "/address/deleteAddress",
  async ({ email, address }) => {
    try {
      const res = await axios.delete(`http://localhost:9002/${email}/address`, {
        headers: {
          "Content-Type": "application/json",
        },
        data: address,
      });

      const data = res.data;
      return data;
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchAddress.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchAddress.fulfilled, (state, action) => {
      state.loading = false;
      state.address = action.payload;
      state.error = "";
    });
    builder.addCase(fetchAddress.rejected, (state, action) => {
      state.loading = false;
      state.address = [];
      state.error = action.payload;
    });
    builder.addCase(addAddress.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addAddress.fulfilled, (state, action) => {
      state.loading = false;
      state.address.push(action.payload);
      state.error = "";
    });
    builder.addCase(addAddress.rejected, (state, action) => {
      state.loading = false;
      state.address = [];
      state.error = action.payload;
    });
    builder.addCase(deleteAddress.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteAddress.fulfilled, (state, action) => {
      state.loading = false;
      state.address = state.address.filter(
        (address) => address.id === action.payload
      );
      state.error = "";
    });
    builder.addCase(deleteAddress.rejected, (state, action) => {
      state.loading = false;
      state.address = [];
      state.error = action.payload;
    });
  },
});

export default addressSlice.reducer;
