import api from "../services/api";

export const loginAdmin = (payload) => api.post("/auth/login", payload);
export const updateAdminProfile = (payload) =>
  api.put("/auth/profile", payload);