import api from "../services/api";

export const getAbout = () => api.get("/about");
export const updateAbout = (payload) => api.put("/about", payload);