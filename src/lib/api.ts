// src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

export default api;

export type AuthResponse = {
  access_token?: string; accessToken?: string;
  refresh_token?: string; refreshToken?: string;
  user?: any;
};

export const AuthApi = {
  login: (emailOrUsername: string, password: string) =>
    api.post("/auth/login", { emailOrUsername, password }).then(r => r.data as AuthResponse),

  register: (p: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    username?: string;
    phone?: string | null;
    dateOfBirth?: string | null;
  }) =>
    api.post("/auth/register", {
      email: p.email,
      username: p.username ?? makeUsername(p),
      password: p.password,
      firstName: p.firstName,
      lastName: p.lastName,
      phone: p.phone,
      dateOfBirth: p.dateOfBirth,
    }).then(r => r.data as AuthResponse),

  me: () => api.get("/auth/me").then(r => r.data),

  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }).then(r => r.data as AuthResponse),

  logout: (refreshToken: string | null) =>
    api.post("/auth/logout", { refreshToken }).then(r => r.data),
};

function makeUsername(p: { firstName: string; lastName: string; email: string }) {
  const base =
    (p.email?.split("@")[0] || `${p.firstName}.${p.lastName}`)
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .toLowerCase();
  return base || `user_${Math.random().toString(36).slice(2, 8)}`;
}

export function pickTokens(r: AuthResponse) {
  const access = r.access_token ?? r.accessToken ?? null;
  const refresh = r.refresh_token ?? r.refreshToken ?? null;
  return { access, refresh };
}
