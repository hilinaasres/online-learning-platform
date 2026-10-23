import React, { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Register({ setUser, setShowRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") setShowRegister(false);
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [setShowRegister]);

  const registerUser = async (event) => {
    event?.preventDefault();
    if (!name || !email || !password) {
      setMsg("Please complete all fields");
      return;
    }

    setLoading(true);
    try {
      const data = await api("/register", {
        method: "POST",
        body: { name, email, password, role: "student" },
      });
      setMsg(data.message);

      if (data.user) {
        setUser(data.user);
      } else if (data.message === "User registered") {
        setUser({ name, email, role: "student", _id: data.userId });
      }
    } catch (err) {
      setMsg(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setShowRegister(false)}>
      <section
        className="modal-card"
        aria-label="Register as student"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={() => setShowRegister(false)}
          aria-label="Close registration popup"
        >
          x
        </button>

        <p className="student-pill">Student registration</p>
        <h2>Create your student profile</h2>
        <p className="modal-subtitle">Join a course space in under a minute.</p>

        <form className="auth-fields" onSubmit={registerUser}>
          <input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Student Account"}
          </button>
        </form>

        <p className={`auth-message ${msg === "User registered" ? "ok" : "error"}`}>{msg}</p>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <button type="button" className="text-link" onClick={() => setShowRegister(false)}>
            Back to login
          </button>
        </p>
      </section>
    </div>
  );
}
