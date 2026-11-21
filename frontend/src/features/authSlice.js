import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { unwrap, errorMessage } from "../api/client";

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const data = unwrap(await api.get("/auth/me"));
    return data.user ?? data;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

export const login = createAsyncThunk("auth/login", async (body, { dispatch, rejectWithValue }) => {
  try {
    await api.post("/auth/login", body);
    return await dispatch(fetchMe()).unwrap();
  } catch (e) {
    return rejectWithValue(typeof e === "string" ? e : errorMessage(e));
  }
});

export const register = createAsyncThunk("auth/register", async (body, { dispatch, rejectWithValue }) => {
  try {
    await api.post("/auth/register", body);
    return await dispatch(fetchMe()).unwrap();
  } catch (e) {
    return rejectWithValue(typeof e === "string" ? e : errorMessage(e));
  }
});

// Sends name and/or photo as FormData and returns the updated user
export const updateProfile = createAsyncThunk("auth/updateProfile", async (formData, { rejectWithValue }) => {
  try {
    const data = unwrap(await api.patch("/auth/profile", formData));
    return data.user ?? data;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  try { await api.post("/auth/logout"); } catch { /* ignore */ }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, status: "idle", error: null, checked: false },
  reducers: { clearError: (s) => { s.error = null; },  resetAuth: (s) => {
    s.user = null;
    s.error = null;
    s.status = "idle";
    s.checked = true;
  }, },

  extraReducers: (b) => {
    b.addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; s.checked = true; })
     .addCase(fetchMe.rejected, (s) => { s.user = null; s.checked = true; })
     .addCase(login.pending, (s) => { s.status = "loading"; s.error = null; })
     .addCase(login.fulfilled, (s, a) => { s.status = "idle"; s.user = a.payload; })
     .addCase(login.rejected, (s, a) => { s.status = "idle"; s.error = a.payload; })
     .addCase(register.pending, (s) => { s.status = "loading"; s.error = null; })
     .addCase(register.fulfilled, (s, a) => { s.status = "idle"; s.user = a.payload; })
     .addCase(register.rejected, (s, a) => { s.status = "idle"; s.error = a.payload; })
     .addCase(updateProfile.fulfilled, (s, a) => { s.user = { ...s.user, ...a.payload }; })
     .addCase(logout.fulfilled, (s) => { s.user = null; s.checked = true; });
  },
});

export const { clearError,resetAuth} = authSlice.actions;
export default authSlice.reducer;