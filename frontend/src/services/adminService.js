import api from "./api";

const adminService = {
  // Get dashboard stats
  getStats: () => api.get("/admin/stats"),

  // User management
  getAllUsers: (params) => api.get("/admin/users", { params }),
  updateUserRole: (userId, role) =>
    api.put(`/admin/users/${userId}/role`, { role }),
  deactivateUser: (userId) => api.put(`/admin/users/${userId}/deactivate`),

  // Event management
  suspendEvent: (eventId, reason) =>
    api.put(`/admin/events/${eventId}/suspend`, { reason }),
  getEventRegistrations: (eventId) =>
    api.get(`/admin/events/${eventId}/registrations`),

  // Communication
  sendAnnouncement: (data) => api.post("/admin/announcement", data),

  // Reports & Analytics
  getReports: () => api.get("/admin/reports"),
  getAuditLogs: (params) => api.get("/admin/audit-logs", { params }),
};

export default adminService;
