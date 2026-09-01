// src/components/SidebarLayout.jsx
import React from "react";
import Sidebar from "./Sidebar";

export default function SidebarLayout({ children, user }) {
  return (
    <div className="app-shell">
      <Sidebar user={user} />
      <main className="content-panel">{children}</main>
    </div>
  );
}
