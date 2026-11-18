import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import Field from "../components/Field";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      navigate("/login");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 440 }}>
      <form className="card border-0 shadow-sm p-4" onSubmit={onSubmit}>
        <h1 className="h3 mb-3">Choose a new password</h1>
        {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
        <Field label="New password" id="password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn btn-primary w-100" disabled={loading}>{loading ? "Saving..." : "Save password"}</button>
        <p className="mt-3 mb-0"><Link to="/login">Back to log in</Link></p>
      </form>
    </div>
  );
}