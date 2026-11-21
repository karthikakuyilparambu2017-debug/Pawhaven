
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearError, register } from "../features/authSlice";
import Field from "../components/Field";
import GoogleButton from "../components/GoogleButton";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { status, error } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const onChange = (e) => {
    dispatch(clearError());

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    dispatch(clearError());

    const res = await dispatch(register(form));

    if (register.fulfilled.match(res)) {
      navigate("/pets", { replace: true });
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 440 }}>
      <form
        className="card border-0 shadow-sm p-4"
        onSubmit={onSubmit}
        autoComplete="off"
      >
        <h1 className="h3 mb-1">Create your account</h1>

        <p className="text-body-secondary mb-3">
          Add your pet and book a stay in minutes.
        </p>

        {/* Registration error */}
        {error && (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        )}

        {/* Google registration error */}
        {params.get("error") === "google" && (
          <div className="alert alert-danger py-2" role="alert">
            Google sign-up did not work. Please try again.
          </div>
        )}

        {/* Google sign-up */}
        <GoogleButton
          label="Sign up with Google"
          mode="register"
        />

        {/* Divider */}
        <div className="d-flex align-items-center gap-2 my-3">
          <hr className="flex-grow-1 m-0" />

          <span className="small text-body-secondary">
            or sign up with email
          </span>

          <hr className="flex-grow-1 m-0" />
        </div>

        {/* Full name */}
        <Field
          label="Full name"
          id="name"
          autoComplete="name"
          minLength={2}
          value={form.name}
          onChange={onChange}
          required
        />

        {/* Email */}
        <Field
          label="Email"
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={onChange}
          required
        />

        {/* Password */}
        <Field
          label="Password"
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          value={form.password}
          onChange={onChange}
          required
        />

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={status === "loading"}
        >
          {status === "loading"
            ? "Creating..."
            : "Create account"}
        </button>

        {/* Login link */}
        <p className="text-body-secondary mt-3 mb-0">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
