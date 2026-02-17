import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import eventService from "../services/eventService";

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myEvents: 0,
    pendingApproval: 0,
    totalRegistrations: 0,
    activeEvents: 0,
  });
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch organizer's events
      const eventsResponse = await eventService.getMyEvents();
      const events = eventsResponse.data || [];

      setMyEvents(events);

      // Calculate stats
      const pendingCount = events.filter(
        (e) => e.approvalStatus === "pending",
      ).length;
      const activeCount = events.filter(
        (e) => e.status === "upcoming" || e.status === "ongoing",
      ).length;
      const totalRegs = events.reduce(
        (sum, e) => sum + (e.registeredCount || 0),
        0,
      );

      setStats({
        myEvents: events.length,
        pendingApproval: pendingCount,
        totalRegistrations: totalRegs,
        activeEvents: activeCount,
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
        <h1>Event Organizer Dashboard 🎯</h1>
        <p className="dashboard-subtitle">
          Manage your events and track registrations
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">🎪</div>
          <div className="stat-content">
            <h3>{stats.myEvents}</h3>
            <p>Total Events</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingApproval}</h3>
            <p>Pending Approval</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.totalRegistrations}</h3>
            <p>Total Registrations</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{stats.activeEvents}</h3>
            <p>Active Events</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>📋 My Events</h2>
          <button className="btn btn-primary">+ Create New Event</button>
        </div>

        <div className="events-table">
          {myEvents.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Registrations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map((event) => (
                  <tr key={event._id}>
                    <td>
                      <Link to={`/event/${event._id}`} className="event-link">
                        {event.title}
                      </Link>
                    </td>
                    <td>{new Date(event.startDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${event.status}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`approval-badge approval-${event.approvalStatus}`}
                      >
                        {event.approvalStatus}
                      </span>
                    </td>
                    <td>
                      <span className="capacity-badge">
                        {event.registeredCount}/{event.capacity}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" title="Edit">
                        ✏️
                      </button>
                      <button className="btn-icon" title="View Details">
                        👁️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>You haven't created any events yet</p>
              <button className="btn btn-primary">
                Create Your First Event
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="btn btn-primary">➕ Create Event</button>
          <Link to="/events" className="btn btn-secondary">
            📋 View All Events
          </Link>
          <Link to="/notifications" className="btn btn-outline">
            🔔 Notifications
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
