
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

console.log("PawHaven API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let csrfToken = null;

async function getCsrfToken() {
  if (!csrfToken) {
    const res = await api.get("/auth/csrf-token");
    csrfToken = res.data?.csrfToken;

    if (!csrfToken) {
      throw new Error("CSRF token was not received");
    }
  }

  return csrfToken;
}

// Request interceptor
api.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();

  if (["post", "put", "patch", "delete"].includes(method)) {
    config.headers["x-csrf-token"] = await getCsrfToken();
  }

  return config;
});

const NO_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
];

let refreshing = null;

// Response interceptor
api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (!original) return Promise.reject(error);

    // Refresh JWT
    if (
      status === 401 &&
      !original._retry &&
      !NO_REFRESH.some((p) => original.url?.includes(p))
    ) {
      original._retry = true;

      try {
        refreshing =
          refreshing ||
          api.post("/auth/refresh").finally(() => {
            refreshing = null;
          });

        await refreshing;
        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }

    // Retry invalid CSRF token
    if (
      status === 403 &&
      !original._csrfRetry &&
      /csrf/i.test(JSON.stringify(error.response?.data || ""))
    ) {
      original._csrfRetry = true;
      csrfToken = null;

      return api(original);
    }

    return Promise.reject(error);
  }
);

export const unwrap = (res) => res.data?.data ?? res.data;

export const errorMessage = (err) => {
  const d = err.response?.data;

  if (Array.isArray(d?.errors) && d.errors.length) {
    return d.errors
      .map((e) => e.msg || e.message || String(e))
      .join(". ");
  }

  return d?.message || err.message || "Something went wrong";
};

export default api;
