import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import notificationService from "../services/notificationService";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchUnreadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications({
        unreadOnly: true,
        limit: 1,
      });
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        📚 Event Management
      </Link>

      <ul className="navbar-nav">
        {isAuthenticated ? (
          <>
            <li>
              <Link to="/events">Events</Link>
            </li>
            {user?.role === "student" && (
              <li>
                <Link to="/my-registrations">My Registrations</Link>
              </li>
            )}
            <li>
              <Link to="/notifications">
                Notifications
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <button onClick={toggleTheme} className="theme-toggle">
                {isDark ? "☀️ Light" : "🌙 Dark"}
              </button>
            </li>
            <li>
              <a onClick={handleLogout} style={{ cursor: "pointer" }}>
                Logout
              </a>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <button onClick={toggleTheme} className="theme-toggle">
                {isDark ? "☀️ Light" : "🌙 Dark"}
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
