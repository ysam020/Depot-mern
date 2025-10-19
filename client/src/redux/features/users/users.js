import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import apiClient from "../../../config/axiosConfig";

// Retrieve the user data from local storage
const userFromStorage = JSON.parse(localStorage.getItem("user"));

// Set the initial state to the user data from storage (if available)
const initialState = {
  loading: false,
  user: userFromStorage ? userFromStorage : "",
  error: "",
};

export const login = createAsyncThunk("login/login", async (values) => {
  try {
    const res = await apiClient.post("/signin", values);
    const data = res.data;

    if (data.success) {
      console.log("logged in");

      // Save user info and token in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          token: data.token, // <-- store the JWT token
        })
      );

      return data;
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
});

export const register = createAsyncThunk(
  "register/register",
  async (values) => {
    const res = await apiClient.post("/signup", values);
    const data = res.data;
    if (data.message === "User Registered Successfull") {
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: data.user.name,
          email: data.user.email,
        })
      );
      return data;
    } else if (data.message === "Password didn't match") {
      alert("Password didn't match");
    } else {
      alert("User not registered");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = { ...action.payload };
      state.error = "";
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.user = {};
      state.error = action.payload;
    });
    builder.addCase(register.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = { ...action.payload };
      state.error = "";
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.user = {};
      state.error = action.payload;
    });
  },
});

export default userSlice.reducer;
export const { signin, signout } = userSlice.actions;
