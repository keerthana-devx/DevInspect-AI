import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Trophy, AlertTriangle, Lightbulb, Info, CheckCircle, Star } from 'lucide-react';
import { API_ORIGIN } from '@/lib/apiConfig';
import { useMascotContext } from '@/contexts/MascotContext.jsx';

const useSafeMascot = () => {
  try { return useMascotContext(); }
  catch { return { triggerMascot: () => {} }; }
};

const TYPE_CONFIG = {
  achievement: { icon: Trophy,       color: 'text-amber-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  badge:       { icon: Star,         color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  success:     { icon: CheckCircle,  color: 'text-green-500',  bg: 'bg-green-500/10',  border: 'border-green-500/20'  },
  warning:     { icon: AlertTriangle,color: 'text-amber-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  tip:         { icon: Lightbulb,    color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
  info:        { icon: Info,         color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20'    },
};

const formatTime = (ts) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const NotificationBell = () => {
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds]         = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('devinspect-read-notifs') || '[]')); }
    catch { return new Set(); }
  });
  const [loading, setLoading]         = useState(false);
  const ref = useRef(null);
  const { triggerMascot } = useSafeMascot();

  const unread = notifications.filter(n => !readIds.has(n.id)).length;

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('devinspect-token');
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_ORIGIN}/api/engagement/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(allIds);
    localStorage.setItem('devinspect-read-notifs', JSON.stringify([...allIds]));
  };

  const dismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const next = new Set([...readIds, id]);
    setReadIds(next);
    localStorage.setItem('devinspect-read-notifs', JSON.stringify([...next]));
  };

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open) {
      const allIds = new Set(notifications.map(n => n.id));
      setReadIds(allIds);
      localStorage.setItem('devinspect-read-notifs', JSON.stringify([...allIds]));

      // Fire a welcome-back mascot when user opens notifications
      const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;
      if (unreadCount > 0) {
        const first = notifications.find(n => !readIds.has(n.id));
        const mascotMap = {
          achievement: 'level_up',
          badge:       'badge_earned',
          success:     'clean_code',
          warning:     'bug_found',
          tip:         'analyzing',
          info:        'welcome_back',
        };
        if (first) triggerMascot(mascotMap[first.type] || 'welcome_back', first.title, 4000);
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative h-10 w-10 flex items-center justify-center rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
        title="Notifications"
      >
        <motion.div
          animate={unread > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
          transition={{ duration: 0.6, repeat: unread > 0 ? Infinity : 0, repeatDelay: 4 }}
        >
          <Bell className="h-5 w-5" />
        </motion.div>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-lg"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 w-80 sm:w-96 card-glass rounded-2xl border border-border/40 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm">Notifications</span>
                {notifications.length > 0 && (
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                    {notifications.length}
                  </span>
                )}
              </div>
              <button
                onClick={markAllRead}
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Mark all read
              </button>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"
                  />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Run your first analysis to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-border/20">
                  {notifications.map((n) => {
                    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                    const Icon = cfg.icon;
                    const isUnread = !readIds.has(n.id);
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`flex gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group relative ${isUnread ? 'bg-primary/3' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0 mt-0.5`}>
                          <span className="text-sm">{n.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-bold leading-tight ${isUnread ? 'text-foreground' : 'text-foreground/80'}`}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground/60 shrink-0">{formatTime(n.time)}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{n.message}</p>
                        </div>
                        <button
                          onClick={() => dismiss(n.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-muted-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {isUnread && (
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-border/30 text-center">
                <button
                  onClick={fetchNotifications}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  ↺ Refresh
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
