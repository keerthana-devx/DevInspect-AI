import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AUTH_LOGIN_URL,
  AUTH_REGISTER_URL,
  USER_PROFILE_URL,
} from "@/lib/apiConfig";
import { normalizeMode } from "@/lib/historyStorage";

const AuthContext = createContext();

const loadStoredUser = () => {
  try {
    const raw = localStorage.getItem("devinspect-user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentMode, setCurrentMode] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = loadStoredUser();
      const token = localStorage.getItem("devinspect-token");

      if (storedUser && token) {
        setCurrentUser(storedUser);
        setCurrentMode(normalizeMode(storedUser.currentMode));
      }

      setInitialLoading(false);
    };

    initAuth();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("devinspect-token");

    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const login = async (email, password) => {
    setError("");

    const response = await fetch(AUTH_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (!data.token) {
      throw new Error("Token missing from backend response");
    }

    const mappedUser = {
      id: data._id,
      email: data.email,
      name: data.name,
      role: data.role || 'user',
      currentMode: data.currentMode || 'developer',
    };

    // SAVE TOKEN
    localStorage.setItem("devinspect-token", data.token);
    localStorage.setItem("devinspect-user", JSON.stringify(mappedUser));
    localStorage.setItem("devinspect-mode", mappedUser.currentMode);

    setCurrentUser(mappedUser);
    setCurrentMode(normalizeMode(mappedUser.currentMode));

    return mappedUser;
  };

  const signup = async (email, password, name) => {
    const res = await fetch(AUTH_REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    return login(email, password);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentMode(null);
    localStorage.removeItem("devinspect-token");
    localStorage.removeItem("devinspect-user");
    localStorage.removeItem("devinspect-mode");
  };

  const switchMode = (mode) => {
    const normalized = normalizeMode(mode);
    setCurrentMode(normalized);
    localStorage.setItem("devinspect-mode", normalized);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentMode,
        isAuthenticated: !!currentUser,
        initialLoading,
        error,
        login,
        signup,
        logout,
        switchMode,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);