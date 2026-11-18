// If your backend uses a different address, change it here (only place).
export const CARE_LOGS_PATH = "/care-logs";
export const HEALTH_LOGS_PATH = "/health-logs";
// Finds the array inside a reply like { success, count, careLogs: [...] }
export const pickList = (d) => {
  if (Array.isArray(d)) return d;
  for (const v of Object.values(d || {})) {
    if (Array.isArray(v)) return v;
  }
  return [];
};

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const MOODS = ["HAPPY", "CALM", "ACTIVE", "ANXIOUS", "SICK", "UNKNOWN"];

export const MOOD_BADGE = {
  HAPPY: "text-bg-success",
  CALM: "text-bg-info",
  ACTIVE: "text-bg-primary",
  ANXIOUS: "text-bg-warning",
  SICK: "text-bg-danger",
  UNKNOWN: "text-bg-secondary",
};

export const titleCase = (v) =>
  (v || "").replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());