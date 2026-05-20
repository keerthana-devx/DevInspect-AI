import React from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  Activity,
  Bug,
  Code2,
  Shield,
  Sparkles,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const stats = [
  {
    title: "Total Reviews",
    value: "128",
    icon: Code2,
    change: "+12%",
    trend: "up",
    color: "baby-pink",
    gradient: "from-baby-pink/20 to-blush-pink/10"
  },
  {
    title: "Critical Bugs",
    value: "14",
    icon: Bug,
    change: "-5%",
    trend: "down",
    color: "lavender",
    gradient: "from-lavender/20 to-pastel-purple/10"
  },
  {
    title: "Security Checks",
    value: "42",
    icon: Shield,
    change: "+8%",
    trend: "up",
    color: "pastel-blue",
    gradient: "from-pastel-blue/20 to-soft-lilac/10"
  },
  {
    title: "AI Score",
    value: "94%",
    icon: TrendingUp,
    change: "+3%",
    trend: "up",
    color: "soft-peach",
    gradient: "from-soft-peach/20 to-warm-beige/10"
  },
];

const DashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard | DevInspect AI</title>
      </Helmet>

      <div className="min-h-screen p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Sparkles className="text-white w-6 h-6 animate-pulse" />
            </motion.div>

            <h1 className="text-4xl font-extrabold text-gradient">
              DevInspect Dashboard
            </h1>
          </div>

          <p className="text-muted-foreground text-lg">
            AI-powered analytics and code review insights.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="card-glow bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl border border-white/50 p-6 rounded-2xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg">
                    <Icon className={`text-${item.color} w-7 h-7`} />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${item.trend === 'up' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                    {item.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {item.change}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm font-medium mb-1">
                  {item.title}
                </p>
                <h2 className="text-4xl font-bold text-gradient">
                  {item.value}
                </h2>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card-glass p-8 rounded-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                <Activity className="text-primary w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gradient">
                Recent Activity
              </h2>
            </div>

            <div className="space-y-3">
              {[
                { text: "JavaScript security analysis completed", time: "2 min ago", color: "baby-pink" },
                { text: "React performance review generated", time: "15 min ago", color: "lavender" },
                { text: "Python bug detection finished", time: "1 hour ago", color: "pastel-blue" },
                { text: "DSA optimization suggestions added", time: "2 hours ago", color: "soft-peach" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ x: 5 }}
                  className={`p-4 rounded-xl bg-gradient-to-r ${item.gradient} border border-${item.color}/20 flex items-center justify-between cursor-pointer transition-all`}
                >
                  <span className="text-foreground font-medium">{item.text}</span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card-glass p-8 rounded-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                <Sparkles className="text-primary w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gradient">
                AI Insights
              </h2>
            </div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/20">
                    <TrendingUp className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-foreground">
                      Code Quality Improved
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Your recent submissions show a 21% increase in clean architecture practices.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-secondary/20">
                    <Shield className="text-secondary w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-foreground">
                      Performance Suggestion
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Consider reducing nested loops in your DSA implementations.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-accent/20">
                    <Bug className="text-accent w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-foreground">
                      Security Alert
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      2 projects contain exposed environment variables.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;