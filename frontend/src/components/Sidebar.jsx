import React, { useState, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Code2, History, Settings, User, Zap,
  LogOut, Shield, Swords, Gamepad2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/AvatarUpload';
import WaitingGameModal from '@/components/WaitingGameModal';

// ── Gradient/color helpers ────────────────────────────────────────────────────
const ACTIVE_GRADIENTS = {
  'baby-pink':   'from-baby-pink/20 to-baby-pink/5',
  'lavender':    'from-lavender/20 to-lavender/5',
  'pastel-blue': 'from-pastel-blue/20 to-pastel-blue/5',
  'soft-peach':  'from-soft-peach/20 to-soft-peach/5',
  'light-rose':  'from-light-rose/20 to-light-rose/5',
  'blush-pink':  'from-blush-pink/20 to-blush-pink/5',
};
const ACTIVE_TEXT = {
  'baby-pink':   'text-baby-pink',
  'lavender':    'text-lavender',
  'pastel-blue': 'text-pastel-blue',
  'soft-peach':  'text-soft-peach',
  'light-rose':  'text-light-rose',
  'blush-pink':  'text-blush-pink',
};

// ── NavItem extracted outside Sidebar to prevent remount on every render ──────
const NavItem = ({ item, index, active, onLinkClick, layoutId = 'activeIndicator' }) => {
  const Icon = item.icon;
  const gradient = ACTIVE_GRADIENTS[item.color] || 'from-primary/20 to-primary/5';
  const textColor = ACTIVE_TEXT[item.color] || 'text-primary';
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={item.path}
        onClick={onLinkClick}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden',
          active
            ? `bg-gradient-to-r ${gradient} ${textColor} font-semibold shadow-lg`
            : 'text-sidebar-foreground hover:bg-muted/50 font-medium'
        )}
      >
        <Icon className={cn('h-5 w-5 transition-colors', active ? '' : 'text-muted-foreground group-hover:text-foreground')} />
        <span>{item.label}</span>
        {active && (
          <motion.div
            layoutId={layoutId}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full"
            style={{ background: `hsl(var(--${item.color}))` }}
          />
        )}
      </Link>
    </motion.div>
  );
};

// ── Game list ─────────────────────────────────────────────────────────────────
const GAME_LIST = [
  { id: 'snake',     label: '🐍 Snake',          desc: 'Classic arcade' },
  { id: 'tictactoe', label: '⭕ Tic Tac Toe',    desc: 'vs AI'          },
  { id: 'memory',    label: '🃏 Memory Match',    desc: 'Card pairs'     },
  { id: 'typing',    label: '⌨️ Typing Speed',   desc: 'Test your WPM'  },
  { id: 'debug',     label: '🐛 Debug Challenge', desc: 'Find the bug'   },
];

// ── Static nav items (defined outside to avoid recreation) ──────────────────
const NAV_ITEMS = [
  { path: '/dashboard',   label: 'Dashboard',     icon: LayoutDashboard, color: 'baby-pink'   },
  { path: '/analyzer',    label: 'Analyzer',       icon: Code2,           color: 'lavender'    },
  { path: '/history',     label: 'History',        icon: History,         color: 'pastel-blue' },
  { path: '/interview',   label: 'Interview',      icon: Swords,          color: 'soft-peach'  },
  { path: '/switch-mode', label: 'Mode Selection', icon: Zap,             color: 'light-rose'  },
];
const BOTTOM_ITEMS = [
  { path: '/settings', label: 'Settings', icon: Settings, color: 'light-rose' },
  { path: '/profile',  label: 'Profile',  icon: User,     color: 'blush-pink' },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { currentMode, currentUser, logout } = useAuth();
  const [gamesOpen, setGamesOpen]        = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState('snake');

  const isActive = useCallback((path) => location.pathname.startsWith(path), [location.pathname]);

  const handleLinkClick = useCallback(() => {
    if (window.innerWidth < 1024) onClose();
  }, [onClose]);

  const getModeIcon = useCallback(() => {
    if (currentMode === 'student')     return <span className="w-2 h-2 rounded-full bg-baby-pink animate-pulse" />;
    if (currentMode === 'interviewer') return <span className="w-2 h-2 rounded-full bg-lavender animate-pulse" />;
    if (currentMode === 'developer')   return <span className="w-2 h-2 rounded-full bg-pastel-blue animate-pulse" />;
    return null;
  }, [currentMode]);

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-72 bg-sidebar-background/80 backdrop-blur-xl border-r border-border/30 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col overflow-hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {currentMode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glow bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3 mb-6"
              >
                <UserAvatar user={currentUser} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Mode</p>
                  <p className="text-sm font-bold capitalize truncate">{currentMode}</p>
                </div>
                {getModeIcon()}
              </motion.div>
            )}

            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">Main Menu</p>
            <nav className="space-y-2">
              {NAV_ITEMS.map((item, index) => (
                <NavItem
                  key={item.path}
                  item={item}
                  index={index}
                  active={isActive(item.path)}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </nav>

            {/* Games Section */}
            <div className="mt-6">
              <button
                onClick={() => setGamesOpen(v => !v)}
                className="w-full flex items-center justify-between px-2 py-2 rounded-xl hover:bg-muted/40 transition-colors"
              >
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Gamepad2 className="w-3.5 h-3.5" /> Games
                </p>
                {gamesOpen
                  ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {gamesOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-1">
                      {GAME_LIST.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => {
                            setSelectedGameId(g.id);
                            setShowGameModal(true);
                            handleLinkClick();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sidebar-foreground hover:bg-muted/50 font-medium transition-all duration-200 text-left"
                        >
                          <span className="text-base leading-none">{g.label.split(' ')[0]}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{g.label.split(' ').slice(1).join(' ')}</p>
                            <p className="text-[10px] text-muted-foreground">{g.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom account section */}
        <div className="flex-shrink-0 p-6 border-t border-border/30">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">Account</p>
          <nav className="space-y-2 mb-4">
            {BOTTOM_ITEMS.map((item, index) => (
              <NavItem
                key={item.path}
                item={item}
                index={index}
                active={isActive(item.path)}
                onLinkClick={handleLinkClick}
                layoutId="activeIndicatorBottom"
              />
            ))}

            {currentUser?.role === 'admin' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Link
                  to="/admin"
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden',
                    isActive('/admin')
                      ? 'bg-destructive/10 text-destructive font-semibold shadow-lg'
                      : 'text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive font-medium'
                  )}
                >
                  <Shield className="h-5 w-5" />
                  <span>Admin Panel</span>
                </Link>
              </motion.div>
            )}
          </nav>

          <Button
            variant="ghost"
            onClick={() => { logout(); handleLinkClick(); }}
            className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 font-medium transition-all duration-300"
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </Button>
        </div>
      </aside>

      {/* Games Modal — outside sidebar so it overlays full screen */}
      <WaitingGameModal
        loading={showGameModal}
        initialGame={selectedGameId}
        onClose={() => setShowGameModal(false)}
        onXpEarned={() => {}}
      />
    </>
  );
};

export default memo(Sidebar);
