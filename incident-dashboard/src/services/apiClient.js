const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:5000";
export const REFRESH_INTERVAL_MS = 5000;

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchIncidents() {
  return getJson("/api/incidents");
}

export async function fetchResponses() {
  return getJson("/api/responses");
}

export async function fetchActivityLogs() {
  return getJson("/api/activity");
}
