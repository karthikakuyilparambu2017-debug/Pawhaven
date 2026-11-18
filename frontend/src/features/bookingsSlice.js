import { makeResource } from "./resourceSlice.js";
export const bookings = makeResource("bookings", "/bookings");
export const { fetchAll: fetchBookings, create: addBooking, cancel: cancelBooking } = bookings;
export default bookings.reducer;