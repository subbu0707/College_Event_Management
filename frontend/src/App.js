import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import MyRegistrations from "./pages/MyRegistrations";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import StudentDashboard from "./pages/StudentDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import "./styles/index.css";

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user?.role)) {
    // Redirect to role-specific dashboard
    const dashboardRoute =
      user.role === "admin"
        ? "/admin-dashboard"
        : user.role === "organizer"
          ? "/organizer-dashboard"
          : "/student-dashboard";
    return <Navigate to={dashboardRoute} />;
  }

  return children;
};

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  const DashboardRedirect = () => {
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

    switch (user.role) {
      case "admin":
        return <Navigate to="/admin-dashboard" replace />;
      case "organizer":
        return <Navigate to="/organizer-dashboard" replace />;
      case "student":
      default:
        return <Navigate to="/student-dashboard" replace />;
    }
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<DashboardRedirect />} />

        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/organizer-dashboard"
          element={
            <PrivateRoute roles={["organizer"]}>
              <OrganizerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/student-dashboard"
          element={
            <PrivateRoute roles={["student"]}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/events"
          element={
            <PrivateRoute>
              <Events />
            </PrivateRoute>
          }
        />
        <Route
          path="/event/:id"
          element={
            <PrivateRoute>
              <EventDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-registrations"
          element={
            <PrivateRoute roles={["student"]}>
              <MyRegistrations />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
