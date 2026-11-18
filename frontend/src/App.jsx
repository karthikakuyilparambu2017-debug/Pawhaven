// import { useEffect } from "react";
// import { Route, Routes } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { fetchMe, logout } from "./features/authSlice";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import Suites from "./pages/Suites";
// import Pets from "./pages/Pets";
// import PetCareLogs from "./pages/PetCareLogs";
// import PetHealthLogs from "./pages/PetHealthLogs";
// import Bookings from "./pages/Bookings";
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import AdminSuites from "./pages/admin/AdminSuites";
// import AdminBookings from "./pages/admin/AdminBookings";
// import AdminUsers from "./pages/admin/AdminUsers";
// import StaffCareLogs from "./pages/staff/StaffCareLogs";
// import VetHealthLogs from "./pages/vet/VetHealthLogs";
// import GoogleSuccess from "./pages/GoogleSuccess";

// // A browser tab remembers this flag until the tab is closed.
// // First open of the site in a tab: clear any old login, so the visitor starts on the home page.
// // Refreshing the page in the same tab: keep the person logged in.
// const SESSION_KEY = "pawhaven_tab_started";
// let startup = null; // shared, so React's double run in development only does this once

// function startApp(dispatch) {
//   if (!startup) {
//     startup = (async () => {
//       // Coming back from Google: never clear the login that was just created
//       if (window.location.pathname === "/auth/google/success") {
//         sessionStorage.setItem(SESSION_KEY, "1");
//         await dispatch(fetchMe());
//       } else if (!sessionStorage.getItem(SESSION_KEY)) {
//         // First open of the site in this tab: start logged out
//         sessionStorage.setItem(SESSION_KEY, "1");
//         await dispatch(logout());
//       } else {
//         await dispatch(fetchMe());
//       }
//     })();
//   }
//   return startup;
// }

// export default function App() {
//   const dispatch = useDispatch();

//   useEffect(() => {
//     startApp(dispatch);
//   }, [dispatch]);

//   return (
//     <div className="d-flex flex-column min-vh-100">
//       <Navbar />
//       <main className="flex-grow-1">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Login />} />
//                     <Route path="/auth/google/success" element={<GoogleSuccess />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password/:token" element={<ResetPassword />} />
//           <Route path="/suites" element={<Suites />} />

//           <Route element={<ProtectedRoute roles={["PET_OWNER"]} />}>
//             <Route path="/pets" element={<Pets />} />
//             <Route path="/pets/:petId/care" element={<PetCareLogs />} />
//             <Route path="/pets/:petId/health" element={<PetHealthLogs />} />
//             <Route path="/bookings" element={<Bookings />} />
//           </Route>

//           <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
//             <Route path="/admin/dashboard" element={<AdminDashboard />} />
//             <Route path="/admin/suites" element={<AdminSuites />} />
//             <Route path="/admin/users" element={<AdminUsers />} />
//           </Route>

//           <Route element={<ProtectedRoute roles={["STAFF", "ADMIN"]} />}>
//             <Route path="/admin/bookings" element={<AdminBookings />} />
//             <Route path="/staff/care-logs" element={<StaffCareLogs />} />
//           </Route>

//           <Route element={<ProtectedRoute roles={["VETERINARIAN", "ADMIN"]} />}>
//             <Route path="/vet/health-logs" element={<VetHealthLogs />} />
//           </Route>

//           <Route path="*" element={<p className="text-center py-5">Page not found.</p>} />
//         </Routes>
//       </main>
//       <Footer />
//     </div>
//   );
// }

import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchMe, logout } from "./features/authSlice";
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

// A browser tab remembers this flag until the tab is closed.
// First open of the site in a tab: clear any old login, so the visitor starts on the home page.
// Refreshing the page in the same tab: keep the person logged in.
const SESSION_KEY = "pawhaven_tab_started";
let startup = null; // shared, so React's double run in development only does this once

function startApp(dispatch) {
  if (!startup) {
    startup = (async () => {
      // Coming back from Google: never clear the login that was just created
      if (window.location.pathname === "/auth/google/success") {
        sessionStorage.setItem(SESSION_KEY, "1");
        await dispatch(fetchMe());
      } else if (!sessionStorage.getItem(SESSION_KEY)) {
        sessionStorage.setItem(SESSION_KEY, "1");
        await dispatch(logout());
      } else {
        await dispatch(fetchMe());
      }
    })();
  }
  return startup;
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    startApp(dispatch);
  }, [dispatch]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />
          <Route path="/suites" element={<Suites />} />

          {/* Any logged-in user: owner, staff, vet or admin */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<ProtectedRoute roles={["PET_OWNER"]} />}>
            <Route path="/pets" element={<Pets />} />
            <Route path="/pets/:petId/care" element={<PetCareLogs />} />
            <Route path="/pets/:petId/health" element={<PetHealthLogs />} />
            <Route path="/bookings" element={<Bookings />} />
          </Route>

          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/suites" element={<AdminSuites />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          <Route element={<ProtectedRoute roles={["STAFF", "ADMIN"]} />}>
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/staff/care-logs" element={<StaffCareLogs />} />
          </Route>

          <Route element={<ProtectedRoute roles={["VETERINARIAN", "ADMIN"]} />}>
            <Route path="/vet/health-logs" element={<VetHealthLogs />} />
          </Route>

          <Route path="*" element={<p className="text-center py-5">Page not found.</p>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

