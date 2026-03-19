import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import eventService from "../services/eventService";
import registrationService from "../services/registrationService";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);

  const fetchEventDetails = React.useCallback(async () => {
    try {
      setLoading(true);
      const eventData = await eventService.getEventById(id);
      setEvent(eventData);
    } catch (err) {
      setError("Failed to load event details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkRegistration = React.useCallback(async () => {
    try {
      const response = await registrationService.checkRegistration(id);
      if (response.isRegistered) {
        setIsRegistered(true);
        setRegistrationId(response.registration._id);
      }
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
    checkRegistration();
  }, [fetchEventDetails, checkRegistration]);

  const handleRegister = async () => {
    try {
      await registrationService.registerForEvent(id);
      alert("Successfully registered for the event!");

      // Update state immediately
      setIsRegistered(true);

      // Refresh event details and check registration
      await fetchEventDetails();
      await checkRegistration();
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm("Are you sure you want to cancel your registration?")) {
      return;
    }

    try {
      if (registrationId) {
        await registrationService.cancelRegistration(registrationId);
        alert("Registration cancelled successfully");

        // Reset registration state immediately
        setIsRegistered(false);
        setRegistrationId(null);

        // Refresh event details to get updated count
        await fetchEventDetails();
      }
    } catch (err) {
      alert("Failed to cancel registration");
      console.error(err);
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container">
        <div className="error-message">{error || "Event not found"}</div>
        <button className="btn btn-primary" onClick={() => navigate("/events")}>
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <button
        className="btn btn-secondary"
        onClick={() => navigate("/events")}
        style={{ marginBottom: "1.5rem" }}
      >
        ← Back to Events
      </button>

      <div className="card">
        <span className={`event-badge ${event.status}`}>
          {event.status.toUpperCase()}
        </span>

        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "0.5rem",
            marginTop: "1rem",
          }}
        >
          {event.title}
        </h1>

        <p style={{ color: "#666", fontSize: "1.1rem", marginBottom: "2rem" }}>
          {event.description}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h4 style={{ color: "#667eea", marginBottom: "0.5rem" }}>
              📅 Event Date & Time
            </h4>
            <p>
              <strong>Start:</strong> {formatDateTime(event.startDate)}
            </p>
            <p>
              <strong>End:</strong> {formatDateTime(event.endDate)}
            </p>
          </div>

          <div>
            <h4 style={{ color: "#667eea", marginBottom: "0.5rem" }}>
              📍 Venue
            </h4>
            <p>{event.venue}</p>
          </div>

          <div>
            <h4 style={{ color: "#667eea", marginBottom: "0.5rem" }}>
              🏷️ Category
            </h4>
            <p>{event.category}</p>
          </div>

          <div>
            <h4 style={{ color: "#667eea", marginBottom: "0.5rem" }}>
              👥 Registration
            </h4>
            <p>
              {event.registeredCount} / {event.capacity} Registered
            </p>
            <div
              style={{
                width: "100%",
                backgroundColor: "#eee",
                borderRadius: "5px",
                height: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(event.registeredCount / event.capacity) * 100}%`,
                  backgroundColor: "#667eea",
                  height: "100%",
                }}
              ></div>
            </div>
          </div>

          <div>
            <h4 style={{ color: "#667eea", marginBottom: "0.5rem" }}>
              👤 Organizer
            </h4>
            <p>{event.organizer?.name}</p>
            <p style={{ color: "#999", fontSize: "0.9rem" }}>
              {event.organizer?.email}
            </p>
          </div>
        </div>

        {event.tags && event.tags.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ color: "#667eea", marginBottom: "1rem" }}>🏷️ Tags</h4>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {event.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="event-badge"
                  style={{ backgroundColor: "#6c757d" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Only show register buttons for students */}
        {user?.role === "student" && (
          <div>
            {/* Show registration closed message */}
            {(!event.registrationOpen || event.status !== "upcoming") && (
              <div
                style={{
                  padding: "1rem",
                  marginTop: "1rem",
                  backgroundColor: "#fee",
                  border: "2px solid #d32f2f",
                  borderRadius: "8px",
                  color: "#d32f2f",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  textAlign: "center",
                }}
              >
                🔒 Registrations Closed
                {event.status === "ongoing" && " - Event is currently ongoing"}
                {event.status === "completed" && " - Event has ended"}
              </div>
            )}

            {/* Show registration buttons only if registration is open */}
            {event.registrationOpen && event.status === "upcoming" && (
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "2rem",
                  flexWrap: "wrap",
                }}
              >
                {isRegistered ? (
                  <>
                    <button
                      className="btn btn-danger"
                      onClick={handleCancelRegistration}
                    >
                      Cancel Registration
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() =>
                        alert("You are registered for this event!")
                      }
                    >
                      ✓ You are registered
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleRegister}
                    disabled={event.registeredCount >= event.capacity}
                  >
                    {event.registeredCount >= event.capacity
                      ? "Event Full"
                      : "Register Now"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Message for admin and organizer */}
        {(user?.role === "admin" || user?.role === "organizer") && (
          <div
            style={{
              marginTop: "2rem",
              padding: "1rem",
              backgroundColor: "#f0f0f0",
              borderRadius: "8px",
              color: "#666",
            }}
          >
            ℹ️ Admins and Organizers cannot register for events
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
