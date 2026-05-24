import React, { useState, useCallback, memo, lazy, Suspense } from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { ThemeProvider } from '@/contexts/ThemeContext.jsx';
import { MascotProvider } from '@/contexts/MascotContext.jsx';
import { Toaster } from '@/components/ui/sonner';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import ErrorBoundary from '@/components/ErrorBoundary.jsx';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';

// ── Lazy-loaded pages (code-split per route) ──────────────────────
const LoginPage        = lazy(() => import('@/pages/LoginPage.jsx'));
const SignupPage       = lazy(() => import('@/pages/SignupPage.jsx'));
const HomePage         = lazy(() => import('@/pages/HomePage.jsx'));
const ModeSelectionPage= lazy(() => import('@/pages/ModeSelectionPage.jsx'));
const AnalyzerPage     = lazy(() => import('@/pages/AnalyzerPage.jsx'));
const DashboardPage    = lazy(() => import('@/pages/DashboardPage.jsx'));
const HistoryPage      = lazy(() => import('@/pages/HistoryPage.jsx'));
const SwitchModePage   = lazy(() => import('@/pages/SwitchModePage.jsx'));
const SettingsPage     = lazy(() => import('@/pages/SettingsPage.jsx'));
const ProfilePage      = lazy(() => import('@/pages/ProfilePage.jsx'));
const AdminPage        = lazy(() => import('@/pages/AdminPage.jsx'));
const OAuthCallbackPage= lazy(() => import('@/pages/OAuthCallbackPage.jsx'));
const SharedAnalysisPage=lazy(() => import('@/pages/SharedAnalysisPage.jsx'));
const InterviewPage    = lazy(() => import('@/pages/InterviewPage.jsx'));
const LeaderboardPage  = lazy(() => import('@/pages/LeaderboardPage.jsx'));
const WelcomePage      = lazy(() => import('@/pages/WelcomePage.jsx'));
const PasswordResetPage= lazy(() => import('@/pages/PasswordResetPage.jsx'));

// ── Minimal page-level loading fallback ──────────────────────────
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── ScrollToTop ───────────────────────────────────────────────────
const ScrollToTop = memo(() => {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
});

// ── Per-route error boundary ──────────────────────────────────────
const PageErrorFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl">⚠️</span>
    </div>
    <h2 className="text-xl font-bold mb-2">Page failed to load</h2>
    <p className="text-muted-foreground text-sm mb-4">Something went wrong rendering this page.</p>
    <button onClick={() => window.location.reload()} className="btn-primary px-6 py-2 rounded-xl text-sm font-bold">
      Reload Page
    </button>
  </div>
);

class PageErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error('Page render error:', err); }
  render() {
    if (this.state.hasError) return <PageErrorFallback />;
    return this.props.children;
  }
}

// ── Memoized layout — prevents re-mount on every navigation ──────
const AppLayout = memo(({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setIsSidebarOpen(v => !v), []);
  const closeSidebar  = useCallback(() => setIsSidebarOpen(false), []);
  return (
    <div className="flex flex-col min-h-screen bg-animated">
      <Header onMenuToggle={toggleSidebar} isMobileMenuOpen={isSidebarOpen} />
      <div className="flex flex-1 relative">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main className="flex-1 lg:pl-72 overflow-x-hidden transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
});

// ── Reduced animation duration for snappier feel ─────────────────
const AnimatedRoute = memo(({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
    className="w-full min-h-full"
  >
    {children}
  </motion.div>
));

// ── Wrap a lazy page with error boundary + suspense ───────────────
const Page = ({ component: Component }) => (
  <PageErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <AnimatedRoute>
        <Component />
      </AnimatedRoute>
    </Suspense>
  </PageErrorBoundary>
);

// ── Protected page shorthand ──────────────────────────────────────
const ProtectedPage = ({ component }) => (
  <ProtectedRoute>
    <AppLayout>
      <Page component={component} />
    </AppLayout>
  </ProtectedRoute>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/login"          element={<Page component={LoginPage} />} />
        <Route path="/signup"         element={<Page component={SignupPage} />} />
        <Route path="/password-reset" element={<Page component={PasswordResetPage} />} />
        <Route path="/oauth-callback" element={<Suspense fallback={<PageLoader />}><OAuthCallbackPage /></Suspense>} />
        <Route path="/shared/:token"  element={<Suspense fallback={<PageLoader />}><SharedAnalysisPage /></Suspense>} />

        {/* Protected */}
        <Route path="/welcome"      element={<ProtectedPage component={WelcomePage} />} />
        <Route path="/"             element={<ProtectedPage component={HomePage} />} />
        <Route path="/mode-selection" element={<ProtectedPage component={ModeSelectionPage} />} />
        <Route path="/analyzer"     element={<ProtectedPage component={AnalyzerPage} />} />
        <Route path="/dashboard"    element={<ProtectedPage component={DashboardPage} />} />
        <Route path="/history"      element={<ProtectedPage component={HistoryPage} />} />
        <Route path="/switch-mode"  element={<ProtectedPage component={SwitchModePage} />} />
        <Route path="/settings"     element={<ProtectedPage component={SettingsPage} />} />
        <Route path="/profile"      element={<ProtectedPage component={ProfilePage} />} />
        <Route path="/admin"        element={<ProtectedPage component={AdminPage} />} />
        <Route path="/interview"    element={<ProtectedPage component={InterviewPage} />} />
        <Route path="/leaderboard"  element={<ProtectedPage component={LeaderboardPage} />} />

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card-glass max-w-md p-8">
              <h1 className="text-4xl font-bold mb-4 text-gradient">404</h1>
              <p className="text-muted-foreground mb-6">Page not found</p>
              <a href="/" className="btn-primary inline-block">Return Home</a>
            </motion.div>
          </div>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <MascotProvider>
            <Router>
              <ScrollToTop />
              <AnimatedRoutes />
              <Toaster position="top-right" richColors />
            </Router>
          </MascotProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
