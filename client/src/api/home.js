import api from "../services/api";

export const getHome = () => api.get("/home");
export const updateHome = (payload) => api.put("/home", payload);