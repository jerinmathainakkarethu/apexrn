import api from "../services/api";

export const loginAdmin = (payload) => api.post("/auth/login", payload);
export const verifyAdminOtp = (payload) =>
  api.post("/auth/verify-otp", payload);
export const updateAdminProfile = (payload) =>
  api.put("/auth/profile", payload);
export const requestPasswordChangeOtp = () =>
  api.post("/auth/profile/password/request-otp");
export const verifyPasswordChangeOtp = (payload) =>
  api.post("/auth/profile/password/verify-otp", payload);