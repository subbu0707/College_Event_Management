import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import eventService from "../services/eventService";
import adminService from "../services/adminService";

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [reports, setReports] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [announcementData, setAnnouncementData] = useState({
    title: "",
    message: "",
    targetRole: "all",
  });

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh dashboard stats every 30 seconds to capture new registrations
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsRes = await adminService.getStats();
      setStats(statsRes.data.data || statsRes.data);

      // Fetch all events for pending approvals
      const eventsRes = await eventService.getAllEventsAdmin();
      const events = eventsRes.data || [];
      const pending = events.filter((e) => e.approvalStatus === "pending");
      setPendingEvents(pending);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const fetchUsers = React.useCallback(async () => {
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await adminService.getAllUsers(params);
      setUsers(res.data.data || res.data.users || res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [roleFilter, searchTerm]);

  const fetchReports = async () => {
    try {
      const res = await adminService.getReports();
      setReports(res.data.data || res.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await adminService.getAuditLogs();
      setAuditLogs(res.data.data || res.data.logs || res.data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  const handleApproveEvent = async (eventId) => {
    try {
      await eventService.approveEvent(eventId);
      alert("Event approved successfully!");
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Error approving event");
    }
  };

  const handleRejectEvent = async (eventId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await eventService.rejectEvent(eventId, reason);
      alert("Event rejected successfully!");
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Error rejecting event");
    }
  };

  const handleSuspendEvent = async (eventId) => {
    const reason = prompt("Enter suspension reason:");
    if (!reason) return;

    try {
      await adminService.suspendEvent(eventId, reason);
      alert("Event suspended successfully!");
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Error suspending event");
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    if (
      !window.confirm(
        `Are you sure you want to change this user's role to ${newRole}?`,
      )
    )
      return;

    try {
      await adminService.updateUserRole(userId, newRole);
      alert("User role updated successfully!");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Error updating user role");
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?"))
      return;

    try {
      await adminService.deactivateUser(userId);
      alert("User deactivated successfully!");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Error deactivating user");
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();

    if (!announcementData.title || !announcementData.message) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await adminService.sendAnnouncement(announcementData);
      const data = response.data;
      alert(
        `Announcement sent successfully!\n\nRecipients: ${data.data?.totalRecipients || 0}\nTarget: ${data.data?.targetRole || "all"}`,
      );
      setAnnouncementData({ title: "", message: "", targetRole: "all" });
    } catch (error) {
      alert(error.response?.data?.message || "Error sending announcement");
    }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "reports") fetchReports();
    if (activeTab === "audit") fetchAuditLogs();
  }, [activeTab, fetchUsers, searchTerm, roleFilter]);

  const visibleUsers = users.filter(
    (item) => item.role !== "admin" || item._id === currentUser?._id,
  );

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
        <h1>Admin Control Panel 🔐</h1>
        <p className="dashboard-subtitle">
          System-wide oversight and management
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "approvals" ? "active" : ""}`}
          onClick={() => setActiveTab("approvals")}
        >
          ⏳ Approvals ({pendingEvents.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 User Management
        </button>
        <button
          className={`tab-btn ${activeTab === "announce" ? "active" : ""}`}
          onClick={() => setActiveTab("announce")}
        >
          📢 Announcements
        </button>
        <button
          className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          📈 Reports
        </button>
        <button
          className={`tab-btn ${activeTab === "audit" ? "active" : ""}`}
          onClick={() => setActiveTab("audit")}
        >
          🔍 Audit Logs
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <div className="stat-icon">🎪</div>
              <div className="stat-content">
                <h3>{stats.overview.totalEvents}</h3>
                <p>Total Events</p>
              </div>
            </div>

            <div className="stat-card stat-warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>{stats.overview.pendingApprovals}</h3>
                <p>Pending Approval</p>
              </div>
            </div>

            <div className="stat-card stat-info">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.overview.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card stat-success">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.overview.totalRegistrations}</h3>
                <p>Total Registrations</p>
              </div>
            </div>

            <div className="stat-card stat-success">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <h3>{stats.overview.activeEvents}</h3>
                <p>Active Events</p>
              </div>
            </div>

            <div className="stat-card stat-info">
              <div className="stat-icon">🏁</div>
              <div className="stat-content">
                <h3>{stats.overview.completedEvents}</h3>
                <p>Completed Events</p>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            <div className="dashboard-section">
              <div className="section-header">
                <h2>� Users by Role</h2>
              </div>

              {/* Role-based user count cards */}
              <div className="stats-grid">
                {stats.usersByRole.map((item) => {
                  const roleIcons = {
                    admin: "👑",
                    organizer: "🎯",
                    student: "🎓",
                  };
                  const roleColors = {
                    admin: "stat-error",
                    organizer: "stat-warning",
                    student: "stat-info",
                  };

                  return (
                    <div
                      key={item._id}
                      className={`stat-card ${roleColors[item._id] || "stat-primary"}`}
                    >
                      <div className="stat-icon">
                        {roleIcons[item._id] || "👤"}
                      </div>
                      <div className="stat-content">
                        <h3>{item.count}</h3>
                        <p>
                          {item._id.charAt(0).toUpperCase() + item._id.slice(1)}
                          s
                        </p>
                      </div>
                      <button
                        className="view-role-btn"
                        onClick={() => {
                          setRoleFilter(item._id);
                          setActiveTab("users");
                        }}
                      >
                        View All →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h2>📋 Events by Category</h2>
              </div>
              <div className="analytics-list">
                {stats.eventsByCategory.map((item) => (
                  <div key={item._id} className="analytics-item">
                    <span className="analytics-label">{item._id}</span>
                    <span className="analytics-value">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>🕐 Recent Activity</h2>
            </div>
            <div className="activity-grid">
              <div>
                <h3>Recent Users</h3>
                {stats.recentUsers.map((user) => (
                  <div key={user._id} className="activity-item">
                    <span>👤 {user.name}</span>
                    <span className="activity-role">{user.role}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3>Recent Events</h3>
                {stats.recentEvents.map((event) => (
                  <div key={event._id} className="activity-item">
                    <Link to={`/event/${event._id}`}>{event.title}</Link>
                    <span
                      className={`status-badge status-${event.approvalStatus}`}
                    >
                      {event.approvalStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Approvals Tab */}
      {activeTab === "approvals" && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>⏳ Pending Event Approvals</h2>
            <span className="badge-count">{pendingEvents.length}</span>
          </div>

          <div className="approval-list">
            {pendingEvents.length > 0 ? (
              pendingEvents.map((event) => (
                <div key={event._id} className="approval-card">
                  <div className="approval-card-header">
                    <h3>{event.title}</h3>
                    <span className="category-badge">{event.category}</span>
                  </div>
                  <div className="approval-card-body">
                    <p>
                      <strong>Organizer:</strong> {event.organizer?.name}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Venue:</strong> {event.venue}
                    </p>
                    <p>
                      <strong>Capacity:</strong> {event.capacity}
                    </p>
                    <p className="event-description">{event.description}</p>
                  </div>
                  <div className="approval-card-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => handleApproveEvent(event._id)}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRejectEvent(event._id)}
                    >
                      ❌ Reject
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleSuspendEvent(event._id)}
                    >
                      🚫 Suspend
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>✅ No pending events to review</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === "users" && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>👥 User Management</h2>
            {roleFilter && (
              <span className="filter-badge">
                Filtering:{" "}
                {roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}s
              </span>
            )}
          </div>

          <div className="filters-row">
            <input
              type="text"
              placeholder="Search by name, email, or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
            {(roleFilter || searchTerm) && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setRoleFilter("");
                  setSearchTerm("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {visibleUsers.length > 0 ? (
            <div className="events-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roll Number</th>
                    <th>Role</th>
                    <th>Branch</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.rollNumber}</td>
                      <td>
                        <span
                          className={`approval-badge approval-${user.role}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>{user.branch}</td>
                      <td>
                        {user.isActive !== false ? (
                          <span className="status-badge status-ongoing">
                            Active
                          </span>
                        ) : (
                          <span className="status-badge status-cancelled">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td>
                        <select
                          onChange={(e) =>
                            handleUpdateUserRole(user._id, e.target.value)
                          }
                          className="role-select"
                          defaultValue={user.role}
                        >
                          <option value="student">Student</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeactivateUser(user._id)}
                          style={{ marginLeft: "0.5rem" }}
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>
                {roleFilter || searchTerm
                  ? "No users found matching your criteria"
                  : "No users available"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === "announce" && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>📢 Send System Announcement</h2>
          </div>

          <form onSubmit={handleSendAnnouncement} className="announcement-form">
            <div className="form-group">
              <label>Target Audience</label>
              <select
                value={announcementData.targetRole}
                onChange={(e) =>
                  setAnnouncementData({
                    ...announcementData,
                    targetRole: e.target.value,
                  })
                }
              >
                <option value="all">
                  All Users (Admins, Organizers, Students)
                </option>
                <option value="student">Students Only</option>
                <option value="organizer">Organizers Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={announcementData.title}
                onChange={(e) =>
                  setAnnouncementData({
                    ...announcementData,
                    title: e.target.value,
                  })
                }
                placeholder="Announcement title"
                required
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                value={announcementData.message}
                onChange={(e) =>
                  setAnnouncementData({
                    ...announcementData,
                    message: e.target.value,
                  })
                }
                placeholder="Your announcement message..."
                rows="5"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              📢 Send Announcement
            </button>
          </form>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && reports && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>📈 Analytics & Reports</h2>
          </div>

          <div className="reports-grid">
            <div className="report-card">
              <h3>Top Events by Registrations</h3>
              {reports.topEvents.map((event, index) => (
                <div key={event._id} className="report-item">
                  <span>
                    {index + 1}. {event.title}
                  </span>
                  <span className="capacity-badge">
                    {event.registeredCount}/{event.capacity}
                  </span>
                </div>
              ))}
            </div>

            <div className="report-card">
              <h3>Events by Department</h3>
              {reports.eventsByDepartment.map((item) => (
                <div key={item._id} className="report-item">
                  <span>{item._id || "Unknown"}</span>
                  <span className="count-badge">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === "audit" && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>🔍 System Audit Logs</h2>
          </div>

          <div className="events-table">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Action</th>
                  <th>Approved By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log._id}>
                    <td>{log.title}</td>
                    <td>{log.organizer?.name}</td>
                    <td>
                      <span
                        className={`approval-badge approval-${log.approvalStatus}`}
                      >
                        {log.approvalStatus}
                      </span>
                    </td>
                    <td>{log.approvedBy?.name || "N/A"}</td>
                    <td>{new Date(log.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
