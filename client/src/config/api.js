export const apiBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, "");