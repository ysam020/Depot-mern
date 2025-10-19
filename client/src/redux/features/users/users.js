// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import apiClient from "../../../config/axiosConfig";

// // Retrieve the user data from local storage
// const userFromStorage = JSON.parse(localStorage.getItem("user"));

// // Set the initial state to the user data from storage (if available)
// const initialState = {
//   loading: false,
//   user: userFromStorage ? userFromStorage : "",
//   error: "",
// };

// export const login = createAsyncThunk("login/login", async (values) => {
//   try {
//     const res = await apiClient.post("/auth/signin", values);
//     const data = res.data;
//     if (data.success) {
//       // Save user info and token in localStorage
//       localStorage.setItem(
//         "user",
//         JSON.stringify({
//           id: data.user.id,
//           name: data.user.name,
//           email: data.user.email,
//           token: data.accessToken,
//         })
//       );

//       return data;
//     } else {
//       alert(res.data.message);
//     }
//   } catch (err) {
//     console.error("Login error:", err);
//     throw err;
//   }
// });

// export const register = createAsyncThunk(
//   "register/register",
//   async (values) => {
//     const res = await apiClient.post("/auth/signup", values);
//     const data = res.data;
//     if (data.message === "User Registered Successfull") {
//       localStorage.setItem(
//         "user",
//         JSON.stringify({
//           name: data.user.name,
//           email: data.user.email,
//         })
//       );
//       return data;
//     } else if (data.message === "Password didn't match") {
//       alert("Password didn't match");
//     } else {
//       alert("User not registered");
//     }
//   }
// );

// const userSlice = createSlice({
//   name: "users",
//   initialState,
//   extraReducers: (builder) => {
//     builder.addCase(login.pending, (state) => {
//       state.loading = true;
//     });
//     builder.addCase(login.fulfilled, (state, action) => {
//       state.loading = false;
//       state.user = { ...action.payload };
//       state.error = "";
//     });
//     builder.addCase(login.rejected, (state, action) => {
//       state.loading = false;
//       state.user = {};
//       state.error = action.payload;
//     });
//     builder.addCase(register.pending, (state) => {
//       state.loading = true;
//     });
//     builder.addCase(register.fulfilled, (state, action) => {
//       state.loading = false;
//       state.user = { ...action.payload };
//       state.error = "";
//     });
//     builder.addCase(register.rejected, (state, action) => {
//       state.loading = false;
//       state.user = {};
//       state.error = action.payload;
//     });
//   },
// });

// export default userSlice.reducer;
// export const { signin, signout } = userSlice.actions;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Retrieve the user data from local storage
const userFromStorage = localStorage.getItem("user");
let parsedUser = null;

if (userFromStorage) {
  try {
    parsedUser = JSON.parse(userFromStorage);
  } catch (err) {
    console.error("Failed to parse stored user:", err);
    localStorage.removeItem("user");
  }
}

// Set the initial state to the user data from storage (if available)
const initialState = {
  loading: false,
  user: parsedUser || null, // Ensure it's null instead of undefined
  error: "",
};

export const login = createAsyncThunk(
  "login/login",
  async (values, { rejectWithValue }) => {
    try {
      // Use plain axios for auth endpoints to avoid interceptor issues
      const res = await axios.post(
        "http://localhost:9000/api/v1/auth/signin",
        values
      );
      const data = res.data;

      if (data.success) {
        console.log("logged in");

        // Store BOTH access token and refresh token
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          accessToken: data.accessToken, // Store access token
          refreshToken: data.refreshToken, // Store refresh token
        };

        localStorage.setItem("user", JSON.stringify(userData));

        return userData;
      } else {
        return rejectWithValue(data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "register/register",
  async (values, { rejectWithValue }) => {
    try {
      // Use plain axios for auth endpoints
      const res = await axios.post(
        "http://localhost:9000/api/v1/auth/signup",
        values
      );
      const data = res.data;

      if (data.success) {
        const userData = {
          name: data.user.name,
          email: data.user.email,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        return userData;
      } else {
        return rejectWithValue(data.message || "User not registered");
      }
    } catch (err) {
      console.error("Registration error:", err);
      return rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

// Action to logout
export const logout = createAsyncThunk("user/logout", async () => {
  localStorage.removeItem("user");
  return null;
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // Manual logout action
    signout: (state) => {
      state.user = null;
      localStorage.removeItem("user");
    },
    // Update tokens after refresh
    updateTokens: (state, action) => {
      if (state.user) {
        state.user.accessToken = action.payload.accessToken;
        if (action.payload.refreshToken) {
          state.user.refreshToken = action.payload.refreshToken;
        }
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = "";
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = "";
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = "";
      });
  },
});

export default userSlice.reducer;
export const { signout, updateTokens } = userSlice.actions;
