import { configureStore } from "@reduxjs/toolkit";
import auth from "../features/authSlice.js";
import pets from "../features/petsSlice.js";
import suites from "../features/suitesSlice.js";
import bookings from "../features/bookingsSlice.js";

export const store = configureStore({
  reducer: { auth, pets, suites, bookings },
});

export default store;