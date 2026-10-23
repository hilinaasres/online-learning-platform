import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { isStaffRole } from "../api/client";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [msg, setMsg] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);

  const loginUser = async (event) => {
    event?.preventDefault();
    if (!email || !password) {
      setMsg("Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      const data = await api("/login", {
        method: "POST",
        body: { email, password },
      });
      if (data.user && data.token) {
        setUser(data.user, data.token);
        const destination = data.user.role === "admin"
          ? "/admin"
          : isStaffRole(data.user.role)
            ? "/instructor"
            : "/student";
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setMsg(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-label="Login form">
        <p className="auth-kicker">Learnify</p>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to access courses, quizzes, and class updates.</p>

        <form className="auth-fields" onSubmit={loginUser}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className={`auth-message ${msg === "Login successful" ? "ok" : "error"}`}>{msg}</p>

        <p className="auth-footer-text">
          <Link className="text-link" to="/forgot-password">Forgot your password?</Link>
        </p>

        <p className="auth-footer-text">
          New student? <Link className="text-link" to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
