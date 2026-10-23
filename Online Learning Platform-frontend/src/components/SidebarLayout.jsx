import React from "react";
import Sidebar from "./Sidebar";

export default function SidebarLayout({ children, user, onLogout }) {
  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="content-panel">{children}</main>
    </div>
  );
}
