"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiCalendar,
  FiStar,
  FiTrendingUp,
  FiChevronRight,
} from "react-icons/fi";
import { useQuery } from "react-query";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import ProgressBar from "../components/ProgressBar";
import LoadingSpinner from "../components/LoadingSpinner";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user progress
  const { data: progressData, isLoading: progressLoading } = useQuery(
    "userProgress",
    () => axios.get("/api/progress").then((res) => res.data),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Fetch starred questions
  const { data: starredData, isLoading: starredLoading } = useQuery(
    "starredQuestions",
    () => axios.get("/api/progress/starred").then((res) => res.data),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Fetch categories stats
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    "categories",
    () => axios.get("/api/questions/stats/categories").then((res) => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Generate heatmap data (mock data for now)
  const generateHeatmapData = () => {
    const data = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      data.push({
        date: date.toISOString().split("T")[0],
        count: Math.floor(Math.random() * 5), // Random activity for demo
      });
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  const tabs = [
    { id: "overview", label: "Overview", icon: FiTrendingUp },
    { id: "starred", label: "Starred", icon: FiStar },
  ];

  const stats = progressData?.stats || {
    totalSolved: 0,
    totalAttempted: 0,
    totalStarred: 0,
  };

  // Define the category order (same as in Home page)
  const categoryOrder = [
    "arrays",
    "two-pointer",
    "sliding-window",
    "binary-search",
    "string",
    "linked-list",
    "stack",
    "heap",
    "backtracking",
    "trees",
    "trie",
    "graphs",
    "dynamic-programming 1d",
    "dynamic-programming 2d",
    "greedy",
    "bit-manipulation",
  ];

  // Sort categories according to the specified order
  const sortedCategories = categoriesData?.categories
    ? [...categoriesData.categories].sort((a, b) => {
        return (
          categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
        );
      })
    : [];

  // Prepare data for category distribution chart
  const categoryChartData = sortedCategories.map((category) => ({
    name: category.category.replace("-", " "),
    count: category.count,
    solved:
      progressData?.categoryProgress?.find((cp) => cp._id === category.category)
        ?.solved || 0,
  }));

  // Category chart colors
  const categoryColors = [
    "#3b82f6", // blue-500
    "#4f46e5", // indigo-600
    "#7c3aed", // violet-600
    "#9333ea", // purple-600
    "#c026d3", // fuchsia-600
    "#db2777", // pink-600
    "#e11d48", // rose-600
    "#dc2626", // red-600
    "#ea580c", // orange-600
    "#d97706", // amber-600
    "#ca8a04", // yellow-600
    "#65a30d", // lime-600
    "#16a34a", // green-600
    "#0d9488", // teal-600
    "#0891b2", // cyan-600
    "#0284c7", // sky-600
  ];

  // Custom tooltip for category chart
  const CustomCategoryTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200/60 dark:border-slate-700/60">
          <p className="font-semibold capitalize">{label}</p>
          <p className="text-sm">
            <span className="text-blue-600 dark:text-blue-400">
              Total: {payload[0].value}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-emerald-600 dark:text-emerald-400">
              Solved: {payload[1]?.value || 0}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (progressLoading || categoriesLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 px-4 sm:px-6 lg:px-8 py-4"
    >
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <img
            src={user?.avatar || "/placeholder.svg?height=80&width=80"}
            alt={user?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {user?.name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              <div className="flex items-center justify-center sm:justify-start space-x-1">
                <FiMail className="w-4 h-4" />
                <span className="truncate max-w-[180px] sm:max-w-none">
                  {user?.email}
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-1">
                <FiCalendar className="w-4 h-4" />
                <span>
                  Joined {new Date(user?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-lg border border-slate-200/60 dark:border-slate-700/60">
          <div className="text-xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            {stats.totalSolved}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Solved
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-lg border border-slate-200/60 dark:border-slate-700/60">
          <div className="text-xl sm:text-3xl font-bold text-amber-500 dark:text-amber-400 mb-2">
            {stats.totalStarred}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Starred
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center space-x-2 flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Activity Heatmap */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Activity Heatmap
              </h2>
              <div className="overflow-x-auto -mx-4">
                <div className="min-w-[600px] px-4">
                  <CalendarHeatmap
                    startDate={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 1)
                      )
                    }
                    endDate={new Date()}
                    values={heatmapData}
                    classForValue={(value) => {
                      if (!value) {
                        return "color-empty";
                      }
                      return `color-scale-${Math.min(value.count, 4)}`;
                    }}
                    tooltipDataAttrs={(value) => {
                      return {
                        "data-tip": `${value.date}: ${
                          value.count || 0
                        } problems solved`,
                      };
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Category Progress Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Progress by Category
              </h2>
              <div className="h-96 sm:h-[28rem] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryChartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                    layout="vertical"
                    barGap={2}
                    barSize={16}
                  >
                    <defs>
                      {categoryChartData.map((_, index) => (
                        <linearGradient
                          key={`barGradient-${index}`}
                          id={`barGradient-${index}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor={
                              categoryColors[index % categoryColors.length]
                            }
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor={
                              categoryColors[index % categoryColors.length]
                            }
                            stopOpacity={1}
                          />
                        </linearGradient>
                      ))}
                      <linearGradient
                        id="solvedGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity={1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      strokeOpacity={0.2}
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0", strokeOpacity: 0.3 }}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{
                        fill: "#64748b",
                        fontSize: 12,
                        textAnchor: "end",
                        width: 100,
                      }}
                      tickFormatter={(value) =>
                        value.length > 12
                          ? value.substring(0, 12) + "..."
                          : value
                      }
                      axisLine={{ stroke: "#e2e8f0", strokeOpacity: 0.3 }}
                    />
                    <Tooltip content={<CustomCategoryTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {value}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="count"
                      name="Total"
                      radius={[0, 4, 4, 0]}
                      className="drop-shadow-sm"
                    >
                      {categoryChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#barGradient-${index})`}
                          className="hover:opacity-90 transition-opacity duration-200"
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="solved"
                      name="Solved"
                      fill="url(#solvedGradient)"
                      radius={[0, 4, 4, 0]}
                      className="drop-shadow-sm"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "starred" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
              Starred Questions
            </h2>
            {starredLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-4">
                {starredData?.starred?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-slate-900 dark:text-white truncate">
                        {item.questionId.problem}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            item.questionId.difficulty === "Easy"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : item.questionId.difficulty === "Medium"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                          }`}
                        >
                          {item.questionId.difficulty}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">
                          {item.questionId.category.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      {item.status === "solved" && (
                        <span className="text-emerald-500">
                          <FiTrendingUp className="w-5 h-5" />
                        </span>
                      )}
                      <FiStar className="w-5 h-5 text-amber-500 fill-current" />
                      <FiChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                ))}
                {starredData?.starred?.length === 0 && (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                    No starred questions yet. Star questions to save them for
                    later!
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Profile;
