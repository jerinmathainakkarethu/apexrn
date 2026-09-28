import api from "../services/api";

export const getProgramDetails = () => api.get("/program-details");
export const updateProgramDetails = (payload) => api.put("/program-details", payload);
