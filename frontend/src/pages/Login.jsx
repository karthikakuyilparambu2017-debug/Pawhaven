
import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearError, login } from "../features/authSlice";
import Field from "../components/Field";
import GoogleButton from "../components/GoogleButton";

const HOME = {
  ADMIN: "/admin/dashboard",
  STAFF: "/staff/care-logs",
  VETERINARIAN: "/vet/health-logs",
  PET_OWNER: "/owner/dashboard",
};

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { status, error } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const from = location.state?.from?.pathname;

  const onChange = (e) => {
    dispatch(clearError());

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const res = await dispatch(login(form));

    if (login.fulfilled.match(res)) {
      const role = res.payload?.role;

      navigate(from || HOME[role] || "/bookings", {
        replace: true,
    });
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 440 }}>
      <form
        className="card border-0 shadow-sm p-4"
        onSubmit={onSubmit}
        autoComplete="off"
      >
        <h1 className="h3 mb-3">Log in</h1>

        {error && (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        )}

        {params.get("error") === "google" && (
          <div className="alert alert-danger py-2" role="alert">
            Google sign-in did not work. Please try again.
          </div>
        )}

        {params.get("error") === "exists" && (
          <div className="alert alert-info py-2" role="alert">
            This Google account is already registered. Please log in below,
            or use Continue with Google.
          </div>
        )}

        <Field
          label="Email"
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={onChange}
          required
        />

        <Field
          label="Password"
          id="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={onChange}
          required
        />

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Logging in..." : "Log in"}
        </button>

        <div className="d-flex align-items-center gap-2 my-3">
          <hr className="flex-grow-1 m-0" />
          <span className="small text-body-secondary">or</span>
          <hr className="flex-grow-1 m-0" />
        </div>

        <GoogleButton label="Continue with Google" mode="login" />

        <p className="mt-3 mb-1">
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>

        <p className="text-body-secondary mb-0">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
