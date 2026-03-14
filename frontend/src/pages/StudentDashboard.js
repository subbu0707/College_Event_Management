import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import eventService from "../services/eventService";
import registrationService from "../services/registrationService";
import notificationService from "../services/notificationService";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    myRegistrations: 0,
    completedEvents: 0,
    unreadNotifications: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch student statistics from backend
      const statsResponse = await registrationService.getStudentStats();

      // Fetch my registrations for detailed display
      const registrationsResponse =
        await registrationService.getMyRegistrations();

      // Fetch notifications
      const notificationsResponse = await notificationService.getNotifications({
        unreadOnly: true,
      });

      const registrations = registrationsResponse.registrations || [];

      // Sort by registration date (most recent first)
      const sortedRegistrations = registrations.sort(
        (a, b) => new Date(b.registrationDate) - new Date(a.registrationDate),
      );
      setMyRegistrations(sortedRegistrations);

      // Filter registrations by event status for upcoming events display
      const now = new Date();
      const upcomingRegistrations = registrations.filter((reg) => {
        if (!reg.event) return false;
        const eventEndDate = new Date(reg.event.endDate);
        return reg.status === "registered" && eventEndDate >= now;
      });

      // Get only registered events for upcoming section, sorted by start date
      const upcomingEventsData = upcomingRegistrations
        .map((reg) => reg.event)
        .filter((event) => event !== null)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      setUpcomingEvents(upcomingEventsData);

      // Use stats from backend for accuracy
      setStats({
        upcomingEvents: statsResponse.stats.upcomingEvents || 0,
        myRegistrations: statsResponse.stats.activeRegistrations || 0,
        completedEvents: statsResponse.stats.completedEvents || 0,
        unreadNotifications: notificationsResponse.unreadCount || 0,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p className="dashboard-subtitle">
          Here's what's happening with your events
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.upcomingEvents}</h3>
            <p>Upcoming Events</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.myRegistrations}</h3>
            <p>Active Registrations</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{stats.completedEvents}</h3>
            <p>Completed Events</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3>{stats.unreadNotifications}</h3>
            <p>Unread Notifications</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>🎪 My Upcoming Events</h2>
            <Link to="/my-registrations" className="btn-link">
              View All →
            </Link>
          </div>
          <div className="events-list">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.slice(0, 3).map((event) => (
                <Link
                  to={`/event/${event._id}`}
                  key={event._id}
                  className="event-card-mini"
                >
                  <div className="event-card-mini-content">
                    <h3>{event.title}</h3>
                    <p className="event-meta">
                      <span className="category-badge">{event.category}</span>
                      <span>
                        {new Date(event.startDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="event-venue">📍 {event.venue}</p>
                  </div>
                  <div className="event-card-mini-action">
                    <span className="capacity-indicator">✅ Registered</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="empty-state">
                No upcoming events. <Link to="/events">Browse events</Link> to
                register!
              </p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>📝 My Recent Registrations</h2>
            <Link to="/my-registrations" className="btn-link">
              View All →
            </Link>
          </div>
          <div className="registrations-list">
            {myRegistrations.length > 0 ? (
              myRegistrations.slice(0, 3).map((registration) => (
                <div key={registration._id} className="registration-card-mini">
                  <div className="registration-status">
                    {registration.status === "registered" && "✅"}
                    {registration.status === "attended" && "🎯"}
                    {registration.status === "cancelled" && "❌"}
                  </div>
                  <div className="registration-content">
                    <h4>{registration.event?.title}</h4>
                    <p className="registration-date">
                      Registered:{" "}
                      {new Date(
                        registration.registrationDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">
                You haven't registered for any events yet
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/events" className="btn btn-primary">
            🔍 Browse Events
          </Link>
          <Link to="/my-registrations" className="btn btn-secondary">
            📋 View Registrations
          </Link>
          <Link to="/notifications" className="btn btn-outline">
            🔔 Check Notifications
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
