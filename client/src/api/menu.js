import api from "../services/api";

export const getMenu = () => api.get("/menu");
export const updateMenu = (payload) => api.put("/menu", payload);