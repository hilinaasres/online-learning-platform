// src/App.jsx
import React, { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null); // logged-in user
  const [showRegister, setShowRegister] = useState(false);

  // If logged in, show dashboard based on role
  if (user) {
    return user.role === "Teacher" ? (
      <TeacherDashboard user={user} />
    ) : (
      <StudentDashboard user={user} />
    );
  }

  // If not logged in, show login and open register as a modal popup
  return (
    <>
      <Login setUser={setUser} setShowRegister={setShowRegister} />
      {showRegister && (
        <Register setUser={setUser} setShowRegister={setShowRegister} />
      )}
    </>
  );
}
