import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Save, User, Sliders, Bell, Key, Shield, Users, Plus, Check, Settings, Code, GitBranch } from "lucide-react";
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

const SettingsPage = () => {
  const { currentUser, updateProfileOnBackend, updateUserPreferences } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ loading: true, ready: false });

  // Tab: Profile Settings
  const [profileName, setProfileName] = useState("");
  
  // Tab: Custom Rules
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState("");

  // Tab: API Keys (CI/CD)
  const [apiKey, setApiKey] = useState("");

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
      const resp = await fetch("http://localhost:5000/api/workspace", {
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
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfileOnBackend({
        name: profileName,
        customRules: rules,
        githubUser,
        githubToken
      });
      setTheme(prefs.themePreference);
      await updateUserPreferences(prefs);
      toast.success("Profile and app preferences saved!");
    } catch (e) {
      toast.error(e.message || "Failed to save profile.");
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

  // Rule management
  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setRules(prev => [...prev, newRule.trim()]);
    setNewRule("");
  };

  const handleRemoveRule = (index) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  // Workspace creation
  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    try {
      const token = localStorage.getItem("devinspect-token");
      const resp = await fetch("http://localhost:5000/api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
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

  // Workspace invite
  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !selectedWorkspaceId) return;
    try {
      const token = localStorage.getItem("devinspect-token");
      const resp = await fetch(`http://localhost:5000/api/workspace/${selectedWorkspaceId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
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
    { id: "profile", label: "Account Profile", icon: User },
    { id: "rules", label: "Custom Rules", icon: Code },
    { id: "workspaces", label: "Workspaces", icon: Users },
    { id: "api", label: "CI/CD & API Keys", icon: Key },
    { id: "preferences", label: "App Preferences", icon: Sliders },
  ];

  return (
    <>
      <Helmet>
        <title>Settings | DevInspect AI</title>
      </Helmet>
      <div className="w-full min-h-screen py-8 text-foreground bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold mb-2">Settings</h1>
            <p className="text-muted-foreground font-medium">
              Manage your credentials, custom AI guidelines, organizations, and preferences.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Navigation Tabs */}
            <div className="w-full md:w-64 shrink-0">
              <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${
                      activeTab === t.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <t.icon className="w-5 h-5" />
                    {t.label}
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
                      <p className="text-xs text-muted-foreground">Instruct the AI to enforce specific rules or style guides during review scans.</p>
                    </div>

                    <div className="flex gap-2 max-w-md">
                      <Input
                        value={newRule}
                        onChange={(e) => setNewRule(e.target.value)}
                        placeholder="e.g. Always suggest functional React components"
                        className="input-premium h-11 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                      />
                      <Button onClick={handleAddRule} className="btn-primary h-11 px-4"><Plus className="w-5 h-5" /></Button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Active Rules ({rules.length})</h3>
                      {rules.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No custom rules configured yet.</p>
                      ) : (
                        <div className="space-y-2 max-w-lg">
                          {rules.map((rule, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-muted/40 rounded-xl border border-border/20 text-sm">
                              <span>{rule}</span>
                              <button onClick={() => handleRemoveRule(idx)} className="text-destructive font-bold hover:scale-105 px-1.5 py-0.5 rounded">Delete</button>
                            </div>
                          ))}
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

                {/* Tab: Preferences */}
                {activeTab === "preferences" && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold">App Customization</h2>
                    <div className="space-y-4 max-w-md">
                      <div className="space-y-1">
                        <Label className="font-semibold">Default Language</Label>
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
                        <Label className="font-semibold">Theme Mode</Label>
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
                            <SelectItem value="light">Light Mode</SelectItem>
                            <SelectItem value="dark">Dark Mode</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border/20 mt-4">
                        <div>
                          <p className="font-bold text-sm">Enable In-App Summary Alerts</p>
                          <p className="text-[10px] text-muted-foreground">Receive weekly review notification emails.</p>
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
                  {loading ? "Saving Changes..." : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
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
