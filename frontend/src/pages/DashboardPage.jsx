import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  Activity,
  Bug,
  Code2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getAnalytics } from "@/lib/historyStorage";

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardPage = () => {
  const [analytics, setAnalytics] = useState(() => getAnalytics());

  useEffect(() => {
    setAnalytics(getAnalytics());
  }, []);

  const stats = useMemo(
    () => [
      {
        title: "Total Analyses",
        value: String(analytics.totalAnalyses),
        icon: Code2,
        color: "baby-pink",
      },
      {
        title: "Total Issues",
        value: String(analytics.totalIssues),
        icon: Bug,
        color: "lavender",
      },
      {
        title: "Avg AI Score",
        value: `${analytics.avgScore}%`,
        icon: TrendingUp,
        color: "pastel-blue",
      },
      {
        title: "Top Language",
        value: analytics.topLanguage.toUpperCase(),
        icon: Sparkles,
        color: "soft-peach",
      },
    ],
    [analytics]
  );

  const pieData = useMemo(
    () => ({
      labels: ["Student", "Interviewer", "Developer"],
      datasets: [
        {
          data: [
            analytics.modeCounts.student,
            analytics.modeCounts.interviewer,
            analytics.modeCounts.developer,
          ],
          backgroundColor: [
            "hsl(var(--primary))",
            "hsl(var(--secondary))",
            "hsl(var(--accent))",
          ],
          borderWidth: 0,
        },
      ],
    }),
    [analytics.modeCounts]
  );

  const formatRelativeTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

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
            Analytics from your saved code analyses.
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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg mb-4">
                  <Icon className={`text-${item.color} w-7 h-7`} />
                </div>
                <p className="text-muted-foreground text-sm font-medium mb-1">
                  {item.title}
                </p>
                <h2 className="text-4xl font-bold text-gradient">{item.value}</h2>
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
              <h2 className="text-2xl font-bold text-gradient">Recent Activity</h2>
            </div>

            <div className="space-y-3">
              {analytics.recentActivity.length === 0 ? (
                <p className="text-muted-foreground">
                  Run your first analysis to see activity here.
                </p>
              ) : (
                analytics.recentActivity.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ x: 5 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 flex items-center justify-between"
                  >
                    <span className="text-foreground font-medium capitalize">
                      {item.language} · {item.mode} analysis
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card-glass p-8 rounded-3xl"
          >
            <h2 className="text-2xl font-bold text-gradient mb-6">
              Mode Usage
            </h2>
            {analytics.totalAnalyses === 0 ? (
              <p className="text-muted-foreground">No mode data yet.</p>
            ) : (
              <div className="max-w-xs mx-auto">
                <Pie data={pieData} />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
