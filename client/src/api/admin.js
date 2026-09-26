import api from "../services/api";

export const getAdminContacts = () => api.get("/admin/contact");
export const getAdminQa = () => api.get("/admin/qa");
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post("/admin/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};