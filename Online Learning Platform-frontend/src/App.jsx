import React, { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import { useAuth } from "./hooks/useAuth";
import { isStaffRole } from "./api/client";
import "./App.css";

export default function App() {
  const { user, setUser, logout } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (user) {
    return isStaffRole(user.role) ? (
      <InstructorDashboard user={user} onLogout={logout} />
    ) : (
      <StudentDashboard user={user} onLogout={logout} />
    );
  }

  return (
    <>
      <Login setUser={setUser} setShowRegister={setShowRegister} />
      {showRegister && (
        <Register setUser={setUser} setShowRegister={setShowRegister} />
      )}
    </>
  );
}
