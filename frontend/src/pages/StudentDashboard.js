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

      // Fetch upcoming events
      const eventsResponse = await eventService.getEvents({
        status: "upcoming",
        limit: 5,
      });

      // Fetch my registrations
      const registrationsResponse =
        await registrationService.getMyRegistrations();

      // Fetch notifications
      const notificationsResponse = await notificationService.getNotifications({
        unreadOnly: true,
      });

      setUpcomingEvents(eventsResponse.data || []);
      setMyRegistrations(registrationsResponse.data || []);

      // Calculate stats
      const completedCount =
        registrationsResponse.data?.filter((reg) => reg.status === "attended")
          .length || 0;

      setStats({
        upcomingEvents: eventsResponse.data?.length || 0,
        myRegistrations:
          registrationsResponse.data?.filter(
            (reg) => reg.status === "registered",
          ).length || 0,
        completedEvents: completedCount,
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
            <p>My Registrations</p>
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
            <h2>🎪 Upcoming Events</h2>
            <Link to="/events" className="btn-link">
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
                    <span className="capacity-indicator">
                      {event.registeredCount}/{event.capacity}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="empty-state">No upcoming events available</p>
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
