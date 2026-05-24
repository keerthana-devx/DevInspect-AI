import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
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
        // Refresh profile from server to get latest avatar/streak
        try {
          const res = await fetch(USER_PROFILE_URL, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const merged = { ...storedUser, avatar: data.avatar, streak: data.streak, xp: data.xp, badges: data.badges, longestStreak: data.longestStreak };
            setCurrentUser(merged);
            localStorage.setItem("devinspect-user", JSON.stringify(merged));
          }
        } catch { /* silent */ }
      }

      setInitialLoading(false);
    };

    initAuth();
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("devinspect-token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }, []);

  const persistUser = useCallback((user) => {
    setCurrentUser(user);
    localStorage.setItem("devinspect-user", JSON.stringify(user));
  }, []);

  const login = async (emailOrUser, passwordOrToken) => {
    setError("");

    // OAuth path: login(userObject, token)
    if (typeof emailOrUser === 'object' && emailOrUser !== null) {
      const userData = emailOrUser;
      const token = passwordOrToken;
      localStorage.setItem("devinspect-token", token);
      localStorage.setItem("devinspect-user", JSON.stringify(userData));
      localStorage.setItem("devinspect-mode", userData.currentMode || 'developer');
      setCurrentUser(userData);
      setCurrentMode(normalizeMode(userData.currentMode));
      return userData;
    }

    // Email/password path
    const email = emailOrUser;
    const password = passwordOrToken;
    const response = await fetch(AUTH_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");
    if (!data.token) throw new Error("Token missing from backend response");

    const mappedUser = {
      id: data._id,
      email: data.email,
      name: data.name,
      role: data.role || 'user',
      currentMode: data.currentMode || 'developer',
      avatar: data.avatar || '',
      streak: data.streak || 0,
      xp: data.xp || 0,
      badges: data.badges || [],
      longestStreak: data.longestStreak || 0,
    };

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
    if (!res.ok) throw new Error(data.message || "Signup failed");
    return login(email, password);
  };

  // Password reset — fire-and-forget to backend; always resolves to prevent email enumeration
  const requestPasswordReset = async (email) => {
    try {
      await fetch(`${AUTH_LOGIN_URL.replace('/login', '/forgot-password')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Silently ignore — always show success to prevent email enumeration
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentMode(null);
    localStorage.removeItem("devinspect-token");
    localStorage.removeItem("devinspect-user");
    localStorage.removeItem("devinspect-mode");
    window.location.replace("/login");
  };

  const deleteAccountOnBackend = async () => {
    const token = localStorage.getItem("devinspect-token");
    const response = await fetch(`${USER_PROFILE_URL}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete account');
    }
  };

  const switchMode = useCallback((mode) => {
    const normalized = normalizeMode(mode);
    setCurrentMode(normalized);
    localStorage.setItem("devinspect-mode", normalized);
  }, []);

  const updateProfileOnBackend = async (payload) => {
    const token = localStorage.getItem("devinspect-token");
    const res = await fetch(USER_PROFILE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Update failed');
    const merged = { ...currentUser, ...data };
    persistUser(merged);
    return data;
  };

  const updateUserPreferences = useCallback(async (prefs) => {
    localStorage.setItem('devinspect-preferences', JSON.stringify(prefs));
  }, []);

  const updateAvatarInContext = useCallback((avatarUrl) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const merged = { ...prev, avatar: avatarUrl };
      localStorage.setItem("devinspect-user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  const updateStreakInContext = useCallback((streakData) => {
    if (!streakData) return;
    setCurrentUser(prev => {
      if (!prev) return prev;
      const merged = { ...prev, ...streakData };
      localStorage.setItem("devinspect-user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  const contextValue = useMemo(() => ({
    currentUser,
    currentMode,
    isAuthenticated: !!currentUser,
    initialLoading,
    error,
    login,
    signup,
    logout,
    requestPasswordReset,
    switchMode,
    getAuthHeaders,
    deleteAccountOnBackend,
    updateProfileOnBackend,
    updateUserPreferences,
    updateAvatarInContext,
    updateStreakInContext,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [currentUser, currentMode, initialLoading, error]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);