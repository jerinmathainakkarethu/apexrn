import api from "../services/api";

export const ingestJotformSubmission = (payload) => api.post("/jotform/ingest", payload);
