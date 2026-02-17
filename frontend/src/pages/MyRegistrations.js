import React, { useState, useEffect } from "react";
import registrationService from "../services/registrationService";

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRegistrations();
  }, [currentPage]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await registrationService.getMyRegistrations({
        page: currentPage,
        limit: 10,
      });
      setRegistrations(response.registrations);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError("Failed to fetch registrations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm("Are you sure you want to cancel this registration?")) {
      return;
    }

    try {
      await registrationService.cancelRegistration(registrationId);
      alert("Registration cancelled successfully");
      fetchRegistrations();
    } catch (err) {
      alert("Failed to cancel registration");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: "2rem", color: "#333" }}>
        📋 My Registrations
      </h1>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : registrations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">
            You haven't registered for any events yet
          </div>
          <a href="/events" className="btn btn-primary">
            Browse Events
          </a>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "2rem" }}>
            {registrations.map((registration) => (
              <div
                key={registration._id}
                className="card event-card"
                style={{ marginBottom: "1rem" }}
              >
                <span className={`event-badge ${registration.event?.status}`}>
                  {registration.event?.status?.toUpperCase()}
                </span>

                <h3 className="card-title">{registration.event?.title}</h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <strong>Registered on:</strong>
                    <p>{formatDate(registration.registrationDate)}</p>
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <p
                      style={{
                        color:
                          registration.status === "registered"
                            ? "#28a745"
                            : "#999",
                      }}
                    >
                      {registration.status}
                    </p>
                  </div>
                  <div>
                    <strong>Venue:</strong>
                    <p>{registration.event?.venue}</p>
                  </div>
                  <div>
                    <strong>Date:</strong>
                    <p>{formatDate(registration.event?.startDate)}</p>
                  </div>
                </div>

                {registration.participationHistory?.feedbackGiven && (
                  <div
                    style={{
                      backgroundColor: "#d4edda",
                      border: "1px solid #c3e6cb",
                      borderRadius: "5px",
                      padding: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <strong>Your Feedback:</strong>
                    <p>
                      Rating:{" "}
                      {"⭐".repeat(registration.participationHistory.rating)}
                    </p>
                    <p>{registration.participationHistory.feedback}</p>
                  </div>
                )}

                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  {registration.status === "registered" && (
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleCancelRegistration(registration._id)}
                    >
                      Cancel Registration
                    </button>
                  )}
                  <a
                    href={`/event/${registration.event?._id}`}
                    className="btn btn-primary btn-small"
                  >
                    View Event Details
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "active" : ""}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyRegistrations;
