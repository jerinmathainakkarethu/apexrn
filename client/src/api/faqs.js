import api from "../services/api";

export const getFaqs = () => api.get("/faqs");
export const createFaq = (payload) => api.post("/faqs", payload);
export const updateFaq = (id, payload) => api.put(`/faqs/${id}`, payload);
export const deleteFaq = (id) => api.delete(`/faqs/${id}`);