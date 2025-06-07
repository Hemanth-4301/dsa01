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
import LoadingSpinner from "../components/LoadingSpinner";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
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
    "dynamic-programming-1d",
    "dynamic-programming-2d",
    "greedy",
    "bit-manipulation",
    "miscellaneous",
  ];

  // Sort categories according to the specified order
  const sortedCategories = categoriesData?.categories
    ? [...categoriesData.categories].sort((a, b) => {
        return (
          categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
        );
      })
    : [];

  // Prepare data for category distribution chart with better naming
  const categoryChartData = sortedCategories.map((category) => {
    const categoryName = category.category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      name: categoryName,
      shortName:
        categoryName.length > 15
          ? categoryName.substring(0, 12) + "..."
          : categoryName,
      fullName: categoryName,
      count: category.count,
      solved:
        progressData?.categoryProgress?.find(
          (cp) => cp._id === category.category
        )?.solved || 0,
    };
  });

  // Enhanced category chart colors with gradients
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
    "#1d4ed8", // blue-700
  ];

  // Enhanced custom tooltip for category chart
  const CustomCategoryTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {data.fullName}
          </p>
          <div className="space-y-1">
            <p className="text-sm flex items-center justify-between">
              <span className="text-blue-600 dark:text-blue-400 flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Total:
              </span>
              <span className="font-semibold ml-2">{payload[0].value}</span>
            </p>
            <p className="text-sm flex items-center justify-between">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                Solved:
              </span>
              <span className="font-semibold ml-2">
                {payload[1]?.value || 0}
              </span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
              Progress:{" "}
              {(((payload[1]?.value || 0) / payload[0].value) * 100).toFixed(1)}
              %
            </p>
          </div>
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
      className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-4"
    >
      {/* Enhanced Profile Header */}
      <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <img
              src={user?.avatar || "/placeholder.svg?height=80&width=80"}
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-blue-500/20 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {stats.totalSolved}
              </span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
              {user?.name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <FiMail className="w-4 h-4 text-blue-500" />
                <span className="truncate max-w-[180px] sm:max-w-none">
                  {user?.email}
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <FiCalendar className="w-4 h-4 text-purple-500" />
                <span>
                  Joined {new Date(user?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-lg border border-emerald-200/50 dark:border-emerald-700/50"
        >
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            {stats.totalSolved}
          </div>
          <div className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            Problems Solved
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-lg border border-amber-200/50 dark:border-amber-700/50"
        >
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
            {stats.totalStarred}
          </div>
          <div className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 font-medium">
            Questions Starred
          </div>
        </motion.div>
      </div>

      {/* Enhanced Tabs */}
      <div className="flex space-x-1 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center space-x-2 flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg scale-105"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Enhanced Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "overview" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Enhanced Activity Heatmap */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
              <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6 text-center">
                📅 Activity Heatmap
              </h2>
              <div className="overflow-x-auto -mx-2 sm:-mx-4">
                <div className="min-w-[600px] px-2 sm:px-4">
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

            {/* Enhanced Category Progress Chart */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
              <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6 text-center">
                📊 Progress by Category
              </h2>
              <div className="h-[500px] sm:h-[600px] lg:h-[700px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryChartData}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 20,
                      left: 10,
                      bottom: 20,
                    }}
                    barGap={4}
                    barSize={20}
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
                          stopColor="#059669"
                          stopOpacity={1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      strokeOpacity={0.3}
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0", strokeOpacity: 0.3 }}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      domain={[0, "dataMax + 2"]}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                        textAnchor: "end",
                      }}
                      tickFormatter={(value) => {
                        // Find the full name for this category
                        const category = categoryChartData.find(
                          (cat) => cat.name === value
                        );
                        return category ? category.fullName : value;
                      }}
                      axisLine={{ stroke: "#e2e8f0", strokeOpacity: 0.3 }}
                      tickLine={false}
                      interval={0}
                    />
                    <Tooltip content={<CustomCategoryTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={40}
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {value}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="count"
                      name="Total"
                      radius={[0, 6, 6, 0]}
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
                      radius={[0, 6, 6, 0]}
                      className="drop-shadow-sm"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "starred" && (
          <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
            <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6 text-center">
              ⭐ Starred Questions
            </h2>
            {starredLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {starredData?.starred?.map((item) => (
                  <motion.div
                    key={item._id}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-medium text-slate-900 dark:text-white truncate">
                        {item.questionId.problem}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
                          <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        </span>
                      )}
                      <FiStar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-current" />
                      <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    </div>
                  </motion.div>
                ))}
                {starredData?.starred?.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-6xl mb-4">⭐</div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                      No starred questions yet. Star questions to save them for
                      later!
                    </p>
                  </div>
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
