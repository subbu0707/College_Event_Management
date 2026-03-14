import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import eventService from "../services/eventService";
import organizerService from "../services/organizerService";

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    myEvents: 0,
    pendingApproval: 0,
    totalRegistrations: 0,
    activeEvents: 0,
  });
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    startDate: "",
    endDate: "",
    venue: "",
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technical",
    startDate: "",
    endDate: "",
    venue: "",
    capacity: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // Process tags (comma-separated to array)
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const eventData = {
        ...formData,
        tags: tagsArray,
        capacity: parseInt(formData.capacity),
      };

      await eventService.createEvent(eventData);
      setSuccess("Event created successfully! Pending admin approval.");

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "Technical",
        startDate: "",
        endDate: "",
        venue: "",
        capacity: "",
        tags: "",
      });

      // Refresh dashboard data
      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
        fetchDashboardData();
      }, 2000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create event. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
    setSuccess("");
    setFormData({
      title: "",
      description: "",
      category: "Technical",
      startDate: "",
      endDate: "",
      venue: "",
      capacity: "",
      tags: "",
    });
  };

  const handleEditEvent = (event) => {
    // Open edit modal instead of navigating
    setSelectedEvent(event);

    // Format dates for datetime-local input
    const formatDateTimeLocal = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setEditFormData({
      startDate: formatDateTimeLocal(event.startDate),
      endDate: formatDateTimeLocal(event.endDate),
      venue: event.venue,
    });
    setShowEditModal(true);
    setError("");
    setSuccess("");
  };

  const handleViewDetails = async (event) => {
    setSelectedEvent(event);
    setShowParticipantsModal(true);
    setParticipantsLoading(true);

    try {
      const response = await organizerService.getEventParticipants(event._id);
      setParticipants(response.data.data);
    } catch (error) {
      console.error("Error fetching participants:", error);
      alert("Failed to load participants");
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleCloseParticipantsModal = () => {
    setShowParticipantsModal(false);
    setSelectedEvent(null);
    setParticipants([]);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedEvent(null);
    setEditFormData({
      startDate: "",
      endDate: "",
      venue: "",
    });
    setError("");
    setSuccess("");
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await organizerService.updateEvent(selectedEvent._id, editFormData);
      setSuccess("Event updated successfully!");

      // Refresh dashboard data
      setTimeout(() => {
        setShowEditModal(false);
        setSuccess("");
        setSelectedEvent(null);
        fetchDashboardData();
      }, 2000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update event. Please try again.",
      );
    } finally {
      setSubmitting(false);
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
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Create New Event
          </button>
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
                      <button
                        className="btn-icon"
                        title="Edit"
                        onClick={() => handleEditEvent(event)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        title="View Details"
                        onClick={() => handleViewDetails(event)}
                      >
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
              <button
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                Create Your First Event
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            ➕ Create Event
          </button>
          <Link to="/events" className="btn btn-secondary">
            📋 View All Events
          </Link>
          <Link to="/notifications" className="btn btn-outline">
            🔔 Notifications
          </Link>
        </div>
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Event</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="event-form">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="form-group">
                <label htmlFor="title">Event Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength="100"
                  placeholder="Enter event title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  maxLength="2000"
                  rows="4"
                  placeholder="Describe your event"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                    <option value="Social">Social</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="capacity">Capacity *</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="Max participants"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="venue">Venue *</label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                  maxLength="200"
                  placeholder="Event location"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g. hackathon, coding, competition"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Participants Modal */}
      {showParticipantsModal && selectedEvent && (
        <div className="modal-overlay" onClick={handleCloseParticipantsModal}>
          <div
            className="modal-content large-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>📋 Registered Users - {selectedEvent.title}</h2>
                <p
                  style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}
                >
                  {selectedEvent.registeredCount}/{selectedEvent.capacity}{" "}
                  registered
                </p>
              </div>
              <button
                className="modal-close"
                onClick={handleCloseParticipantsModal}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {participantsLoading ? (
                <div className="spinner-container">
                  <div className="spinner"></div>
                </div>
              ) : (
                <>
                  {/* Registered Participants */}
                  <div className="participants-section">
                    <h3>
                      ✅ Registered ({participants.count?.registered || 0})
                    </h3>
                    {participants.participants?.length > 0 ? (
                      <div className="participants-table">
                        <table>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Roll Number</th>
                              <th>Branch</th>
                              <th>Phone</th>
                              <th>Semester</th>
                              <th>Registered On</th>
                            </tr>
                          </thead>
                          <tbody>
                            {participants.participants.map((reg, index) => (
                              <tr key={reg._id}>
                                <td>{index + 1}</td>
                                <td>{reg.student?.name || "N/A"}</td>
                                <td>{reg.student?.email || "N/A"}</td>
                                <td>{reg.student?.rollNumber || "N/A"}</td>
                                <td>{reg.student?.branch || "N/A"}</td>
                                <td>{reg.student?.phone || "N/A"}</td>
                                <td>{reg.student?.semester || "N/A"}</td>
                                <td>
                                  {new Date(
                                    reg.createdAt || reg.registrationDate,
                                  ).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="empty-message">
                        No registered participants yet
                      </p>
                    )}
                  </div>

                  {/* Attended Participants */}
                  {participants.attended?.length > 0 && (
                    <div
                      className="participants-section"
                      style={{ marginTop: "30px" }}
                    >
                      <h3>🎯 Attended ({participants.count?.attended || 0})</h3>
                      <div className="participants-table">
                        <table>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Roll Number</th>
                              <th>Branch</th>
                            </tr>
                          </thead>
                          <tbody>
                            {participants.attended.map((reg, index) => (
                              <tr key={reg._id}>
                                <td>{index + 1}</td>
                                <td>{reg.student?.name || "N/A"}</td>
                                <td>{reg.student?.email || "N/A"}</td>
                                <td>{reg.student?.rollNumber || "N/A"}</td>
                                <td>{reg.student?.branch || "N/A"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Cancelled Participants */}
                  {participants.cancelled?.length > 0 && (
                    <div
                      className="participants-section"
                      style={{ marginTop: "30px" }}
                    >
                      <h3>
                        ❌ Cancelled ({participants.count?.cancelled || 0})
                      </h3>
                      <div className="participants-table">
                        <table>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Branch</th>
                            </tr>
                          </thead>
                          <tbody>
                            {participants.cancelled.map((reg, index) => (
                              <tr key={reg._id}>
                                <td>{index + 1}</td>
                                <td>{reg.student?.name || "N/A"}</td>
                                <td>{reg.student?.email || "N/A"}</td>
                                <td>{reg.student?.branch || "N/A"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCloseParticipantsModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Event: {selectedEvent.title}</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="event-form">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-startDate">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    id="edit-startDate"
                    name="startDate"
                    value={editFormData.startDate}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-endDate">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    id="edit-endDate"
                    name="endDate"
                    value={editFormData.endDate}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-venue">Venue *</label>
                <input
                  type="text"
                  id="edit-venue"
                  name="venue"
                  value={editFormData.venue}
                  onChange={handleEditInputChange}
                  required
                  maxLength="200"
                  placeholder="Event location"
                />
              </div>

              <div className="alert alert-info" style={{ marginTop: "15px" }}>
                ℹ️ Registered participants will be notified about these changes.
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseEditModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Update Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
