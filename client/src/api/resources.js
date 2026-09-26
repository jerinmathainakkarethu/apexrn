import api from "../services/api";

export const getResources = () => api.get("/resources");
export const createResource = (payload) => api.post("/resources", payload);
export const updateResource = (id, payload) =>
  api.put(`/resources/${id}`, payload);
export const deleteResource = (id) => api.delete(`/resources/${id}`);