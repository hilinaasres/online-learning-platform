const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const AUTH_STORAGE_KEY = "olp_auth";

function readAccessToken() {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY) || "null")?.token || "";
  } catch {
    return "";
  }
}

export async function api(path, options = {}) {
  const { body, headers, ...rest } = options;
  const token = readAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function isStaffRole(role) {
  const value = String(role || "").toLowerCase();
  return value === "instructor" || value === "teacher" || value === "admin";
}

export function isStudentRole(role) {
  return String(role || "").toLowerCase() === "student";
}
