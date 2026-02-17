import api from "./api";

const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password, role) => {
    const response = await api.post("/auth/login", { email, password, role });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data.user;
  },

  updateProfile: async (userData) => {
    const response = await api.put("/auth/update", userData);
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
