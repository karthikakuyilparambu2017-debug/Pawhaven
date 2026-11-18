import { useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import Field from "../components/Field";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 440 }}>
      <form className="card border-0 shadow-sm p-4" onSubmit={onSubmit}>
        <h1 className="h3 mb-3">Reset your password</h1>
        {sent ? (
          <div className="alert alert-success mb-0" role="status">
            If an account exists for {email}, a reset link is on its way. Check your inbox.
          </div>
        ) : (
          <>
            {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
            <Field label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button className="btn btn-primary w-100" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
          </>
        )}
        <p className="mt-3 mb-0"><Link to="/login">Back to log in</Link></p>
      </form>
    </div>
  );
}