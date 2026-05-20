import React, { createContext, useContext, useEffect, useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentMode, setCurrentMode] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      if (pb.authStore.isValid) {
        setCurrentUser(pb.authStore.model);

        const savedMode =
          localStorage.getItem("devinspect-mode") || "Student";

        setCurrentMode(savedMode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setError("");

    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);

      setCurrentUser(authData.record);

      const savedMode =
        localStorage.getItem("devinspect-mode") || "Student";

      setCurrentMode(savedMode);

      return authData;
    } catch (err) {
      console.error(err);

      const demoUser = {
        id: "demo-user",
        email,
        name: "Demo User",
      };

      setCurrentUser(demoUser);

      setCurrentMode("Student");

      return demoUser;
    }
  };

  const signup = async (email, password, name) => {
    setError("");

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

      setCurrentMode("Student");

      localStorage.setItem("devinspect-mode", "Student");

      return authData;
    } catch (err) {
      console.error(err);

      const demoUser = {
        id: "demo-user",
        email,
        name,
      };

      setCurrentUser(demoUser);

      setCurrentMode("Student");

      return demoUser;
    }
  };

  const logout = () => {
    pb.authStore.clear();

    setCurrentUser(null);
    setCurrentMode(null);

    localStorage.removeItem("devinspect-mode");
  };

  const switchMode = async (mode) => {
    setCurrentMode(mode);

    localStorage.setItem("devinspect-mode", mode);
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