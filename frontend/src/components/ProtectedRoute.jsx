import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

// Fast-path: check localStorage directly so we never flash a redirect
// on page load when the token is already stored (e.g. after OAuth callback)
const hasStoredSession = () => {
  try {
    return !!(
      localStorage.getItem('devinspect-token') &&
      localStorage.getItem('devinspect-user')
    );
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialLoading, currentMode, switchMode } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!initialLoading && isAuthenticated && !currentMode) {
      switchMode('developer');
    }
  }, [initialLoading, isAuthenticated, currentMode, switchMode]);

  // While auth is initializing, only show spinner if there's NO stored session.
  // If a session exists in localStorage, render children immediately —
  // AuthContext will hydrate currentUser within the same tick.
  if (initialLoading && !hasStoredSession()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading DevInspect AI...</p>
      </div>
    );
  }

  // Not authenticated and no stored session → redirect to login
  if (!isAuthenticated && !hasStoredSession()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
