import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redirect authenticated users to their role-specific dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardRoute =
        user.role === "admin"
          ? "/admin-dashboard"
          : user.role === "organizer"
            ? "/organizer-dashboard"
            : "/student-dashboard";
      navigate(dashboardRoute, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/events");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="container">
      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "#333" }}>
          🎉 College Event Management System
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            color: "#666",
            marginBottom: "2rem",
            maxWidth: "600px",
            margin: "0 auto 2rem",
          }}
        >
          Discover, register, and participate in exciting college events. Stay
          updated with notifications and manage your registrations all in one
          place.
        </p>

        <button
          className="btn btn-primary"
          style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}
          onClick={handleGetStarted}
        >
          {isAuthenticated ? "View Events" : "Get Started"}
        </button>

        <div className="grid" style={{ marginTop: "3rem" }}>
          <div className="card">
            <h3>📅 Event Discovery</h3>
            <p>
              Browse upcoming and ongoing events organized across different
              categories.
            </p>
          </div>

          <div className="card">
            <h3>✅ Easy Registration</h3>
            <p>
              Register for events with just one click and manage your
              registrations easily.
            </p>
          </div>

          <div className="card">
            <h3>🔔 Smart Notifications</h3>
            <p>
              Get real-time notifications about event updates and reminders.
            </p>
          </div>

          <div className="card">
            <h3>📊 Participation History</h3>
            <p>
              Track your event history and provide feedback for events you
              attended.
            </p>
          </div>

          <div className="card">
            <h3>🔐 Secure & Private</h3>
            <p>
              Your data is secure with encrypted authentication and privacy
              controls.
            </p>
          </div>

          <div className="card">
            <h3>🎯 Smart Filtering</h3>
            <p>
              Filter events by category, date, and search for specific events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
