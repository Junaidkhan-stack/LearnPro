import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "@/services/api";

type Role = "student" | "teacher" | "admin";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = "token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ================= BOOTSTRAP ================= */
  useEffect(() => {
    const bootstrap = async () => {
      try {

        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

        if (storedToken) {
          setToken(storedToken);

          const res = await api.get("/auth/me");
          setUser(res.data);
        }
      } catch (err) {
         console.log("❌ BOOTSTRAP ERROR:", err);
        console.log("❌ Fetch user failed");
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  /* ================= LOGIN ================= */
  const login = async (jwt: string, userData: User) => {
    await SecureStore.setItemAsync(TOKEN_KEY, jwt);
    setToken(jwt);
    setUser(userData);
  };

  /* ================= LOGOUT ================= */
  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}