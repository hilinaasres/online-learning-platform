// src/pages/Login.jsx
import React, { useState } from "react";

export default function Login({ setUser, setShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const loginUser = async () => {
    if (!email || !password) {
      setMsg("Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setMsg(data.message);
      if (data.user) setUser(data.user);
    } catch (err) {
      setMsg("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-label="Login form">
        <p className="auth-kicker">Physics Website</p>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to access notes, quizzes, and class updates.</p>

        <div className="auth-fields">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={loginUser} disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>

        <p className={`auth-message ${msg === "Login successful" ? "ok" : "error"}`}>{msg}</p>

        <p className="auth-footer-text">
          New student?{" "}
          <button type="button" className="text-link" onClick={() => setShowRegister(true)}>
            Register with popup form
          </button>
        </p>
      </section>
    </main>
  );
}
