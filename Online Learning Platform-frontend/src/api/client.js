const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function api(path, options = {}) {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
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
