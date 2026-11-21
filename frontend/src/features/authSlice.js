import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { unwrap, errorMessage } from "../api/client";

// Check the current session
export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const data = unwrap(await api.get("/auth/me"));
      return data.user ?? data;
    } catch (error) {
      // A visitor without a session is simply a guest
      if (error.response?.status === 401) {
        return null;
      }

      return rejectWithValue(errorMessage(error));
    }
  }
);

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (body, { dispatch, rejectWithValue }) => {
    try {
      await api.post("/auth/login", body);

      const user = await dispatch(fetchMe()).unwrap();

      if (!user) {
        return rejectWithValue("Login succeeded, but user details could not be loaded.");
      }

      return user;
    } catch (error) {
      return rejectWithValue(
        typeof error === "string" ? error : errorMessage(error)
      );
    }
  }
);

// Register
export const register = createAsyncThunk(
  "auth/register",
  async (body, { dispatch, rejectWithValue }) => {
    try {
      await api.post("/auth/register", body);

      const user = await dispatch(fetchMe()).unwrap();

      if (!user) {
        return rejectWithValue("Registration succeeded, but user details could not be loaded.");
      }

      return user;
    } catch (error) {
      return rejectWithValue(
        typeof error === "string" ? error : errorMessage(error)
      );
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const data = unwrap(await api.patch("/auth/profile", formData));
      return data.user ?? data;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  }
);

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // Even if server logout fails, clear local user state
  }
});

const initialState = {
  user: null,
  status: "idle",
  error: null,
  checked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    resetAuth: (state) => {
      state.user = null;
      state.error = null;
      state.status = "idle";
      state.checked = true;
    },
  },

  extraReducers: (builder) => {
    builder
      // Session check
      .addCase(fetchMe.pending, (state) => {
        state.checked = false;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.checked = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.checked = true;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
        state.checked = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
        state.checked = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload;
      })

      // Profile update
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.error = null;
        state.status = "idle";
        state.checked = true;
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;

export default authSlice.reducer;