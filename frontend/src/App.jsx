
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchMe } from "./features/authSlice";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GoogleSuccess from "./pages/GoogleSuccess";

import Suites from "./pages/Suites";
import Profile from "./pages/Profile";
import Pets from "./pages/Pets";
import PetCareLogs from "./pages/PetCareLogs";
import PetHealthLogs from "./pages/PetHealthLogs";
import Bookings from "./pages/Bookings";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSuites from "./pages/admin/AdminSuites";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";

import StaffCareLogs from "./pages/staff/StaffCareLogs";
import VetHealthLogs from "./pages/vet/VetHealthLogs";

export default function App() {
  const dispatch = useDispatch();

  // Check whether a user already has a valid session
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />
          <Route path="/suites" element={<Suites />} />

          {/* Any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Pet owner routes */}
          <Route element={<ProtectedRoute roles={["PET_OWNER"]} />}>
            <Route path="/pets" element={<Pets />} />
            <Route path="/pets/:petId/care" element={<PetCareLogs />} />
            <Route path="/pets/:petId/health" element={<PetHealthLogs />} />
            <Route path="/bookings" element={<Bookings />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/suites" element={<AdminSuites />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          {/* Staff routes */}
          <Route element={<ProtectedRoute roles={["STAFF", "ADMIN"]} />}>
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/staff/care-logs" element={<StaffCareLogs />} />
          </Route>

          {/* Veterinarian routes */}
          <Route
            element={<ProtectedRoute roles={["VETERINARIAN", "ADMIN"]} />}
          >
            <Route path="/vet/health-logs" element={<VetHealthLogs />} />
          </Route>

          {/* Unknown routes */}
          <Route
            path="*"
            element={
              <p className="text-center py-5">
                Page not found.
              </p>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
