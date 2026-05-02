import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const normalizedApiUrl = rawApiUrl
  .replace(/^VITE_API_URL=/i, "")
  .replace(/\/+$/, "");

const API = axios.create({
  baseURL: normalizedApiUrl,
  withCredentials: true
});

export const API_BASE_URL = normalizedApiUrl;

export const resolveAssetUrl = (value) => {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${normalizedApiUrl.replace(/\/api$/, "")}${value.startsWith("/") ? value : `/${value}`}`;
};

/**
 * Attach JWT token
 */
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

/**
 * Normalize ALL responses + handle auth errors
 */
API.interceptors.response.use(
  (res) => {
    // ✅ Always return clean data
    return res.data;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      window.location.href = "/login";
    }

    console.error("API Error:", err.response?.data || err.message);

    return Promise.reject(err.response?.data || err.message);
  }
);

export default API;
