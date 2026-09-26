import api from "../services/api";

export const loginAdmin = (payload) => api.post("/auth/login", payload);