import api from "../services/api";

export const getProgram = () => api.get("/program");
export const createProgramWeek = (payload) =>
  api.post("/program/weeks", payload);
export const updateProgramWeek = (id, payload) =>
  api.put(`/program/weeks/${id}`, payload);
export const deleteProgramWeek = (id) => api.delete(`/program/weeks/${id}`);