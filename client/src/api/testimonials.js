import api from "../services/api";

export const getTestimonials = () => api.get("/testimonials");
export const createTestimonial = (payload) =>
  api.post("/testimonials", payload);
export const updateTestimonial = (id, payload) =>
  api.put(`/testimonials/${id}`, payload);
export const deleteTestimonial = (id) => api.delete(`/testimonials/${id}`);