"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { api } from "@/lib/api";
import type { AuthPayload, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: Record<string, unknown>) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_TOKEN_KEY = "marketly_token";
const STORAGE_USER_KEY = "marketly_user";

const persistSession = (payload: AuthPayload) => {
  localStorage.setItem(STORAGE_TOKEN_KEY, payload.token);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(payload.user));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    if (!token) {
      return;
    }

    try {
      const me = await api.me(token);
      setUser(me);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(me));
    } catch {
      logout();
    }
  };

  const applyAuthPayload = (payload: AuthPayload) => {
    setToken(payload.token);
    setUser(payload.user);
    persistSession(payload);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser) as User);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && token) {
      void refreshUser();
    }
  }, [loading, token]);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login: async (payload) => {
      const response = await api.login(payload);
      applyAuthPayload(response);
    },
    register: async (payload) => {
      const response = await api.register(payload);
      applyAuthPayload(response);
    },
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
