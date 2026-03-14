import React from "react";

const EventCard = ({
  event,
  onDetails,
  onRegister,
  isRegistered,
  onCancel,
  userRole,
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="card event-card">
      <span className={`event-badge ${event.status}`}>
        {event.status.toUpperCase()}
      </span>

      {/* Show registration closed status */}
      {(!event.registrationOpen || event.status !== "upcoming") && (
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.3rem 0.6rem",
            backgroundColor: "#fee",
            border: "1px solid #d32f2f",
            borderRadius: "4px",
            color: "#d32f2f",
            fontSize: "0.85rem",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          🔒 Registrations Closed
        </div>
      )}

      <h3 className="card-title">{event.title}</h3>

      <p className="card-text" style={{ marginBottom: "1rem" }}>
        {event.description.substring(0, 100)}...
      </p>

      <div className="event-info">
        <span>📅 {formatDate(event.startDate)}</span>
      </div>

      <div className="event-info">
        <span>📍 {event.venue}</span>
      </div>

      <div className="event-info">
        <span>
          👥 {event.registeredCount}/{event.capacity} Registered
        </span>
      </div>

      <div className="event-info">
        <span>🏷️ {event.category}</span>
      </div>

      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn btn-primary btn-small"
          onClick={() => onDetails(event._id)}
        >
          View Details
        </button>

        {/* Only show register/cancel buttons for students and when registration is open */}
        {userRole === "student" &&
          event.registrationOpen &&
          event.status === "upcoming" && (
            <>
              {isRegistered ? (
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => onCancel(event._id)}
                >
                  Cancel Registration
                </button>
              ) : (
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => onRegister(event._id)}
                  disabled={event.registeredCount >= event.capacity}
                >
                  {event.registeredCount >= event.capacity
                    ? "Event Full"
                    : "Register"}
                </button>
              )}
            </>
          )}
      </div>
    </div>
  );
};

export default EventCard;
