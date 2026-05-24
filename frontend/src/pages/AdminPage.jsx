import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Users, Activity, BarChart2, Trash2, Shield,
  RefreshCw, AlertTriangle, CheckCircle, Code2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { API_ORIGIN } from '@/lib/apiConfig';
import { Navigate } from 'react-router-dom';

const AdminPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab]   = useState('stats');
  const [stats, setStats]           = useState(null);
  const [users, setUsers]           = useState([]);
  const [analyses, setAnalyses]     = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(false);

  // Redirect non-admins — done via state check AFTER hooks
  const isAdmin = currentUser?.role === 'admin';

  const token = localStorage.getItem('devinspect-token');

  // Non-admin redirect after all hooks
  if (currentUser && !isAdmin) return <Navigate to="/" replace />;

  const apiFetch = async (path) => {
    const res = await fetch(`${API_ORIGIN}${path}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/dashboard-stats');
      setStats(data);
    } catch (e) {
      toast.error('Failed to load stats: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/users');
      setUsers(data);
    } catch (e) {
      toast.error('Failed to load users: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyses = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/analyses');
      setAnalyses(data);
    } catch (e) {
      toast.error('Failed to load analyses: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/activities');
      setActivities(data);
    } catch (e) {
      toast.error('Failed to load activities: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats')      loadStats();
    if (activeTab === 'users')      loadUsers();
    if (activeTab === 'analyses')   loadAnalyses();
    if (activeTab === 'activities') loadActivities();
  }, [activeTab]);

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Delete user ${userEmail}? This will also delete all their analyses.`)) return;
    try {
      const res = await fetch(`${API_ORIGIN}/api/admin/user/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success(`User ${userEmail} deleted`);
    } catch (e) {
      toast.error('Delete failed: ' + e.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/admin/user/${userId}/role`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (e) {
      toast.error('Role update failed: ' + e.message);
    }
  };

  const tabs = [
    { id: 'stats',      label: 'Dashboard Stats', icon: BarChart2 },
    { id: 'users',      label: 'All Users',        icon: Users     },
    { id: 'analyses',   label: 'All Analyses',     icon: Code2     },
    { id: 'activities', label: 'Activity Log',     icon: Activity  },
  ];

  return (
    <>
      <Helmet><title>Admin Panel | DevInspectAI</title></Helmet>

      <div className="w-full min-h-screen py-8 text-foreground bg-background">
        <div className="container mx-auto px-4 lg:px-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-destructive/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gradient">Admin Panel</h1>
              <p className="text-muted-foreground text-sm">System-wide visibility and control</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary/20 text-primary border-primary/30'
                      : 'bg-muted/30 text-muted-foreground border-border/30 hover:border-primary/30'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
            <button
              onClick={() => {
                if (activeTab === 'stats')      loadStats();
                if (activeTab === 'users')      loadUsers();
                if (activeTab === 'analyses')   loadAnalyses();
                if (activeTab === 'activities') loadActivities();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-border/30 bg-muted/30 text-muted-foreground hover:text-foreground ml-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {/* ── STATS TAB ── */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {loading ? (
                <p className="text-muted-foreground animate-pulse">Loading stats...</p>
              ) : stats ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Users',    value: stats.totalUsers,    color: 'text-blue-500'   },
                      { label: 'Total Analyses', value: stats.totalAnalyses, color: 'text-green-500'  },
                      { label: 'Active Users',   value: stats.activeUsers,   color: 'text-amber-500'  },
                      { label: 'New This Week',  value: stats.newUsers,      color: 'text-purple-500' },
                    ].map(s => (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-glass p-6 rounded-2xl border border-border/30"
                      >
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                        <p className={`text-3xl font-black ${s.color}`}>{s.value ?? 0}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mode breakdown */}
                    <div className="card-glass p-6 rounded-2xl border border-border/30">
                      <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Mode Usage</h3>
                      <div className="space-y-2">
                        {(stats.modeStats || []).map(m => (
                          <div key={m._id} className="flex justify-between items-center text-sm">
                            <span className="capitalize font-semibold">{m._id}</span>
                            <span className="font-black text-primary">{m.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent activity */}
                    <div className="card-glass p-6 rounded-2xl border border-border/30">
                      <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Recent Analyses</h3>
                      <div className="space-y-2">
                        {(stats.recentActivity || []).slice(0, 6).map(a => (
                          <div key={a._id} className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground truncate max-w-[60%]">{a.userName} · {a.mode}</span>
                            <span className="text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No stats available.</p>
              )}
            </div>
          )}

          {/* ── USERS TAB ── */}
          {activeTab === 'users' && (
            <div className="card-glass rounded-2xl border border-border/30 overflow-hidden">
              {loading ? (
                <p className="p-6 text-muted-foreground animate-pulse">Loading users...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/30">
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Mode</th>
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Login</th>
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Joined</th>
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                          <td className="p-4">
                            <p className="font-semibold">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </td>
                          <td className="p-4">
                            <select
                              value={u.role}
                              onChange={e => handleRoleChange(u._id, e.target.value)}
                              disabled={u._id === currentUser?.id}
                              className={`text-xs font-bold px-2 py-1 rounded-lg border bg-background ${
                                u.role === 'admin'
                                  ? 'text-destructive border-destructive/30'
                                  : 'text-primary border-primary/30'
                              }`}
                            >
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <span className="text-xs capitalize text-muted-foreground">{u.currentMode}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-muted-foreground">
                              {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-muted-foreground">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleDeleteUser(u._id, u.email)}
                              disabled={u._id === currentUser?.id}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-30"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <p className="p-6 text-center text-muted-foreground">No users found.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── ANALYSES TAB ── */}
          {activeTab === 'analyses' && (
            <div className="card-glass rounded-2xl border border-border/30 overflow-hidden">
              {loading ? (
                <p className="p-6 text-muted-foreground animate-pulse">Loading analyses...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/30">
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Mode</th>
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Language</th>
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Issues</th>
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyses.map(a => (
                        <tr key={a._id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                          <td className="p-4">
                            <p className="font-semibold">{a.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{a.user?.email || ''}</p>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold capitalize bg-primary/10 text-primary px-2 py-0.5 rounded-md">{a.mode}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs capitalize text-muted-foreground">{a.language}</span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-bold ${
                              (a.result?.errors?.length || 0) > 0 ? 'text-destructive' : 'text-green-500'
                            }`}>
                              {a.result?.errors?.length || 0} issues
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-muted-foreground">
                              {new Date(a.createdAt).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {analyses.length === 0 && (
                    <p className="p-6 text-center text-muted-foreground">No analyses found.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVITIES TAB ── */}
          {activeTab === 'activities' && (
            <div className="card-glass rounded-2xl border border-border/30 overflow-hidden">
              {loading ? (
                <p className="p-6 text-muted-foreground animate-pulse">Loading activity log...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/30">
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Detail</th>
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">IP</th>
                        <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((a, i) => (
                        <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                          <td className="p-4">
                            <p className="font-semibold">{a.userName}</p>
                            <p className="text-xs text-muted-foreground">{a.userEmail}</p>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                              a.action === 'login'    ? 'bg-green-500/10 text-green-500'    :
                              a.action === 'register' ? 'bg-blue-500/10 text-blue-500'      :
                                                        'bg-muted text-muted-foreground'
                            }`}>{a.action}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-muted-foreground">{a.detail || '—'}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-muted-foreground font-mono">{a.ip || '—'}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-muted-foreground">
                              {new Date(a.createdAt).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {activities.length === 0 && (
                    <p className="p-6 text-center text-muted-foreground">No activity logs found.</p>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default AdminPage;
