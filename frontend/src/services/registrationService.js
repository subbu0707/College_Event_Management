import api from "./api";

const registrationService = {
  registerForEvent: async (eventId) => {
    const response = await api.post("/registrations/register", { eventId });
    return response.data;
  },

  getMyRegistrations: async (params = {}) => {
    const response = await api.get("/registrations/my-registrations", {
      params,
    });
    return response.data;
  },

  checkRegistration: async (eventId) => {
    const response = await api.get(`/registrations/check/${eventId}`);
    return response.data;
  },

  cancelRegistration: async (registrationId) => {
    const response = await api.delete(
      `/registrations/cancel/${registrationId}`,
    );
    return response.data;
  },

  submitFeedback: async (registrationId, rating, feedback) => {
    const response = await api.put(
      `/registrations/feedback/${registrationId}`,
      {
        rating,
        feedback,
      },
    );
    return response.data;
  },
};

export default registrationService;
