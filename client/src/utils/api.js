import axios from "axios";
import { store } from "../store";
import { logoutUser } from "../store/slices/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  // headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // only auto-logout on 401 if NOT on the login/register route
    const url = err.config?.url || "";

    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/me");

    if (err.response?.status === 401 && !isAuthRoute) {
      store.dispatch(logoutUser()); // ← was logout(), now logoutUser()
    }

    return Promise.reject(err);
  },
);

export default api;
