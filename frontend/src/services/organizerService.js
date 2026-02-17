import api from "./api";

const organizerService = {
  // Get dashboard stats
  getStats: () => api.get("/organizer/stats"),

  // Participant management
  getEventParticipants: (eventId) =>
    api.get(`/organizer/events/${eventId}/participants`),
  exportParticipants: (eventId) =>
    api.get(`/organizer/events/${eventId}/export`),

  // Communication
  notifyParticipants: (eventId, data) =>
    api.post(`/organizer/events/${eventId}/notify`, data),

  // Event control
  updateEventStatus: (eventId, status) =>
    api.put(`/organizer/events/${eventId}/status`, { status }),
  closeRegistrations: (eventId) =>
    api.put(`/organizer/events/${eventId}/close-registration`),

  // Analytics
  getEventAnalytics: (eventId) =>
    api.get(`/organizer/events/${eventId}/analytics`),

  // Delete event
  deleteEvent: (eventId) => api.delete(`/organizer/events/${eventId}`),
};

export default organizerService;
