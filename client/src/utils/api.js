import axios from "axios";
import { store } from "../store";
import { logoutUser, setAccessToken } from "../store/slices/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  withCredentials: true, // needed so refreshToken cookie is sent to /auth/refresh
});

// ───────────────── REQUEST: attach access token ─────────────────
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ───────────────── RESPONSE: handle 401 with refresh ─────────────────
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const url = originalRequest?.url || "";

    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/me");

    // If 401 and not already retried, and not an auth route itself
    if (err.response?.status === 401 && !isAuthRoute && !originalRequest._retry) {
      if (isRefreshing) {
        // queue this request until refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post("/auth/refresh");
        const newToken = res.data.accessToken;

        store.dispatch(setAccessToken(newToken));
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        store.dispatch(logoutUser());
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // 401 on login/register/me — let it pass through normally
    if (err.response?.status === 401 && !isAuthRoute) {
      store.dispatch(logoutUser());
    }

    return Promise.reject(err);
  }
);

export default api;

// import axios from "axios";
// import { store } from "../store";
// import { logoutUser } from "../store/slices/authSlice";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "/api",
//   timeout: 15000,
//   // headers: { "Content-Type": "application/json" },
//   withCredentials: true,
// });

// api.interceptors.request.use((config) => {
//   if (config.data instanceof FormData) {
//     delete config.headers["Content-Type"];
//   }
//   return config;
// });

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     // only auto-logout on 401 if NOT on the login/register route
//     const url = err.config?.url || "";

//     const isAuthRoute =
//       url.includes("/auth/login") ||
//       url.includes("/auth/register") ||
//       url.includes("/auth/me");

//     if (err.response?.status === 401 && !isAuthRoute) {
//       store.dispatch(logoutUser()); // ← was logout(), now logoutUser()
//     }

//     return Promise.reject(err);
//   },
// );

// export default api;
