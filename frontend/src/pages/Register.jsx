import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearError, register } from "../features/authSlice";
import Field from "../components/Field";
import GoogleButton from "../components/GoogleButton";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [unlocked, setUnlocked] = useState(false);

  const { status, error } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const unlock = () => setUnlocked(true);

  const onChange = (e) => {
    dispatch(clearError());
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(register(form));
    if (register.fulfilled.match(res)) navigate("/pets");
  };

  return (
    <div className="container py-5" style={{ maxWidth: 440 }}>
      <form className="card border-0 shadow-sm p-4" onSubmit={onSubmit} autoComplete="off">
        <h1 className="h3 mb-1">Create your account</h1>
        <p className="text-body-secondary mb-3">Add your pet and book a stay in minutes.</p>

        {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
        {params.get("error") === "google" && (
          <div className="alert alert-danger py-2" role="alert">
            Google sign-up did not work. Please try again.
          </div>
        )}

        {/* ---------- Sign up with Google ---------- */}
        <GoogleButton label="Sign up with Google"  mode="register"/>

        <div className="d-flex align-items-center gap-2 my-3">
          <hr className="flex-grow-1 m-0" />
          <span className="small text-body-secondary">or sign up with email</span>
          <hr className="flex-grow-1 m-0" />
        </div>

        <Field
          label="Full name" id="name" autoComplete="off" minLength={2}
          readOnly={!unlocked} onFocus={unlock}
          value={form.name} onChange={onChange} required
        />
        <Field
          label="Email" id="email" type="email" autoComplete="off"
          readOnly={!unlocked} onFocus={unlock}
          value={form.email} onChange={onChange} required
        />
        <Field
          label="Password" id="password" type="password" autoComplete="new-password" minLength={6}
          readOnly={!unlocked} onFocus={unlock}
          value={form.password} onChange={onChange} required
        />

        <button className="btn btn-primary w-100" disabled={status === "loading"}>
          {status === "loading" ? "Creating..." : "Create account"}
        </button>

        <p className="text-body-secondary mt-3 mb-0">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}