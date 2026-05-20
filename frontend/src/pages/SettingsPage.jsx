import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { Save, User, Sliders, Bell, Key, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  const { currentUser, updateUserPreferences } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("preferences");
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ loading: true, ready: false });
  const [prefs, setPrefs] = useState({
    defaultLanguage: "javascript",
    themePreference: theme,
    notificationsEnabled: true,
  });

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

  const handleSave = async () => {
    setLoading(true);
    try {
      setTheme(prefs.themePreference);
      await updateUserPreferences(prefs);
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "preferences", label: "App Preferences", icon: Sliders },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "api", label: "API Status", icon: Key },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <>
      <Helmet>
        <title>Settings | DevInspect AI</title>
      </Helmet>
      <div className="w-full min-h-screen py-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and application preferences.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Signed in as <strong>{currentUser?.name || currentUser?.email}</strong>
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
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

            <div className="flex-1 card-elevated min-h-[500px] relative overflow-hidden p-6 pb-24">
              <AnimatePresence mode="wait">
                {activeTab === "preferences" && (
                  <motion.div
                    key="pref"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold mb-6">Application Preferences</h2>
                    <div className="space-y-2 max-w-md">
                      <Label className="font-semibold">Default Language</Label>
                      <Select
                        value={prefs.defaultLanguage}
                        onValueChange={(v) =>
                          setPrefs({ ...prefs, defaultLanguage: v })
                        }
                      >
                        <SelectTrigger className="h-12 bg-background border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 max-w-md">
                      <Label className="font-semibold">Theme Mode</Label>
                      <Select
                        value={prefs.themePreference}
                        onValueChange={(v) =>
                          setPrefs({ ...prefs, themePreference: v })
                        }
                      >
                        <SelectTrigger className="h-12 bg-background border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light Mode</SelectItem>
                          <SelectItem value="dark">Dark Mode</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}

                {activeTab === "notifications" && (
                  <motion.div
                    key="notif"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50">
                      <div>
                        <p className="font-bold">Email Summaries</p>
                        <p className="text-sm text-muted-foreground">
                          Receive weekly review analytics.
                        </p>
                      </div>
                      <Switch
                        checked={prefs.notificationsEnabled}
                        onCheckedChange={(v) =>
                          setPrefs({ ...prefs, notificationsEnabled: v })
                        }
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === "api" && (
                  <motion.div
                    key="api"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold mb-2">API Status</h2>
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/30">
                      <p className="font-semibold mb-2">Backend connection</p>
                      {apiStatus.loading ? (
                        <p className="text-muted-foreground">Checking...</p>
                      ) : (
                        <>
                          <p
                            className={
                              apiStatus.ready ? "text-green-600" : "text-amber-600"
                            }
                          >
                            {apiStatus.ready
                              ? "Backend connected — API keys configured"
                              : "Backend reachable — add GEMINI_API_KEY or OPENAI_API_KEY"}
                          </p>
                          {apiStatus.geminiModels?.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Gemini models: {apiStatus.geminiModels.join(", ")}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Account: {currentUser?.email}
                    </p>
                  </motion.div>
                )}

                {activeTab === "profile" && (
                  <motion.div
                    key="prof"
                    className="text-center text-muted-foreground pt-12"
                  >
                    <User className="w-12 h-12 mb-4 opacity-50 mx-auto" />
                    <p>Profile editing is managed from the Profile page.</p>
                  </motion.div>
                )}

                {activeTab === "security" && (
                  <motion.div
                    key="sec"
                    className="text-center text-muted-foreground pt-12"
                  >
                    <Shield className="w-12 h-12 mb-4 opacity-50 mx-auto" />
                    <p>Security settings coming soon.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute bottom-0 left-0 w-full p-6 bg-card border-t border-border/50 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary min-w-[150px]"
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </>
                  )}
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
