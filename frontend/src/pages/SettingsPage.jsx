import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Save, User, Sliders, Bell, Key, Shield, Users, Plus, Trash2, Edit2, Check, X, Settings, Code, GitBranch, ToggleLeft, ToggleRight, Globe, Terminal, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { checkAiHealth } from "@/lib/aiService";
import AvatarUpload from "@/components/AvatarUpload";
import { RULES_URL, API_ORIGIN, WORKSPACE_URL } from "@/lib/apiConfig";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/index.js";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { currentUser, updateProfileOnBackend, updateUserPreferences } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ loading: true, ready: false });
  const [appLanguage, setAppLanguage] = useState(localStorage.getItem('devinspect-lang') || 'en');

  // Tab: Profile Settings
  const [profileName, setProfileName] = useState("");
  // Tab: API Keys (CI/CD)
  const [apiKey, setApiKey] = useState("");
  
  // Tab: Custom Rules — rebuilt with server persistence
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [newRule, setNewRule] = useState("");
  const [newRuleCategory, setNewRuleCategory] = useState("general");
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const getToken = () => localStorage.getItem("devinspect-token");

  const fetchRules = async () => {
    try {
      const res = await fetch(RULES_URL, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) setRules(await res.json());
    } catch { /* silent */ }
  };

  useEffect(() => { fetchRules(); }, []);

  const [extensionToken, setExtensionToken] = useState('');
  const [extensionLoading, setExtensionLoading] = useState(false);

  // Load extension token
  useEffect(() => {
    const fetchExtToken = async () => {
      try {
        const res = await fetch(`${API_ORIGIN}/api/extension/token`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) { const d = await res.json(); setExtensionToken(d.token || ''); }
      } catch { /* silent */ }
    };
    fetchExtToken();
  }, []);

  const handleGenerateExtToken = async () => {
    setExtensionLoading(true);
    try {
      const res = await fetch(`${API_ORIGIN}/api/extension/token`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setExtensionToken(d.token);
      toast.success('Extension token generated!');
    } catch (e) { toast.error(e.message || 'Failed'); }
    finally { setExtensionLoading(false); }
  };

  const copyToken = () => {
    if (!extensionToken) return;
    navigator.clipboard.writeText(extensionToken);
    toast.success('Token copied to clipboard!');
  };

  // Tab: Workspaces & Teams
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  // Tab: Git integration (Simulated)
  const [githubUser, setGithubUser] = useState("");
  const [githubToken, setGithubToken] = useState("");

  // Load preferences
  const [prefs, setPrefs] = useState({
    defaultLanguage: "javascript",
    themePreference: theme,
    notificationsEnabled: true,
  });

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || "");
      setRules(currentUser.customRules || []);
      setApiKey(currentUser.apiKey || "");
      setGithubUser(currentUser.githubUser || "");
      setGithubToken(currentUser.githubToken || "");
    }
  }, [currentUser]);

  // Load workspaces
  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem("devinspect-token");
      if (!token) return;
      const resp = await fetch(WORKSPACE_URL, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setWorkspaces(data);
        if (data.length > 0 && !selectedWorkspaceId) {
          setSelectedWorkspaceId(data[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("devinspect-preferences");
    if (stored) {
      try {
        setPrefs((prev) => ({ ...prev, ...JSON.parse(stored) }));
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    setPrefs((prev) => ({ ...prev, themePreference: theme }));
  }, [theme]);

  useEffect(() => {
    let mounted = true;
    checkAiHealth()
      .then((data) => {
        if (mounted) {
          setApiStatus({
            loading: false,
            ready: Boolean(data.ready),
            geminiModels: data.providers?.gemini?.models || [],
            ...data,
          });
        }
      })
      .catch(() => {
        if (mounted) {
          setApiStatus({ loading: false, ready: false });
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Save changes handler
  const handleLanguageChange = (lang) => {
    setAppLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('devinspect-lang', lang);
    toast.success('Language updated!');
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfileOnBackend({
        name: profileName,
        githubUser,
        githubToken
      });
      setTheme(prefs.themePreference);
      await updateUserPreferences(prefs);
      toast.success(t('settings.saveSettings') + ' — saved!');
    } catch (e) {
      toast.error(e.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  // Generate CI/CD API Key
  const handleGenerateApiKey = async () => {
    setLoading(true);
    try {
      const updatedUser = await updateProfileOnBackend({ generateApiKey: true });
      setApiKey(updatedUser.apiKey);
      toast.success("Generated new CI/CD API key!");
    } catch (e) {
      toast.error(e.message || "Failed to generate API key");
    } finally {
      setLoading(false);
    }
  };

  // Rule management — server-backed
  const handleAddRule = async () => {
    if (!newRule.trim()) return;
    setRulesLoading(true);
    try {
      const res = await fetch(RULES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ text: newRule.trim(), category: newRuleCategory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRules(prev => [data, ...prev]);
      setNewRule("");
      toast.success("Rule added!");
    } catch (e) {
      toast.error(e.message || "Failed to add rule");
    } finally {
      setRulesLoading(false);
    }
  };

  const handleToggleRule = async (id) => {
    try {
      const res = await fetch(`${RULES_URL}/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRules(prev => prev.map(r => r._id === id ? data : r));
    } catch (e) {
      toast.error(e.message || "Failed to toggle rule");
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await fetch(`${RULES_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setRules(prev => prev.filter(r => r._id !== id));
      toast.success("Rule deleted");
    } catch { toast.error("Failed to delete rule"); }
  };

  const handleSaveEditRule = async (id) => {
    if (!editingText.trim()) return;
    try {
      const res = await fetch(`${RULES_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ text: editingText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRules(prev => prev.map(r => r._id === id ? data : r));
      setEditingRuleId(null);
      toast.success("Rule updated");
    } catch (e) {
      toast.error(e.message || "Failed to update rule");
    }
  };

  // Workspace creation
  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    try {
      const token = localStorage.getItem("devinspect-token");
      const resp = await fetch(WORKSPACE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: newWorkspaceName.trim() })
      });
      if (resp.ok) {
        toast.success("Workspace created successfully!");
        setNewWorkspaceName("");
        fetchWorkspaces();
      } else {
        const err = await resp.json();
        throw new Error(err.message);
      }
    } catch (e) {
      toast.error(e.message || "Failed to create workspace");
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !selectedWorkspaceId) return;
    try {
      const token = localStorage.getItem("devinspect-token");
      const resp = await fetch(`${WORKSPACE_URL}/${selectedWorkspaceId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail.trim(), role: 'Developer' })
      });
      if (resp.ok) {
        toast.success("Member invited successfully!");
        setInviteEmail("");
        fetchWorkspaces();
      } else {
        const err = await resp.json();
        throw new Error(err.message);
      }
    } catch (e) {
      toast.error(e.message || "Invitation failed");
    }
  };

  const tabs = [
    { id: "profile",     label: t('settings.profile'),     icon: User     },
    { id: "rules",       label: t('settings.rules'),       icon: Code     },
    { id: "workspaces", label: t('settings.workspaces'),  icon: Users    },
    { id: "api",         label: t('settings.api'),         icon: Key      },
    { id: "vscode",      label: 'VS Code',                 icon: Terminal },
    { id: "preferences", label: t('settings.preferences'), icon: Sliders  },
  ];

  return (
    <>
      <Helmet>
        <title>Settings | DevInspect AI</title>
      </Helmet>
      <div className="w-full min-h-screen py-8 text-foreground bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold mb-2">{t('settings.title')}</h1>
            <p className="text-muted-foreground font-medium">{t('settings.subtitle')}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Navigation Tabs */}
            <div className="w-full md:w-64 shrink-0">
              <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Config Panels */}
            <div className="flex-1 card-glass min-h-[500px] relative overflow-hidden p-6 pb-24 rounded-3xl border border-border/30">
              <AnimatePresence mode="wait">
                
                {/* Tab: Profile */}
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold">Profile Details</h2>

                    {/* Avatar Upload */}
                    <div className="space-y-2">
                      <Label className="font-semibold">Profile Avatar</Label>
                      <AvatarUpload />
                    </div>
                    
                    <div className="space-y-2 max-w-md">
                      <Label htmlFor="profile-name">Display Name</Label>
                      <Input
                        id="profile-name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="John Doe"
                        className="input-premium h-11"
                      />
                    </div>

                    <div className="space-y-2 max-w-md">
                      <Label>Account Email</Label>
                      <Input
                        disabled
                        value={currentUser?.email || ""}
                        className="input-premium h-11 bg-muted/30"
                      />
                    </div>

                    <div className="border-t border-border/30 pt-6 space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-gradient"><GitBranch className="w-5 h-5" /> GitHub Credentials</h3>
                      <p className="text-xs text-muted-foreground">Simulate GitHub OAuth integration by supplying mock tokens below:</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>GitHub Username</Label>
                          <Input
                            value={githubUser}
                            onChange={(e) => setGithubUser(e.target.value)}
                            placeholder="github_dev"
                            className="input-premium h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>GitHub Personal Access Token</Label>
                          <Input
                            type="password"
                            value={githubToken}
                            onChange={(e) => setGithubToken(e.target.value)}
                            placeholder="ghp_••••••••••••"
                            className="input-premium h-11"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Tab: Custom Rules */}
                {activeTab === "rules" && (
                  <motion.div
                    key="rules"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Custom Review Rules</h2>
                      <p className="text-xs text-muted-foreground">Rules are injected into every AI analysis. Toggle to enable/disable without deleting.</p>
                    </div>

                    {/* Add Rule */}
                    <div className="flex gap-2 max-w-xl flex-wrap">
                      <Input
                        value={newRule}
                        onChange={(e) => setNewRule(e.target.value)}
                        placeholder="e.g. Always use functional React components"
                        className="input-premium h-10 text-sm flex-1 min-w-[200px]"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                      />
                      <Select value={newRuleCategory} onValueChange={setNewRuleCategory}>
                        <SelectTrigger className="h-10 w-36 input-premium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="naming">Naming</SelectItem>
                          <SelectItem value="react">React</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddRule} disabled={rulesLoading} className="btn-primary h-10 px-4">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Rules List */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                        Rules ({rules.length}) · {rules.filter(r => r.enabled).length} active
                      </h3>
                      {rules.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No custom rules yet. Add one above.</p>
                      ) : (
                        <div className="space-y-2 max-w-xl">
                          {rules.map((rule) => {
                            const categoryColors = {
                              naming: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                              react: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                              security: 'bg-red-500/10 text-red-400 border-red-500/20',
                              performance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                              general: 'bg-muted/50 text-muted-foreground border-border/30',
                            };
                            return (
                              <div key={rule._id} className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-opacity ${rule.enabled ? '' : 'opacity-50'} bg-muted/30 border-border/20`}>
                                {/* Toggle */}
                                <button onClick={() => handleToggleRule(rule._id)} className="shrink-0" title={rule.enabled ? 'Disable' : 'Enable'}>
                                  {rule.enabled
                                    ? <ToggleRight className="w-5 h-5 text-primary" />
                                    : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                                </button>

                                {/* Text / Edit */}
                                {editingRuleId === rule._id ? (
                                  <Input
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="h-8 text-xs flex-1 input-premium"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEditRule(rule._id)}
                                    autoFocus
                                  />
                                ) : (
                                  <span className="flex-1 text-xs leading-relaxed">{rule.text}</span>
                                )}

                                {/* Category badge */}
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${categoryColors[rule.category] || categoryColors.general}`}>
                                  {rule.category}
                                </span>

                                {/* Actions */}
                                {editingRuleId === rule._id ? (
                                  <div className="flex gap-1 shrink-0">
                                    <button onClick={() => handleSaveEditRule(rule._id)} className="text-green-500 hover:scale-110"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingRuleId(null)} className="text-muted-foreground hover:scale-110"><X className="w-4 h-4" /></button>
                                  </div>
                                ) : (
                                  <div className="flex gap-1 shrink-0">
                                    <button onClick={() => { setEditingRuleId(rule._id); setEditingText(rule.text); }} className="text-muted-foreground hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDeleteRule(rule._id)} className="text-destructive hover:scale-110"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Tab: Workspaces */}
                {activeTab === "workspaces" && (
                  <motion.div
                    key="workspaces"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Team Workspaces</h2>
                      <p className="text-xs text-muted-foreground">Create shared code reviewing workspaces and invite developers.</p>
                    </div>

                    <div className="border-t border-border/30 pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Create Workspace */}
                      <div className="space-y-4">
                        <h3 className="font-bold text-sm text-gradient">Create New Workspace</h3>
                        <div className="space-y-2">
                          <Input
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            placeholder="Workspace/Team Name"
                            className="input-premium h-11"
                          />
                          <Button onClick={handleCreateWorkspace} className="btn-primary w-full h-11 font-bold">Create Workspace</Button>
                        </div>
                      </div>

                      {/* Invite members */}
                      <div className="space-y-4 border-l border-border/30 pl-0 md:pl-8">
                        <h3 className="font-bold text-sm text-gradient">Invite Developer</h3>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label>Select Target Workspace</Label>
                            <Select value={selectedWorkspaceId} onValueChange={setSelectedWorkspaceId}>
                              <SelectTrigger className="h-11 input-premium">
                                <SelectValue placeholder="Select Workspace" />
                              </SelectTrigger>
                              <SelectContent>
                                {workspaces.map(w => (
                                  <SelectItem key={w._id} value={w._id}>{w.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-1">
                            <Label>Developer Email</Label>
                            <Input
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="developer@example.com"
                              className="input-premium h-11"
                            />
                          </div>

                          <Button onClick={handleInviteMember} className="btn-secondary w-full h-11 font-bold">Send Workspace Invite</Button>
                        </div>
                      </div>
                    </div>

                    {/* Active Workspaces List */}
                    <div className="border-t border-border/30 pt-6">
                      <h3 className="font-bold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Active Workspaces ({workspaces.length})</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {workspaces.map(w => (
                          <div key={w._id} className="p-4 bg-muted/40 rounded-xl border border-border/20">
                            <div className="font-bold text-sm mb-1 text-primary">{w.name}</div>
                            <div className="text-xs text-muted-foreground mb-2">Owner: {w.owner?.email}</div>
                            <div className="text-[10px] bg-background px-2.5 py-1 rounded-md inline-block font-semibold">Members: {w.members?.length || 1}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Tab: API Status & Keys */}
                {activeTab === "api" && (
                  <motion.div
                    key="api"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold mb-1">CI/CD API Integrations</h2>
                      <p className="text-xs text-muted-foreground">Trigger reviews from pipeline tasks (GitHub Actions, Jenkins, GitLab CI).</p>
                    </div>

                    <div className="p-4 rounded-xl border border-border/30 bg-muted/30 max-w-xl space-y-4">
                      <div className="space-y-2">
                        <Label className="font-bold">X-API-Key Configuration</Label>
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            type={apiKey ? "text" : "password"}
                            value={apiKey || "••••••••••••••••••••••••••••••••"}
                            className="input-premium font-mono text-xs h-11 bg-background"
                          />
                          <Button onClick={handleGenerateApiKey} className="btn-secondary font-bold text-xs h-11 min-w-[120px]">
                            {apiKey ? "Regenerate" : "Generate Key"}
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed bg-background/50 p-3 rounded-lg border border-border/20">
                        <p className="font-bold text-foreground">API Review Curl Trigger:</p>
                        <pre className="overflow-x-auto whitespace-pre p-2 bg-muted rounded font-mono text-[10px]">
                          {`curl -X POST http://localhost:5000/api/ci/review \\
  -H "X-API-Key: ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"code": "const x = 5;", "mode": "developer"}'`}
                        </pre>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-border/30 bg-muted/30 max-w-xl">
                      <p className="font-bold mb-2">Backend Connection Status</p>
                      {apiStatus.loading ? (
                        <p className="text-xs text-muted-foreground">Probing AI connection status...</p>
                      ) : (
                        <>
                          <p
                            className={`text-sm font-semibold ${
                              apiStatus.ready ? "text-green-600" : "text-amber-600"
                            }`}
                          >
                            {apiStatus.ready
                              ? "Online — backend connected and LLM providers functional"
                              : "Connected — but missing GEMINI_API_KEY / OPENAI_API_KEY environmental keys"}
                          </p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Tab: VS Code Extension */}
                {activeTab === "vscode" && (
                  <motion.div
                    key="vscode"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold mb-1">VS Code Extension</h2>
                      <p className="text-xs text-muted-foreground">Connect your VS Code editor to DevInspectAI for inline code reviews.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-border/30 bg-muted/30 max-w-xl space-y-4">
                      <Label className="font-bold">Extension Token</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={extensionToken || '••••••••••••••••••••••••••••••••'}
                          className="input-premium font-mono text-xs h-11 bg-background flex-1"
                        />
                        <Button onClick={copyToken} variant="outline" className="h-11 px-3 border-border/30" title="Copy token">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button onClick={handleGenerateExtToken} disabled={extensionLoading} className="btn-secondary h-11 text-xs font-bold min-w-[120px]">
                          {extensionToken ? 'Regenerate' : 'Generate'}
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-2 bg-background/50 p-3 rounded-lg border border-border/20">
                        <p className="font-bold text-foreground">Setup Instructions:</p>
                        <ol className="space-y-1 list-decimal list-inside">
                          <li>Install the DevInspectAI extension from VS Code Marketplace</li>
                          <li>Open VS Code Settings → search "DevInspectAI"</li>
                          <li>Paste your token in the <code className="bg-muted px-1 rounded">DEVINSPECT_TOKEN</code> field</li>
                          <li>Right-click any file → "DevInspectAI: Review Code"</li>
                        </ol>
                      </div>
                      <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded-lg border border-border/20">
                        <p className="font-bold text-foreground mb-1">Webhook Endpoint:</p>
                        <pre className="font-mono text-[10px] overflow-x-auto">{`POST ${API_ORIGIN}/api/extension/analyze
Headers: X-Extension-Token: <your-token>
Body: { "code": "...", "mode": "developer" }`}</pre>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Tab: Preferences */}
                {activeTab === "preferences" && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold">{t('settings.preferences')}</h2>
                    <div className="space-y-4 max-w-md">
                      {/* UI Language selector */}
                      <div className="space-y-1">
                        <Label className="font-semibold flex items-center gap-2"><Globe className="w-4 h-4" />{t('settings.language')}</Label>
                        <Select value={appLanguage} onValueChange={handleLanguageChange}>
                          <SelectTrigger className="h-11 input-premium">
                            <SelectValue placeholder={t('settings.selectLanguage')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">🇬🇧 English</SelectItem>
                            <SelectItem value="hi">🇮🇳 हिंदी (Hindi)</SelectItem>
                            <SelectItem value="te">🇮🇳 తెలుగు (Telugu)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="font-semibold">{t('settings.defaultLanguage')}</Label>
                        <Select
                          value={prefs.defaultLanguage}
                          onValueChange={(v) =>
                            setPrefs({ ...prefs, defaultLanguage: v })
                          }
                        >
                          <SelectTrigger className="h-11 input-premium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="font-semibold">{t('settings.theme')}</Label>
                        <Select
                          value={prefs.themePreference}
                          onValueChange={(v) =>
                            setPrefs({ ...prefs, themePreference: v })
                          }
                        >
                          <SelectTrigger className="h-11 input-premium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">{t('settings.lightMode')}</SelectItem>
                            <SelectItem value="dark">{t('settings.darkMode')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border/20 mt-4">
                        <div>
                          <p className="font-bold text-sm">{t('settings.notifications')}</p>
                          <p className="text-[10px] text-muted-foreground">{t('settings.notificationsDesc')}</p>
                        </div>
                        <Switch
                          checked={prefs.notificationsEnabled}
                          onCheckedChange={(v) =>
                            setPrefs({ ...prefs, notificationsEnabled: v })
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Sticky bottom save bar */}
              <div className="absolute bottom-0 left-0 w-full p-6 bg-background border-t border-border/30 flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="btn-primary min-w-[150px] rounded-xl font-bold h-11"
                >
                  {loading ? t('settings.saving') : <><Save className="w-4 h-4 mr-2" />{t('settings.saveSettings')}</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
