import React, { createContext, useContext, useEffect, useState } from "react";
import PocketBase from "pocketbase";
import {
  AUTH_LOGIN_URL,
  AUTH_REGISTER_URL,
} from "@/lib/apiConfig";
import { normalizeMode } from "@/lib/historyStorage";

const pb = new PocketBase("http://127.0.0.1:8090");

const AuthContext = createContext();

const loadStoredUser = () => {
  try {
    const raw = localStorage.getItem("devinspect-user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistSession = (user, token) => {
  localStorage.setItem("devinspect-user", JSON.stringify(user));
  if (token) {
    localStorage.setItem("devinspect-token", token);
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentMode, setCurrentMode] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const storedUser = loadStoredUser();
      if (storedUser) {
        setCurrentUser(storedUser);
      } else if (pb.authStore.isValid) {
        setCurrentUser(pb.authStore.model);
      }

      const savedMode = localStorage.getItem("devinspect-mode");
      if (savedMode) {
        setCurrentMode(normalizeMode(savedMode));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const loginWithBackend = async (email, password) => {
    const response = await fetch(AUTH_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Invalid credentials");
    }

    const user = {
      id: data._id,
      email,
      name: data.name || email.split("@")[0],
      created: new Date().toISOString(),
    };

    persistSession(user, data.token);
    setCurrentUser(user);

    const savedMode = localStorage.getItem("devinspect-mode");
    setCurrentMode(normalizeMode(savedMode || "student"));

    return user;
  };

  const signupWithBackend = async (email, password, name) => {
    const registerResponse = await fetch(AUTH_REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const registerData = await registerResponse.json();
    if (!registerResponse.ok) {
      throw new Error(registerData.message || "Registration failed");
    }

    return loginWithBackend(email, password);
  };

  const login = async (email, password) => {
    setError("");
    try {
      return await loginWithBackend(email, password);
    } catch (backendErr) {
      try {
        const authData = await pb
          .collection("users")
          .authWithPassword(email, password);

        setCurrentUser(authData.record);
        const savedMode = localStorage.getItem("devinspect-mode");
        setCurrentMode(normalizeMode(savedMode || "student"));
        return authData.record;
      } catch {
        const demoUser = {
          id: "demo-user",
          email,
          name: email.split("@")[0] || "Demo User",
          created: new Date().toISOString(),
        };
        persistSession(demoUser, null);
        setCurrentUser(demoUser);
        setCurrentMode(normalizeMode("student"));
        localStorage.setItem("devinspect-mode", "student");
        return demoUser;
      }
    }
  };

  const signup = async (email, password, name) => {
    setError("");
    try {
      return await signupWithBackend(email, password, name);
    } catch (backendErr) {
      try {
        await pb.collection("users").create({
          email,
          password,
          passwordConfirm: password,
          name,
        });
        const authData = await pb
          .collection("users")
          .authWithPassword(email, password);
        setCurrentUser(authData.record);
        setCurrentMode("student");
        localStorage.setItem("devinspect-mode", "student");
        return authData.record;
      } catch {
        const demoUser = {
          id: "demo-user",
          email,
          name: name || email.split("@")[0],
          created: new Date().toISOString(),
        };
        persistSession(demoUser, null);
        setCurrentUser(demoUser);
        setCurrentMode("student");
        localStorage.setItem("devinspect-mode", "student");
        return demoUser;
      }
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    setCurrentMode(null);
    localStorage.removeItem("devinspect-token");
    localStorage.removeItem("devinspect-user");
    localStorage.removeItem("devinspect-mode");
  };

  const switchMode = async (mode) => {
    const normalized = normalizeMode(mode);
    setCurrentMode(normalized);
    localStorage.setItem("devinspect-mode", normalized);
  };

  const requestPasswordReset = async (email) => {
    try {
      await pb.collection("users").requestPasswordReset(email);
    } catch (err) {
      console.error(err);
    }
  };

  const updateUserPreferences = async (preferences) => {
    localStorage.setItem(
      "devinspect-preferences",
      JSON.stringify(preferences)
    );
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
        requestPasswordReset,
        updateUserPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
