// ─────────────────────────────────────────────────────────────
//  api.js  —  Drop this file in your React src/ folder
//  All calls to the AVote backend live here.
//  Usage: import api from './api'
// ─────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Token storage ─────────────────────────────────────────────
const getToken  = () => sessionStorage.getItem("av_token");
const setToken  = (t) => sessionStorage.setItem("av_token", t);
const clearToken = () => sessionStorage.removeItem("av_token");

// ── Core fetch wrapper ────────────────────────────────────────
async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────
const auth = {
  /**
   * Register a new user
   * @returns {{ token, user }}
   */
  register: async ({ name, email, password }) => {
    const data = await request("/auth/register", {
      method: "POST",
      body: { name, email, password },
      auth: false,
    });
    setToken(data.token);
    return data;
  },

  /**
   * Log in an existing user
   * @returns {{ token, user }}
   */
  login: async ({ email, password }) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    setToken(data.token);
    return data;
  },

  /**
   * Fetch the logged-in user's profile
   * @returns {{ user }}
   */
  me: () => request("/auth/me"),

  /** Remove token and log out (client-side) */
  logout: () => clearToken(),
};

// ── Notes ─────────────────────────────────────────────────────
const notes = {
  /**
   * Get all notes (optionally filter)
   * @param {{ search?: string, pinned?: boolean }} [params]
   * @returns {{ count, notes }}
   */
  getAll: ({ search, pinned } = {}) => {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (pinned !== undefined) qs.set("pinned", String(pinned));
    const q = qs.toString();
    return request(`/notes${q ? `?${q}` : ""}`);
  },

  /**
   * Get a single note by ID
   * @returns {{ note }}
   */
  getOne: (id) => request(`/notes/${id}`),

  /**
   * Create a new note
   * @param {{ title, body, pinned?, color? }} payload
   * @returns {{ note }}
   */
  create: (payload) =>
    request("/notes", { method: "POST", body: payload }),

  /**
   * Update a note (full update)
   * @param {string} id
   * @param {{ title?, body?, pinned?, color? }} payload
   * @returns {{ note }}
   */
  update: (id, payload) =>
    request(`/notes/${id}`, { method: "PUT", body: payload }),

  /**
   * Toggle pin on a note
   * @returns {{ note, pinned }}
   */
  togglePin: (id) =>
    request(`/notes/${id}/pin`, { method: "PATCH" }),

  /**
   * Delete a single note
   * @returns {{ message, id }}
   */
  delete: (id) =>
    request(`/notes/${id}`, { method: "DELETE" }),

  /**
   * Delete ALL notes for the current user
   * @returns {{ message }}
   */
  deleteAll: () =>
    request("/notes", { method: "DELETE" }),
};

const api = { auth, notes };
export default api;

// ── Named exports for convenience ─────────────────────────────
export { auth, notes };
