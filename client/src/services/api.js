import axios from "axios";
import { apiBaseUrl, apiOrigin } from "../config/api";

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

export function imageUrl(url) {
  if (!url) return url;
  if (url.startsWith("data:")) return url;
  if (!/^https?:\/\//i.test(url)) {
    if (url.startsWith("/uploads/")) return `${apiOrigin}${url}`;
    return url.startsWith("/") ? url : url;
  }
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1")
      return url;
    return `${apiOrigin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("apex_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;