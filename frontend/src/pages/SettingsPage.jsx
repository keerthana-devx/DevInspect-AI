import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Sliders, Bell, Key, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const SettingsPage = () => {
  const { currentUser, updateUserPreferences } = useAuth();
  const [activeTab, setActiveTab] = useState('preferences');
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    defaultLanguage: 'javascript',
    themePreference: 'light',
    notificationsEnabled: true,
    apiKey: ''
  });

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const records = await pb.collection('user_preferences').getFullList({
          filter: `userId = "${currentUser.id}"`,
          $autoCancel: false
        });
        if (records.length > 0) {
          setPrefs({
            defaultLanguage: records[0].defaultLanguage || 'javascript',
            themePreference: records[0].themePreference || 'light',
            notificationsEnabled: records[0].notificationsEnabled ?? true,
            apiKey: records[0].apiKey || ''
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPrefs();
  }, [currentUser]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserPreferences(prefs);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'preferences', label: 'App Preferences', icon: Sliders },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <>
      <Helmet><title>Settings | DevInspect AI</title></Helmet>
      <div className="w-full min-h-screen py-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account and application preferences.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 shrink-0">
              <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === t.id ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    <t.icon className="w-5 h-5" />
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 card-elevated min-h-[500px] relative overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'preferences' && (
                  <motion.div key="pref" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-6">Application Preferences</h2>
                      <div className="space-y-5 max-w-md">
                        <div className="space-y-2">
                          <Label className="font-semibold">Default Language</Label>
                          <Select value={prefs.defaultLanguage} onValueChange={(v)=>setPrefs({...prefs, defaultLanguage:v})}>
                            <SelectTrigger className="h-12 bg-background border-border/50"><SelectValue/></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="javascript">JavaScript</SelectItem>
                              <SelectItem value="python">Python</SelectItem>
                              <SelectItem value="java">Java</SelectItem>
                              <SelectItem value="typescript">TypeScript</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold">Theme Mode</Label>
                          <Select value={prefs.themePreference} onValueChange={(v)=>setPrefs({...prefs, themePreference:v})}>
                            <SelectTrigger className="h-12 bg-background border-border/50"><SelectValue/></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light Mode</SelectItem>
                              <SelectItem value="dark">Dark Mode</SelectItem>
                              <SelectItem value="system">System Default</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'notifications' && (
                  <motion.div key="notif" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50">
                      <div>
                        <p className="font-bold">Email Summaries</p>
                        <p className="text-sm text-muted-foreground">Receive weekly review analytics.</p>
                      </div>
                      <Switch checked={prefs.notificationsEnabled} onCheckedChange={(v)=>setPrefs({...prefs, notificationsEnabled:v})} />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'profile' && (
                  <motion.div key="prof" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-6 flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-12">
                    <User className="w-12 h-12 mb-4 opacity-50" />
                    <p>Profile editing is currently managed from the Profile page.</p>
                  </motion.div>
                )}

                {/* Placeholders for others */}
                {(activeTab === 'api' || activeTab === 'security') && (
                  <motion.div key="other" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-6 flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-12">
                    <Shield className="w-12 h-12 mb-4 opacity-50" />
                    <p>This section is under construction.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fixed Footer for Save Action */}
              <div className="absolute bottom-0 left-0 w-full p-6 bg-card border-t border-border/50 flex justify-end">
                <Button onClick={handleSave} disabled={loading} className="btn-primary min-w-[150px]">
                  {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
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