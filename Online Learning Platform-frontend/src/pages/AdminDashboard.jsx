import React, { useEffect, useState } from "react";
import SidebarLayout from "../components/SidebarLayout";
import { api, asArray } from "../api/client";

export default function AdminDashboard({ user, onLogout }) {
  const [stats, setStats] = useState({ users: 0, notes: 0, quizzes: 0, grades: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      try {
        const [users, notes, quizzes, grades] = await Promise.all([
          api("/users"),
          api("/notes"),
          api("/quiz"),
          api("/grades"),
        ]);
        if (active) {
          setStats({
            users: asArray(users).length,
            notes: asArray(notes).length,
            quizzes: asArray(quizzes).length,
            grades: asArray(grades).length,
          });
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message || "Could not load administration data.");
      }
    };

    void loadStats();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SidebarLayout user={user} onLogout={onLogout}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Administrator dashboard</p>
          <h1>Welcome, {user.name}</h1>
        </div>
        <span className="status-pill">Administration</span>
      </div>
      {error && <p className="auth-message error" role="alert">{error}</p>}
      <section className="stats-grid" aria-label="Platform overview">
        {[
          ["Users", stats.users],
          ["Learning resources", stats.notes],
          ["Quizzes", stats.quizzes],
          ["Grades", stats.grades],
        ].map(([label, value]) => (
          <article key={label} className="stat-card primary">
            <span className="stat-label">{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
      <section className="dashboard-card content-section">
        <h2>Platform administration</h2>
        <p>Review account and learning activity totals. User and course management will be added in later phases.</p>
      </section>
    </SidebarLayout>
  );
}
