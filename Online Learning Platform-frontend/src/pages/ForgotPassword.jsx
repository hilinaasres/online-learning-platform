import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const result = await api("/password/forgot", {
        method: "POST",
        body: { email },
      });
      setMessage(result.message);
    } catch (err) {
      setError(err.message || "Could not request a password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-label="Forgot password form">
        <p className="auth-kicker">Account recovery</p>
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">Enter your account email to request a reset link.</p>
        <form className="auth-fields" onSubmit={requestReset}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Requesting..." : "Send reset link"}
          </button>
        </form>
        {message && <p className="auth-message ok" role="status">{message}</p>}
        {error && <p className="auth-message error" role="alert">{error}</p>}
        <p className="auth-footer-text"><Link className="text-link" to="/login">Back to login</Link></p>
      </section>
    </main>
  );
}
