import api from "./api";

const eventService = {
  getAllEvents: async (params = {}) => {
    const response = await api.get("/events", { params });
    return response.data;
  },

  getEventById: async (eventId) => {
    const response = await api.get(`/events/${eventId}`);
    return response.data.event;
  },

  getEventsByCategory: async (category, params = {}) => {
    const response = await api.get(`/events/category/${category}`, { params });
    return response.data;
  },

  searchEvents: async (keyword, params = {}) => {
    const response = await api.get(`/events/search/${keyword}`, { params });
    return response.data;
  },

  // Organizer endpoints
  getMyEvents: async () => {
    const response = await api.get("/events/organizer/my-events");
    return response.data;
  },

  // Admin endpoints
  getAllEventsAdmin: async () => {
    const response = await api.get("/events/admin/all");
    return response.data;
  },

  approveEvent: async (eventId) => {
    const response = await api.put(`/events/${eventId}/approve`);
    return response.data;
  },

  rejectEvent: async (eventId, reason) => {
    const response = await api.put(`/events/${eventId}/reject`, { reason });
    return response.data;
  },
};

export default eventService;
