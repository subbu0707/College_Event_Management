import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import eventService from "../services/eventService";
import registrationService from "../services/registrationService";
import EventCard from "../components/EventCard";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const navigate = useNavigate();

  const categories = [
    "Technical",
    "Cultural",
    "Sports",
    "Academic",
    "Social",
    "Workshop",
  ];

  useEffect(() => {
    fetchEvents();
    fetchRegisteredEvents();
  }, [currentPage, category]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      let response;
      if (searchTerm) {
        response = await eventService.searchEvents(searchTerm, {
          page: currentPage,
          limit: 9,
        });
      } else if (category) {
        response = await eventService.getEventsByCategory(category, {
          page: currentPage,
          limit: 9,
        });
      } else {
        response = await eventService.getAllEvents({
          page: currentPage,
          limit: 9,
        });
      }

      setEvents(response.events);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError("Failed to fetch events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const response = await registrationService.getMyRegistrations({
        limit: 1000,
      });
      const registeredIds = response.registrations.map((reg) => reg.event._id);
      setRegisteredEvents(registeredIds);
    } catch (err) {
      console.error("Failed to fetch registered events:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents();
  };

  const handleEventDetails = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleRegister = async (eventId) => {
    try {
      await registrationService.registerForEvent(eventId);
      alert("Successfully registered for the event!");
      setRegisteredEvents([...registeredEvents, eventId]);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel your registration?")) {
      return;
    }

    try {
      const registration = await registrationService.getMyRegistrations({
        limit: 1000,
      });
      const reg = registration.registrations.find(
        (r) => r.event._id === eventId,
      );

      if (reg) {
        await registrationService.cancelRegistration(reg._id);
        alert("Registration cancelled successfully");
        setRegisteredEvents(registeredEvents.filter((id) => id !== eventId));
        fetchEvents();
      }
    } catch (err) {
      alert("Failed to cancel registration");
    }
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat === category ? "" : cat);
    setCurrentPage(1);
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: "2rem", color: "#333" }}>🎊 Explore Events</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events..."
            style={{
              flex: 1,
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "1rem",
            }}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>

      {/* Category Filter */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => handleCategoryChange("")}
          className={`btn btn-small ${!category ? "btn-primary" : "btn-secondary"}`}
          style={{ marginRight: "0.5rem", marginBottom: "0.5rem" }}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`btn btn-small ${category === cat ? "btn-primary" : "btn-secondary"}`}
            style={{ marginRight: "0.5rem", marginBottom: "0.5rem" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="spinner"></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">No events found</div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSearchTerm("");
              setCategory("");
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onDetails={handleEventDetails}
                onRegister={handleRegister}
                onCancel={handleCancelRegistration}
                isRegistered={registeredEvents.includes(event._id)}
              />
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

export default Events;
