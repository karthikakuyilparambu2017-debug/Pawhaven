import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { unwrap, errorMessage } from "../api/client";

// Finds the real document (the object with an _id) inside a reply like { success, suite: {...} }
const pickDoc = (data) => {
  if (data?._id) return data;
  return (
    Object.values(data || {}).find(
      (v) => v && typeof v === "object" && !Array.isArray(v) && v._id
    ) || null
  );
};

export function makeResource(name, path) {
  const fetchAll = createAsyncThunk(`${name}/fetchAll`, async (_, { rejectWithValue }) => {
    try {
      const data = unwrap(await api.get(path));
      if (Array.isArray(data)) return data;
      return data.items || data[name] || Object.values(data).find(Array.isArray) || [];
    } catch (e) { return rejectWithValue(errorMessage(e)); }
  });

  const create = createAsyncThunk(`${name}/create`, async (body, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post(path, body);
      const doc = pickDoc(res.data) || pickDoc(unwrap(res));
      if (!doc) {
        dispatch(fetchAll());
        return null;
      }
      return doc;
    } catch (e) { return rejectWithValue(errorMessage(e)); }
  });

  // PUT /suites/:id
  const update = createAsyncThunk(`${name}/update`, async ({ id, body }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`${path}/${id}`, body);
      const doc = pickDoc(res.data) || pickDoc(unwrap(res));
      if (!doc) {
        dispatch(fetchAll());
        return null;
      }
      return doc;
    } catch (e) { return rejectWithValue(errorMessage(e)); }
  });

  const remove = createAsyncThunk(`${name}/remove`, async (id, { rejectWithValue }) => {
    try { await api.delete(`${path}/${id}`); return id; }
    catch (e) { return rejectWithValue(errorMessage(e)); }
  });

  // PATCH /bookings/:id/cancel  with { cancellationReason }
  const cancel = createAsyncThunk(`${name}/cancel`, async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`${path}/${id}/cancel`, { cancellationReason: reason || "" });
      return { id, doc: pickDoc(res.data), reason: reason || "" };
    } catch (e) { return rejectWithValue(errorMessage(e)); }
  });

  const slice = createSlice({
    name,
    initialState: { items: [], status: "idle", error: null },
    reducers: {},
    extraReducers: (b) => {
      b.addCase(fetchAll.pending, (s) => { s.status = "loading"; s.error = null; })
       .addCase(fetchAll.fulfilled, (s, a) => { s.status = "idle"; s.items = a.payload; })
       .addCase(fetchAll.rejected, (s, a) => { s.status = "idle"; s.error = a.payload; })
       .addCase(create.pending, (s) => { s.error = null; })
       .addCase(create.fulfilled, (s, a) => { if (a.payload) s.items.unshift(a.payload); })
       .addCase(create.rejected, (s, a) => { s.error = a.payload; })
       .addCase(update.pending, (s) => { s.error = null; })
       .addCase(update.fulfilled, (s, a) => {
         if (!a.payload) return;
         const i = s.items.findIndex((x) => x._id === a.payload._id);
         if (i >= 0) s.items[i] = { ...s.items[i], ...a.payload };
       })
       .addCase(update.rejected, (s, a) => { s.error = a.payload; })
       .addCase(remove.pending, (s) => { s.error = null; })
       .addCase(remove.fulfilled, (s, a) => { s.items = s.items.filter((i) => i._id !== a.payload); })
       .addCase(remove.rejected, (s, a) => { s.error = a.payload; })
       .addCase(cancel.pending, (s) => { s.error = null; })
       .addCase(cancel.fulfilled, (s, a) => {
         const i = s.items.findIndex((x) => x._id === a.payload.id);
         if (i >= 0) {
           s.items[i] = {
             ...s.items[i],
             bookingStatus: a.payload.doc?.bookingStatus || "CANCELLED",
             cancellationReason: a.payload.doc?.cancellationReason ?? a.payload.reason,
           };
         }
       })
       .addCase(cancel.rejected, (s, a) => { s.error = a.payload; });
    },
  });

  return { fetchAll, create, update, remove, cancel, reducer: slice.reducer };
}