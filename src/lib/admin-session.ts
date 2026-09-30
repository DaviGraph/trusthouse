import { create } from "zustand";
import { adminLoginServer, adminVerifySessionServer } from "./server/admin-auth";

const STORAGE_KEY = "trusthouse_admin_jwt";

type AdminState = {
  token: string | null;
  user: { email: string; role: string } | null;
  isAuthenticated: boolean;
  isChecking: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initSession: () => Promise<void>;
};

export const useAdminSession = create<AdminState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isChecking: true,

  initSession: async () => {
    if (typeof window === "undefined") {
      set({ isChecking: false });
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      set({ token: null, user: null, isAuthenticated: false, isChecking: false });
      return;
    }

    try {
      const res = await adminVerifySessionServer({ data: { token: stored } });
      if (res.valid && res.user) {
        set({
          token: stored,
          user: res.user,
          isAuthenticated: true,
          isChecking: false,
        });
        return;
      }
    } catch {
      // Token expired or invalid
    }
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false, isChecking: false });
  },

  login: async (email: string, password: string) => {
    const res = await adminLoginServer({ data: { email, password } });
    if (res.success && res.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, res.token);
      }
      set({
        token: res.token,
        user: res.user,
        isAuthenticated: true,
        isChecking: false,
      });
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isChecking: false,
    });
  },
}));

/** Helper to get current admin token for server requests */
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

/** Helper to set admin token directly in localStorage */
export function setAdminToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, token);
}

/** Helper to clear admin token from localStorage */
export function clearAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
