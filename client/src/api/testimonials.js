import api from "../services/api";

/** Public list: approved stories only. */
export const getTestimonials = () => api.get("/testimonials");
/** Admin list: every story, including drafts. */
export const getAdminTestimonials = () => api.get("/admin/testimonials");
export const createTestimonial = (payload) =>
  api.post("/testimonials", payload);
export const updateTestimonial = (id, payload) =>
  api.put(`/testimonials/${id}`, payload);
export const deleteTestimonial = (id) => api.delete(`/testimonials/${id}`);