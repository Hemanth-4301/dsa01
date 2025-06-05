"use client";

import { motion } from "framer-motion";
import {
  FiUsers,
  FiFileText,
  FiTrendingUp,
  FiActivity,
  FiAward,
  FiTarget,
} from "react-icons/fi";
import { useQuery } from "react-query";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import LoadingSpinner from "../LoadingSpinner";
import { useState } from "react";

const AdminAnalytics = () => {
  const [activePieIndex, setActivePieIndex] = useState(0);

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    "adminAnalytics",
    () => axios.get("/api/admin/analytics").then((res) => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (analyticsLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const overview = analyticsData?.overview || {};
  const categoryStats = analyticsData?.categoryStats || [];
  const topPerformers = analyticsData?.topPerformers || [];
  const userRegistrations = analyticsData?.userRegistrations || [];

  // Enhanced colors for charts with gradients
  const COLORS = [
    { color: "#3b82f6", gradient: ["#3b82f6", "#1d4ed8"] }, // blue
    { color: "#10b981", gradient: ["#10b981", "#059669"] }, // emerald
    { color: "#f59e0b", gradient: ["#f59e0b", "#d97706"] }, // amber
    { color: "#ef4444", gradient: ["#ef4444", "#dc2626"] }, // red
    { color: "#8b5cf6", gradient: ["#8b5cf6", "#7c3aed"] }, // violet
    { color: "#06b6d4", gradient: ["#06b6d4", "#0891b2"] }, // cyan
    { color: "#84cc16", gradient: ["#84cc16", "#65a30d"] }, // lime
    { color: "#f97316", gradient: ["#f97316", "#ea580c"] }, // orange
  ];

  const statCards = [
    {
      title: "Total Users",
      value: overview.totalUsers || 0,
      icon: FiUsers,
      color: "from-blue-500 to-blue-600",
      bgColor:
        "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      change: "+12%",
      changeColor: "text-emerald-600",
    },
    {
      title: "Active Users",
      value: overview.activeUsers || 0,
      icon: FiActivity,
      color: "from-emerald-500 to-emerald-600",
      bgColor:
        "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      change: "+8%",
      changeColor: "text-emerald-600",
    },
    {
      title: "Total Questions",
      value: overview.totalQuestions || 0,
      icon: FiFileText,
      color: "from-purple-500 to-purple-600",
      bgColor:
        "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
      change: "+5%",
      changeColor: "text-emerald-600",
    },
    {
      title: "Engagement Rate",
      value:
        overview.totalUsers > 0
          ? `${Math.round((overview.activeUsers / overview.totalUsers) * 100)}%`
          : "0%",
      icon: FiTrendingUp,
      color: "from-amber-500 to-amber-600",
      bgColor:
        "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
      change: "+15%",
      changeColor: "text-emerald-600",
    },
  ];

  // Enhanced custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2 capitalize">
            {data.name.replace("-", " ")}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-medium">{data.value}</span> problems solved
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {data.payload.percent
                ? `${(data.payload.percent * 100).toFixed(1)}% of total`
                : ""}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhanced custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {label}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <span className="font-medium">{payload[0].value}</span> new
            registrations
          </p>
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
          y={cy - 8}
          dy={8}
          textAnchor="middle"
          className="text-sm font-bold fill-slate-800 dark:fill-slate-200"
        >
          {payload._id.replace("-", " ")}
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 p-4 sm:p-6"
    >
      {/* Enhanced Header */}
      <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
          📊 Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Comprehensive insights into platform performance and user engagement
        </p>
      </motion.div>

      {/* Enhanced Overview Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div
                  className={`p-2 sm:p-3 rounded-xl ${stat.iconBg} shadow-lg`}
                >
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {stat.title}
                  </p>
                  <p
                    className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs sm:text-sm font-semibold ${stat.changeColor} flex items-center`}
                >
                  <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {stat.change}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  vs last month
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Enhanced Category Popularity */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60"
        >
          <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6 text-center">
            🎯 Category Popularity
          </h3>
          <div className="h-64 sm:h-80 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {COLORS.map((colorObj, index) => (
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
                        stopColor={colorObj.gradient[0]}
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor={colorObj.gradient[1]}
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  activeIndex={activePieIndex}
                  activeShape={renderActiveShape}
                  data={categoryStats.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="75%"
                  paddingAngle={3}
                  dataKey="solvedCount"
                  nameKey="_id"
                  onMouseEnter={(_, index) => setActivePieIndex(index)}
                  animationBegin={200}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {categoryStats.slice(0, 8).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#pieGradient-${index})`}
                      stroke={COLORS[index % COLORS.length].color}
                      strokeWidth={2}
                      className="drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Enhanced User Registrations */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60"
        >
          <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6 text-center">
            📈 User Registrations (Last 30 Days)
          </h3>
          <div className="h-64 sm:h-80 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userRegistrations}
                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
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
                  dataKey="_id"
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0", strokeOpacity: 0.3 }}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0", strokeOpacity: 0.3 }}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="count"
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                  className="drop-shadow-sm hover:drop-shadow-md transition-all duration-200"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Top Performers */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60"
      >
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <FiAward className="w-6 h-6 text-amber-500 mr-2" />
          <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Top Performers
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200/50 dark:border-slate-700/50">
                <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                  Rank
                </th>
                <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                  User
                </th>
                <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-slate-700 dark:text-slate-300 text-sm sm:text-base hidden sm:table-cell">
                  Email
                </th>
                <th className="text-right py-3 sm:py-4 px-2 sm:px-4 font-semibold text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                  Problems Solved
                </th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map((performer, index) => (
                <motion.tr
                  key={performer._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-slate-100/50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200"
                >
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <div className="flex items-center">
                      {index < 3 ? (
                        <div
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ${
                            index === 0
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                              : index === 1
                              ? "bg-gradient-to-r from-gray-400 to-gray-600"
                              : "bg-gradient-to-r from-amber-600 to-amber-800"
                          }`}
                        >
                          {index + 1}
                        </div>
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs sm:text-sm">
                          {index + 1}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <div className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">
                      {performer.name}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 sm:hidden">
                      {performer.email}
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4 text-slate-700 dark:text-slate-300 text-sm sm:text-base hidden sm:table-cell">
                    {performer.email}
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <FiTarget className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                        {performer.solvedCount}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {topPerformers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 sm:py-12 text-center">
                    <div className="text-4xl sm:text-6xl mb-4">📊</div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                      No performance data available
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminAnalytics;
