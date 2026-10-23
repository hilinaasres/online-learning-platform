import React, { useState } from "react";
import { api } from "../api/client";

export default function Login({ setUser, setShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
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
      setMsg(data.message);
      if (data.user) setUser(data.user);
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
          New student?{" "}
          <button type="button" className="text-link" onClick={() => setShowRegister(true)}>
            Create an account
          </button>
        </p>
      </section>
    </main>
  );
}
