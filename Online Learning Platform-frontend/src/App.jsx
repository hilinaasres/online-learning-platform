import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import InstructorDashboard from "./pages/InstructorDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import StudentDashboard from "./pages/StudentDashboard";
import { api } from "./api/client";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

const DASHBOARD_PATHS = {
  admin: "/admin",
  instructor: "/instructor",
  student: "/student",
};

function HomeRedirect({ user }) {
  return <Navigate to={user ? (DASHBOARD_PATHS[user.role] || "/login") : "/login"} replace />;
}

function ProtectedRoute({ user, requiredRole, children }) {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user.role !== requiredRole) {
    return <Navigate to={DASHBOARD_PATHS[user.role] || "/login"} replace />;
  }
  return children;
}

function AuthenticatedApp() {
  const { user, token, setUser, logout } = useAuth();
  const [verifiedToken, setVerifiedToken] = useState("");
  const [sessionError, setSessionError] = useState("");
  const sessionChecked = !token || verifiedToken === token;

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    api("/auth/me")
      .then((data) => {
        if (active && data.user) setUser(data.user, token);
      })
      .catch((error) => {
        if (active && error.status !== 401) {
          setSessionError("Could not verify your session. Check your connection and try again.");
          setVerifiedToken(token);
        }
      })
      .then(() => {
        if (active) setVerifiedToken(token);
      });

    return () => {
      active = false;
    };
  }, [token, setUser]);

  if (user && !sessionChecked) {
    return <main className="auth-shell"><p role="status">Verifying your session...</p></main>;
  }

  return (
    <>
      {sessionError && (
        <p className="auth-message error" role="alert">
          {sessionError}
        </p>
      )}
      <Routes>
        <Route path="/" element={<HomeRedirect user={user} />} />
        <Route path="/login" element={user ? <HomeRedirect user={user} /> : <Login setUser={setUser} />} />
        <Route path="/register" element={user ? <HomeRedirect user={user} /> : <Register setUser={setUser} />} />
        <Route path="/forgot-password" element={user ? <HomeRedirect user={user} /> : <ForgotPassword />} />
        <Route path="/reset-password" element={user ? <HomeRedirect user={user} /> : <ResetPassword />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute user={user} requiredRole="instructor">
              <InstructorDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute user={user} requiredRole="student">
              <StudentDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<HomeRedirect user={user} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthenticatedApp />
    </BrowserRouter>
  );
}
