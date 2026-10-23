import React from "react";

export default function Sidebar({ user, onLogout }) {
  const links = ["Notes", "Quiz", "Messages"];

  return (
    <aside className="sidebar-panel">
      <div className="sidebar-brand">
        <div className="brand-badge">L</div>
        <div>
          <p className="brand-label">Learnify</p>
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

      <button type="button" className="logout-button" onClick={onLogout}>
        Logout
      </button>
    </aside>
  );
}
