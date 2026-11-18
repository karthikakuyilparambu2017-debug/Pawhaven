import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/authSlice";
import Avatar from "./Avatar";

const ROLE_TEXT = {
  PET_OWNER: "Pet owner",
  STAFF: "Staff",
  VETERINARIAN: "Vet",
  ADMIN: "Admin",
};

function Item({ to, children, end }) {
  return (
    <li className="nav-item">
      <NavLink className="nav-link" to={to} end={end}>{children}</NavLink>
    </li>
  );
}

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  const role = user?.role;

  return (
    <nav className="navbar navbar-expand-lg paw-navbar sticky-top">
      <div className="container">
        <Link className="brand" to="/">
          <span className="brand-mark"><i className="bi bi-house-heart-fill" /></span>
          <span className="brand-name">PawHaven</span>
        </Link>

        <button
          className="navbar-toggler border-0" type="button"
          data-bs-toggle="collapse" data-bs-target="#pawNav"
          aria-controls="pawNav" aria-expanded="false" aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="pawNav">
          <ul className="navbar-nav mx-auto">
            <Item to="/" end>Home</Item>
            <Item to="/suites">Suites</Item>

            {role === "PET_OWNER" && (
              <>
                <Item to="/pets">My pets</Item>
                <Item to="/bookings">Bookings</Item>
              </>
            )}

            {role === "ADMIN" && (
              <>
                <Item to="/admin/dashboard">Dashboard</Item>
                <Item to="/admin/suites">Suites admin</Item>
                <Item to="/admin/users">Users</Item>
              </>
            )}

            {["STAFF", "ADMIN"].includes(role) && (
              <>
                <Item to="/admin/bookings">Bookings admin</Item>
                <Item to="/staff/care-logs">Care logs</Item>
              </>
            )}

            {["VETERINARIAN", "ADMIN"].includes(role) && (
              <Item to="/vet/health-logs">Health logs</Item>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {user ? (
              <div className="dropdown profile-dropdown">
                <button
                  className="btn border-0 bg-transparent p-0 d-flex align-items-center gap-2"
                  type="button" data-bs-toggle="dropdown" aria-expanded="false"
                  aria-label="Open profile menu"
                >
                  <Avatar user={user} />
                  <span className="lh-sm text-start d-none d-xl-block">
                    <span className="d-block fw-semibold small">{user.name}</span>
                    <span className="d-block text-body-secondary" style={{ fontSize: "0.75rem" }}>
                      {ROLE_TEXT[role] || role}
                    </span>
                  </span>
                  <i className="bi bi-chevron-down small text-body-secondary" />
                </button>

                <ul className="dropdown-menu dropdown-menu-end">
                  <li className="px-3 py-2">
                    <div className="fw-semibold small">{user.name}</div>
                    <div className="text-body-secondary" style={{ fontSize: "0.75rem" }}>{user.email}</div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2" />My profile
                    </Link>
                  </li>
                  <li>
                    <button className="dropdown-item" type="button" onClick={onLogout}>
                      <i className="bi bi-box-arrow-right me-2" />Log out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary">Log in</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}