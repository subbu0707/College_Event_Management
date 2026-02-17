import React, { useState, useEffect } from "react";
import notificationService from "../services/notificationService";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({
        page: currentPage,
        limit: 10,
      });
      setNotifications(response.notifications);
      setTotalPages(response.totalPages);
      setUnreadCount(response.unreadCount);
    } catch (err) {
      setError("Failed to fetch notifications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      alert("Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      fetchNotifications();
    } catch (err) {
      alert("Failed to delete notification");
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;

    return notifDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getNotificationIcon = (type) => {
    const icons = {
      event_registration: "✅",
      event_update: "📢",
      event_reminder: "🔔",
      event_cancelled: "❌",
      feedback_request: "💬",
    };
    return icons[type] || "📬";
  };

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ color: "#333" }}>
          🔔 Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </h1>
        {unreadCount > 0 && (
          <button
            className="btn btn-secondary btn-small"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">No notifications yet</div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "2rem" }}>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="card"
                style={{
                  marginBottom: "1rem",
                  borderLeft: `4px solid ${!notification.read ? "#667eea" : "#ddd"}`,
                  backgroundColor: !notification.read ? "#f8f9fa" : "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>
                        {getNotificationIcon(notification.type)}
                      </span>
                      <h3 className="card-title" style={{ margin: 0 }}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span
                          style={{
                            backgroundColor: "#667eea",
                            color: "white",
                            borderRadius: "50%",
                            width: "10px",
                            height: "10px",
                            display: "inline-block",
                          }}
                        ></span>
                      )}
                    </div>
                    <p className="card-text">{notification.message}</p>
                    <p style={{ color: "#999", fontSize: "0.85rem" }}>
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginLeft: "1rem",
                    }}
                  >
                    {!notification.read && (
                      <button
                        className="btn btn-small btn-primary"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        Read
                      </button>
                    )}
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeleteNotification(notification._id)}
                    >
                      Delete
                    </button>
                  </div>
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

export default Notifications;
