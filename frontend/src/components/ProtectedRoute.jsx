import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const {
    isAuthenticated,
    initialLoading,
    currentMode,
  } = useAuth();

  const location = useLocation();

  if (initialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />

        <p className="text-muted-foreground">
          Loading DevInspect AI...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (!currentMode) {
    localStorage.setItem("devinspect-mode", "Student");
  }

  return children;
};

export default ProtectedRoute;