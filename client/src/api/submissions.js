import api from "../services/api";

export const registerForQa = (payload) => api.post("/qa/register", payload);
export const submitContact = (payload) => api.post("/contact", payload);