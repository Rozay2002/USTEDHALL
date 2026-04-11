import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Student, Admin } from "./store";

type UserType = "student" | "admin" | null;

interface AuthState {
  user: Student | Admin | null;
  userType: UserType;
  login: (user: Student | Admin, type: "student" | "admin") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Student | Admin | null>(null);
  const [userType, setUserType] = useState<UserType>(null);

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    const savedType = localStorage.getItem("currentUserType") as UserType;
    if (saved && savedType) {
      setUser(JSON.parse(saved));
      setUserType(savedType);
    }
  }, []);

  const login = (u: Student | Admin, type: "student" | "admin") => {
    setUser(u);
    setUserType(type);
    localStorage.setItem("currentUser", JSON.stringify(u));
    localStorage.setItem("currentUserType", type);
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserType");
  };

  return (
    <AuthContext.Provider value={{ user, userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
