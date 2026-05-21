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
    const initAuth = async () => {
      try {
        const storedUser = loadStoredUser();
        const token = localStorage.getItem("devinspect-token");
        
        if (storedUser && token) {
          setCurrentUser(storedUser);
          
          // Sync profile from server
          try {
            const resp = await fetch(USER_PROFILE_URL, {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              }
            });
            if (resp.ok) {
              const freshUser = await resp.json();
              const mappedUser = {
                id: freshUser._id,
                email: freshUser.email,
                name: freshUser.name,
                role: freshUser.role || 'Developer',
                customRules: freshUser.customRules || [],
                apiKey: freshUser.apiKey || '',
                githubUser: freshUser.githubUser || '',
                currentMode: freshUser.currentMode || 'developer',
                created: freshUser.createdAt,
              };
              setCurrentUser(mappedUser);
              localStorage.setItem("devinspect-user", JSON.stringify(mappedUser));
              localStorage.setItem("devinspect-mode", mappedUser.currentMode);
            }
          } catch (e) {
            console.warn("Could not sync profile from server:", e.message);
          }
        }
        
        const savedMode = localStorage.getItem("devinspect-mode");
        if (savedMode) {
          setCurrentMode(normalizeMode(savedMode));
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    initAuth();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("devinspect-token");
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
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
      throw new Error(data.message || "Invalid credentials");
    }

    const mappedUser = {
      id: data._id,
      email: data.email || email,
      name: data.name || email.split("@")[0],
      role: data.role || 'Developer',
      customRules: data.customRules || [],
      apiKey: data.apiKey || '',
      githubUser: data.githubUser || '',
      currentMode: data.currentMode || 'developer',
      created: new Date().toISOString(),
    };

    persistSession(mappedUser, data.token);
    setCurrentUser(mappedUser);
    setCurrentMode(normalizeMode(mappedUser.currentMode));
    localStorage.setItem("devinspect-mode", mappedUser.currentMode);

    return mappedUser;
  };

  const signup = async (email, password, name) => {
    setError("");
    const registerResponse = await fetch(AUTH_REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const registerData = await registerResponse.json();
    if (!registerResponse.ok) {
      throw new Error(registerData.message || "Registration failed");
    }

    return login(email, password);
  };

  const loginWithGitSimulated = async (provider) => {
    setError("");
    const mockEmail = `${provider}_developer@example.com`;
    const mockName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} Dev`;
    const mockPassword = "git-oauth-simulated-secure-pass";

    try {
      return await login(mockEmail, mockPassword);
    } catch {
      try {
        await signup(mockEmail, mockPassword, mockName);
        return await login(mockEmail, mockPassword);
      } catch (err) {
        throw new Error(`Simulated Git OAuth failed: ${err.message}`);
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentMode(null);
    localStorage.removeItem("devinspect-token");
    localStorage.removeItem("devinspect-user");
    localStorage.removeItem("devinspect-mode");
  };

  const switchMode = async (mode) => {
    const normalized = normalizeMode(mode);
    
    // Update local state immediately
    setCurrentMode(normalized);
    localStorage.setItem("devinspect-mode", normalized);

    if (currentUser) {
      try {
        const token = localStorage.getItem("devinspect-token");
        const resp = await fetch(USER_PROFILE_URL, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ currentMode: normalized }),
        });

        if (resp.ok) {
          const freshUser = await resp.json();
          const updatedUser = {
            ...currentUser,
            currentMode: freshUser.currentMode || normalized,
          };
          setCurrentUser(updatedUser);
          localStorage.setItem("devinspect-user", JSON.stringify(updatedUser));
        }
      } catch (e) {
        console.warn("Could not persist mode to backend:", e.message);
      }
    }

    return normalized;
  };

  const updateProfileOnBackend = async (updates) => {
    const token = localStorage.getItem("devinspect-token");
    const resp = await fetch(USER_PROFILE_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ message: "Failed to update profile" }));
      throw new Error(err.message || "Failed to update profile");
    }

    const freshUser = await resp.json();
    const mappedUser = {
      id: freshUser._id,
      email: freshUser.email,
      name: freshUser.name,
      role: freshUser.role || 'Developer',
      customRules: freshUser.customRules || [],
      apiKey: freshUser.apiKey || '',
      githubUser: freshUser.githubUser || '',
      currentMode: freshUser.currentMode || currentMode,
      created: freshUser.createdAt,
    };
    setCurrentUser(mappedUser);
    localStorage.setItem("devinspect-user", JSON.stringify(mappedUser));
    
    if (freshUser.currentMode) {
      setCurrentMode(normalizeMode(freshUser.currentMode));
      localStorage.setItem("devinspect-mode", freshUser.currentMode);
    }
    
    return mappedUser;
  };

  const deleteAccountOnBackend = async () => {
    const token = localStorage.getItem("devinspect-token");
    const resp = await fetch(USER_PROFILE_URL, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ message: "Failed to delete account" }));
      throw new Error(err.message || "Failed to delete account");
    }

    logout();
  };

  const updateUserPreferences = async (preferences) => {
    localStorage.setItem("devinspect-preferences", JSON.stringify(preferences));
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
        loginWithGitSimulated,
        logout,
        switchMode,
        updateProfileOnBackend,
        deleteAccountOnBackend,
        updateUserPreferences,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);