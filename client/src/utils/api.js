import axios from "axios";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT + fix Content-Type for FormData
api.interceptors.request.use((config) => {
  const token = store.getState().auth?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Let axios set the correct multipart/form-data boundary automatically
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(err);
  },
);

export default api;
