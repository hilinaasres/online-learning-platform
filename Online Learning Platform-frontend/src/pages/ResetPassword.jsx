import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = searchParams.get("token") || "";

  const resetPassword = async (event) => {
    event.preventDefault();
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api("/password/reset", {
        method: "POST",
        body: { token, password },
      });
      navigate("/login", { replace: true, state: { message: "Password reset. Please log in." } });
    } catch (err) {
      setError(err.message || "Could not reset the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-label="Set a new password">
        <p className="auth-kicker">Account recovery</p>
        <h1 className="auth-title">Choose a new password</h1>
        {!token ? (
          <>
            <p className="auth-message error" role="alert">This password reset link is invalid or incomplete.</p>
            <p className="auth-footer-text"><Link className="text-link" to="/forgot-password">Request a new link</Link></p>
          </>
        ) : (
          <form className="auth-fields" onSubmit={resetPassword}>
            <input
              type="password"
              placeholder="New password (at least 8 characters)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Reset password"}
            </button>
            {error && <p className="auth-message error" role="alert">{error}</p>}
          </form>
        )}
        <p className="auth-footer-text"><Link className="text-link" to="/login">Back to login</Link></p>
      </section>
    </main>
  );
}
