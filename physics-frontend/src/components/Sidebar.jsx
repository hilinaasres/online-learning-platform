// src/components/Sidebar.jsx
import React from "react";

export default function Sidebar({ user }) {
  const links = ["Notes", "Quiz", "Messages"];

  return (
    <aside className="sidebar-panel">
      <div className="sidebar-brand">
        <div className="brand-badge">P</div>
        <div>
          <p className="brand-label">Physics</p>
          <h2>{user.name}</h2>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {links.map((link) => (
          <button key={link} type="button" className="nav-item">
            {link}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="logout-button"
        onClick={() => window.location.reload()}
      >
        Logout
      </button>
    </aside>
  );
}
