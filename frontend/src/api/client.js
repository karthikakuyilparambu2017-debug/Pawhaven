import axios from "axios";

// "/api" works everywhere:
// - on Vercel it is forwarded to Render by vercel.json
// - on your computer it goes through the Vite proxy
const API_BASE = (import.meta.env.VITE_API_URL || "/api").trim().replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 60000, // Render's free plan can take up to a minute to wake up
});

// ---- CSRF token: GET /auth/csrf-token, sent as x-csrf-token on changes ----
let csrfToken = null;
let csrfRequest = null; // shared, so parallel requests fetch it only once

async function getCsrfToken() {
  if (csrfToken) return csrfToken;

  if (!csrfRequest) {
    csrfRequest = api
      .get("/auth/csrf-token")
      .then((res) => {
        csrfToken = res.data?.csrfToken;
        if (!csrfToken) throw new Error("CSRF token was not received");
        return csrfToken;
      })
      .finally(() => {
        csrfRequest = null;
      });
  }

  return csrfRequest;
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();

  if (["post", "put", "patch", "delete"].includes(method)) {
    const token = await getCsrfToken();
    config.headers = config.headers || {};
    config.headers["x-csrf-token"] = token;
  }

  return config;
});

// ---- Responses: refresh the login on 401, refetch the CSRF token on a CSRF 403 ----
// These calls must never trigger an automatic refresh
const NO_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
];

let refreshing = null;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (!original) return Promise.reject(error);

    const url = original.url || "";

    // Access token expired: refresh once, then repeat the original request
    if (status === 401 && !original._retry && !NO_REFRESH.some((p) => url.includes(p))) {
      original._retry = true;

      try {
        if (!refreshing) {
          refreshing = api.post("/auth/refresh").finally(() => {
            refreshing = null;
          });
        }
        await refreshing;
        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }

    // CSRF token missing or expired: get a new one and repeat once
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
  const data = err.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map((e) => e.msg || e.message || String(e)).join(". ");
  }

  // No reply at all: the server is asleep, down, or the connection failed
  if (!err.response && (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED")) {
    return "Cannot reach the server. It may be waking up, so please wait a minute and try again.";
  }

  return data?.message || err.message || "Something went wrong";
};

export default api;