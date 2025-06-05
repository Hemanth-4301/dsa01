"use client";

import "../pages/App.css";
import { Link } from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";
import { FiChevronRight } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "react-query";
import axios from "axios";
import ProgressBar from "../components/ProgressBar";
import LoadingSpinner from "../components/LoadingSpinner";
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
  PieChart,
  Pie,
  Sector,
} from "recharts";

const Home = () => {
  const { user } = useAuth();

  // Fetch categories stats
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    "categories",
    () => axios.get("/api/questions/stats/categories").then((res) => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch user progress if logged in
  const { data: progressData, isLoading: progressLoading } = useQuery(
    "userProgress",
    () => axios.get("/api/progress").then((res) => res.data),
    {
      enabled: !!user,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Calculate total questions from categories data
  const totalQuestions =
    categoriesData?.categories?.reduce(
      (total, category) => total + category.count,
      0
    ) || 150; // Fallback to 150 if not loaded yet
  const totalSolved = progressData?.stats?.totalSolved || 0;
  const totalStarred = progressData?.stats?.totalStarred || 0;
  const totalRemaining = totalQuestions - totalSolved;

  // Define the category order
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

  // Prepare data for progress overview pie chart with enhanced styling
  const progressPieData = [
    {
      name: "Solved",
      value: totalSolved,
      color: "#10b981", // emerald-500
      gradient: ["#10b981", "#059669"], // emerald-500 to emerald-600
      icon: "✅",
    },
    {
      name: "Starred",
      value: totalStarred,
      color: "#f59e0b", // amber-500
      gradient: ["#f59e0b", "#d97706"], // amber-500 to amber-600
      icon: "⭐",
    },
    {
      name: "Remaining",
      value: totalRemaining,
      color: "#64748b", // slate-500
      gradient: ["#64748b", "#475569"], // slate-500 to slate-600
      icon: "📝",
    },
  ].filter((item) => item.value > 0); // Only include non-zero values

  // Custom tooltip for category chart
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
            {user && (
              <p className="text-sm flex items-center justify-between">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                  Solved:
                </span>
                <span className="font-semibold ml-2">
                  {payload[1]?.value || 0}
                </span>
              </p>
            )}
            {user && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                Progress:{" "}
                {(((payload[1]?.value || 0) / payload[0].value) * 100).toFixed(
                  1
                )}
                %
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhanced custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{data.icon}</span>
            <p
              className="font-semibold text-slate-900 dark:text-slate-100"
              style={{ color: data.color }}
            >
              {data.name}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-medium">{data.value}</span> problems
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {((data.value / totalQuestions) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhanced active sector renderer for pie chart
  const renderActiveShape = (props) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          className="drop-shadow-lg"
          style={{
            filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
          }}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 12}
          fill={fill}
          opacity={0.6}
        />
        <text
          x={cx}
          y={cy - 12}
          dy={8}
          textAnchor="middle"
          className="text-sm font-bold fill-slate-800 dark:fill-slate-200"
        >
          {payload.icon} {payload.name}
        </text>
        <text
          x={cx}
          y={cy + 8}
          dy={8}
          textAnchor="middle"
          className="text-xs fill-slate-600 dark:fill-slate-400"
        >
          {`${value} (${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  // State for active pie sector
  const [activePieIndex, setActivePieIndex] = React.useState(0);

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 sm:space-y-12"
    >
      {/* Hero Section */}
      <section id="hero">
        <motion.div
          className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 rounded-2xl sm:rounded-3xl border border-slate-200/60 dark:border-slate-700/60 mb-8 sm:mb-10 shadow-xl dark:shadow-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Grid background with responsive sizing */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-blue-500/5 dark:from-slate-900/80 dark:via-transparent dark:to-blue-500/10"></div>
          </div>

          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-20">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12">
                {/* Left section */}
                <motion.div className="flex-1 w-full" variants={itemVariants}>
                  <motion.div
                    className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-800 dark:text-emerald-200 mb-4 sm:mb-6 shadow-sm border border-emerald-200/50 dark:border-emerald-700/50"
                    variants={itemVariants}
                  >
                    ✨ Learn DSA with {totalQuestions - 3}+ Problems
                  </motion.div>

                  <motion.h1
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent"
                    variants={itemVariants}
                  >
                    Level Up Your Coding Skills
                  </motion.h1>

                  <motion.p
                    className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-xl leading-relaxed"
                    variants={itemVariants}
                  >
                    Practice the most important algorithms and ace your
                    technical interviews with our curated collection of{" "}
                    {totalQuestions - 3}+ essential problems.
                  </motion.p>

                  <motion.div
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8"
                    variants={itemVariants}
                  >
                    <motion.a
                      href="#categories"
                      className="inline-flex items-center justify-center px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 border border-blue-500/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Start Learning
                      <FiChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </motion.a>
                  </motion.div>

                  {/* Motivational Chart */}
                  <motion.div
                    className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60 max-w-md lg:max-w-2xl shadow-lg"
                    variants={itemVariants}
                  >
                    <div className="flex items-center mb-3 sm:mb-4">
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                        🚀 Path to Success
                      </h3>
                    </div>
                    <svg
                      viewBox="0 0 200 100"
                      className="w-full h-24 sm:h-32 text-blue-600 dark:text-blue-400"
                    >
                      <defs>
                        <linearGradient
                          id="pathGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,90 Q40,20 80,60 T160,30"
                        fill="none"
                        stroke="url(#pathGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <text
                        x="5"
                        y="95"
                        fontSize="10"
                        fill="#64748b"
                        className="dark:fill-slate-400"
                      >
                        Failure
                      </text>
                      <text
                        x="160"
                        y="25"
                        fontSize="10"
                        fill="#64748b"
                        className="dark:fill-slate-400"
                      >
                        Success
                      </text>
                    </svg>
                    <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 font-medium">
                      Every curve in the path reflects a learning moment.
                    </p>
                  </motion.div>
                </motion.div>

                {/* Right section - Progress */}
                <motion.div
                  className="flex-shrink-0 relative w-full max-w-xs mx-auto lg:mx-0 mt-6 sm:mt-10 md:mt-12"
                  variants={itemVariants}
                >
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center p-6 sm:p-8 shadow-2xl border border-blue-200/50 dark:border-blue-700/50">
                      <div className="bar">
                        <div className="ball bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                      </div>
                    </div>
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        className="stroke-current text-slate-200 dark:text-slate-700"
                        strokeWidth="4"
                        fill="transparent"
                        r="47"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="stroke-current text-blue-500 dark:text-blue-400"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="transparent"
                        r="47"
                        cx="50"
                        cy="50"
                        strokeDasharray="295.31"
                        strokeDashoffset={
                          295.31 -
                          (295.31 *
                            Math.round((totalSolved / totalQuestions) * 100)) /
                            100
                        }
                        transform="rotate(-90 50 50)"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="295.31"
                          to={
                            295.31 -
                            (295.31 *
                              Math.round(
                                (totalSolved / totalQuestions) * 100
                              )) /
                              100
                          }
                          dur="2s"
                          fill="freeze"
                          calcMode="spline"
                          keySplines="0.4 0 0.2 1"
                        />
                      </circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center mt-16 sm:mt-20 md:mt-24">
                      <div className="text-center">
                        <span className="block text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                          {totalSolved}
                        </span>
                        <span className="block text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                          of {totalQuestions}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* User Stats Section */}
      {user && (
        <motion.section variants={itemVariants}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
            <h2 className="text-xl sm:text-2xl text-center font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6">
              Your Dashboard
            </h2>
            {progressLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {/* Enhanced Progress Overview Pie Chart */}
                <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                  <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6 text-center">
                    🎯 Progress Overview
                  </h3>
                  <div className="flex flex-col xl:flex-row items-center justify-center gap-6 sm:gap-8">
                    {/* Enhanced Pie Chart */}
                    <div className="w-full max-w-sm sm:max-w-md">
                      <div className="h-64 sm:h-80 lg:h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <defs>
                              {progressPieData.map((entry, index) => (
                                <linearGradient
                                  key={`gradient-${index}`}
                                  id={`pieGradient-${index}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor={entry.gradient[0]}
                                    stopOpacity={1}
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor={entry.gradient[1]}
                                    stopOpacity={0.8}
                                  />
                                </linearGradient>
                              ))}
                            </defs>
                            <Pie
                              activeIndex={activePieIndex}
                              activeShape={renderActiveShape}
                              data={progressPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius="45%"
                              outerRadius="75%"
                              paddingAngle={3}
                              dataKey="value"
                              onMouseEnter={(_, index) =>
                                setActivePieIndex(index)
                              }
                              animationBegin={200}
                              animationDuration={1500}
                              animationEasing="ease-out"
                            >
                              {progressPieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={`url(#pieGradient-${index})`}
                                  stroke={entry.color}
                                  strokeWidth={2}
                                  className="drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 cursor-pointer"
                                />
                              ))}
                              {progressPieData.length === 0 && (
                                <Cell fill="#e2e8f0" />
                              )}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Enhanced Legend */}
                    <div className="w-full max-w-sm space-y-3 sm:space-y-4">
                      {progressPieData.map((entry, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: index * 0.1 + 0.3,
                            duration: 0.5,
                          }}
                          className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer ${
                            index === activePieIndex
                              ? "bg-slate-100 dark:bg-slate-700 shadow-md scale-105"
                              : "bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                          onMouseEnter={() => setActivePieIndex(index)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <span className="text-lg sm:text-xl">
                              {entry.icon}
                            </span>
                            <div
                              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm"
                              style={{
                                background: `linear-gradient(135deg, ${entry.gradient[0]}, ${entry.gradient[1]})`,
                              }}
                            ></div>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                              {entry.name}
                            </div>
                            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                              {entry.value} problems (
                              {((entry.value / totalQuestions) * 100).toFixed(
                                1
                              )}
                              %)
                            </div>
                          </div>
                          <div
                            className="text-lg sm:text-xl font-bold"
                            style={{ color: entry.color }}
                          >
                            {entry.value}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Category Distribution Bar Chart */}
                <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                  <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6 text-center">
                    📊 Questions by Category
                  </h3>
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
                        {user && (
                          <Bar
                            dataKey="solved"
                            name="Solved"
                            fill="url(#solvedGradient)"
                            radius={[0, 6, 6, 0]}
                            className="drop-shadow-sm"
                          />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* Categories Section */}
      <motion.section variants={itemVariants} id="categories">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-6 sm:mb-8 text-center">
          Practice by Category
        </h2>
        {categoriesLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sortedCategories.map((category) => {
              const userCategoryProgress = progressData?.categoryProgress?.find(
                (cp) => cp._id === category.category
              );
              const solved = userCategoryProgress?.solved || 0;

              return (
                <motion.div
                  key={category.category}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={`/questions?category=${category.category}`}
                    className="block p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-600 group"
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent capitalize group-hover:from-blue-600 group-hover:to-indigo-600 dark:group-hover:from-blue-400 dark:group-hover:to-indigo-400 transition-all duration-300">
                        {category.category.replace("-", " ")}
                      </h3>
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                        {category.count} problems
                      </span>
                    </div>

                    {user && (
                      <ProgressBar
                        solved={solved}
                        total={category.count}
                        className="mb-3 sm:mb-4"
                      />
                    )}

                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1 sm:mr-2"></div>
                        Easy: {category.easy}
                      </span>
                      <span className="flex items-center text-amber-600 dark:text-amber-400 font-medium">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-1 sm:mr-2"></div>
                        Medium: {category.medium}
                      </span>
                      <span className="flex items-center text-rose-600 dark:text-rose-400 font-medium">
                        <div className="w-2 h-2 bg-rose-500 rounded-full mr-1 sm:mr-2"></div>
                        Hard: {category.hard}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* CTA Section */}
      {!user && (
        <motion.section
          variants={itemVariants}
          className="text-center py-8 sm:py-12"
        >
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200/60 dark:border-blue-700/60 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3 sm:mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-4 sm:mb-6">
              Join Today to improve your coding skills.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
            >
              Get Started for Free
            </Link>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
};

export default Home;
