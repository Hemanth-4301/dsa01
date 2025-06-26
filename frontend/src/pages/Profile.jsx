"use client";

import { useState, useEffect, useRef } from "react";
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

// Custom Floating Bubble Chart Component
const FloatingBubbleChart = ({ data }) => {
  const [hoveredBubble, setHoveredBubble] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [containerDimensions, setContainerDimensions] = useState({
    width: 800,
    height: 500,
  });
  const containerRef = useRef(null);

  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate responsive bubble sizes
  const getResponsiveBubbleRadius = (count, screenWidth) => {
    const maxCount = Math.max(...data.map((d) => d.count));
    let minRadius, maxRadius;

    if (screenWidth < 640) {
      // Mobile
      minRadius = 25;
      maxRadius = 45;
    } else if (screenWidth < 1024) {
      // Tablet
      minRadius = 35;
      maxRadius = 65;
    } else {
      // Desktop
      minRadius = 40;
      maxRadius = 80;
    }

    return minRadius + (count / maxCount) * (maxRadius - minRadius);
  };

  // Generate responsive bubble positions
  const generateResponsiveBubblePositions = () => {
    const { width, height } = containerDimensions;
    const positions = [];

    // Responsive grid calculation
    let cols, rows;
    if (width < 640) {
      cols = 3;
      rows = Math.ceil(data.length / cols);
    } else if (width < 1024) {
      cols = 4;
      rows = Math.ceil(data.length / cols);
    } else {
      cols = Math.min(5, Math.ceil(Math.sqrt(data.length)));
      rows = Math.ceil(data.length / cols);
    }

    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const maxRadius = getResponsiveBubbleRadius(
      Math.max(...data.map((d) => d.count)),
      width
    );

    data.forEach((item, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      // Calculate base position
      const baseX = (col + 0.5) * cellWidth;
      const baseY = (row + 0.5) * cellHeight;

      // Add controlled randomness for natural positioning
      const offsetX = (Math.random() - 0.5) * (cellWidth * 0.2);
      const offsetY = (Math.random() - 0.5) * (cellHeight * 0.2);

      const radius = getResponsiveBubbleRadius(item.count, width);

      positions.push({
        x: Math.max(
          radius + 10,
          Math.min(width - radius - 10, baseX + offsetX)
        ),
        y: Math.max(
          radius + 10,
          Math.min(height - radius - 10, baseY + offsetY)
        ),
        radius,
        floatDelay: Math.random() * 4, // Random delay for floating animation
        floatDuration: 3 + Math.random() * 2, // Random duration between 3-5 seconds
        waveDelay: Math.random() * 2, // Random delay for wave animation
        ...item,
      });
    });

    return positions;
  };

  const handleMouseMove = (event, bubble) => {
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    setHoveredBubble(bubble);
  };

  const handleMouseLeave = () => {
    setHoveredBubble(null);
  };

  // Enhanced color palette
  const colors = [
    "#3b82f6",
    "#4f46e5",
    "#7c3aed",
    "#9333ea",
    "#c026d3",
    "#db2777",
    "#e11d48",
    "#dc2626",
    "#ea580c",
    "#d97706",
    "#ca8a04",
    "#65a30d",
    "#16a34a",
    "#0d9488",
    "#0891b2",
    "#0284c7",
    "#1d4ed8",
  ];

  // Generate wave path for water effect
  const generateWavePath = (centerX, centerY, radius, waveOffset = 0) => {
    const waveHeight = radius * 0.1;
    const waveWidth = radius * 2;
    const startX = centerX - radius;
    const endX = centerX + radius;

    const wave1 = Math.sin(waveOffset) * waveHeight;
    const wave2 = Math.sin(waveOffset + Math.PI / 2) * waveHeight;
    const wave3 = Math.sin(waveOffset + Math.PI) * waveHeight;
    const wave4 = Math.sin(waveOffset + (3 * Math.PI) / 2) * waveHeight;

    return `M ${startX} ${centerY + wave1}
            Q ${startX + waveWidth * 0.25} ${centerY + wave2} ${centerX} ${
      centerY + wave3
    }
            Q ${centerX + waveWidth * 0.25} ${centerY + wave4} ${endX} ${
      centerY + wave1
    }
            L ${endX} ${centerY + radius}
            L ${startX} ${centerY + radius}
            Z`;
  };

  const bubblePositions = generateResponsiveBubblePositions();

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] xl:h-[650px] overflow-hidden rounded-xl"
    >
      <svg
        width="100%"
        height="100%"
        className="cursor-pointer"
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Gradient definitions */}
          {data.map((_, index) => (
            <linearGradient
              key={`gradient-${index}`}
              id={`gradient-${index}`}
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop
                offset="0%"
                stopColor={colors[index % colors.length]}
                stopOpacity="0.9"
              />
              <stop
                offset="50%"
                stopColor={colors[index % colors.length]}
                stopOpacity="0.7"
              />
              <stop
                offset="100%"
                stopColor={colors[index % colors.length]}
                stopOpacity="0.4"
              />
            </linearGradient>
          ))}

          {/* Wave gradient for water effect */}
          {data.map((_, index) => (
            <linearGradient
              key={`wave-gradient-${index}`}
              id={`wave-gradient-${index}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={colors[index % colors.length]}
                stopOpacity="0.6"
              />
              <stop
                offset="100%"
                stopColor={colors[index % colors.length]}
                stopOpacity="0.8"
              />
            </linearGradient>
          ))}

          {/* Clip paths for each bubble */}
          {bubblePositions.map((bubble, index) => (
            <clipPath key={`clip-${index}`} id={`clip-${index}`}>
              <circle cx={bubble.x} cy={bubble.y} r={bubble.radius - 3} />
            </clipPath>
          ))}
        </defs>

        {bubblePositions.map((bubble, index) => {
          const progressPercentage =
            bubble.count > 0 ? (bubble.solved / bubble.count) * 100 : 0;
          const fillHeight = (progressPercentage / 100) * (bubble.radius * 1.8);
          const waterLevel = bubble.y + bubble.radius - fillHeight;

          return (
            <g key={`${bubble.name}-${index}`}>
              {/* Floating animation wrapper */}
              <motion.g
                animate={{
                  y: [0, -8, 0],
                  x: [0, 3, -3, 0],
                }}
                transition={{
                  duration: bubble.floatDuration,
                  delay: bubble.floatDelay,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                {/* Bubble background with subtle glow */}
                <circle
                  cx={bubble.x}
                  cy={bubble.y}
                  r={bubble.radius + 2}
                  fill={colors[index % colors.length]}
                  fillOpacity="0.1"
                  className="animate-pulse"
                />

                {/* Main bubble border */}
                <circle
                  cx={bubble.x}
                  cy={bubble.y}
                  r={bubble.radius}
                  fill="rgba(255, 255, 255, 0.1)"
                  stroke={colors[index % colors.length]}
                  strokeWidth="2"
                  className="transition-all duration-300 hover:stroke-4 hover:drop-shadow-lg"
                />

                {/* Animated water fill with waves */}
                <motion.path
                  d={generateWavePath(bubble.x, waterLevel, bubble.radius)}
                  fill={`url(#wave-gradient-${index})`}
                  clipPath={`url(#clip-${index})`}
                  animate={{
                    d: [
                      generateWavePath(bubble.x, waterLevel, bubble.radius, 0),
                      generateWavePath(
                        bubble.x,
                        waterLevel,
                        bubble.radius,
                        Math.PI
                      ),
                      generateWavePath(
                        bubble.x,
                        waterLevel,
                        bubble.radius,
                        Math.PI * 2
                      ),
                    ],
                  }}
                  transition={{
                    duration: 2 + bubble.waveDelay,
                    delay: bubble.waveDelay,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />

                {/* Additional wave layer for more realistic effect */}
                <motion.path
                  d={generateWavePath(bubble.x, waterLevel - 5, bubble.radius)}
                  fill={colors[index % colors.length]}
                  fillOpacity="0.3"
                  clipPath={`url(#clip-${index})`}
                  animate={{
                    d: [
                      generateWavePath(
                        bubble.x,
                        waterLevel - 5,
                        bubble.radius,
                        Math.PI
                      ),
                      generateWavePath(
                        bubble.x,
                        waterLevel - 5,
                        bubble.radius,
                        Math.PI * 2
                      ),
                      generateWavePath(
                        bubble.x,
                        waterLevel - 5,
                        bubble.radius,
                        Math.PI * 3
                      ),
                    ],
                  }}
                  transition={{
                    duration: 3 + bubble.waveDelay,
                    delay: bubble.waveDelay * 0.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />

                {/* Bubble highlight effect */}
                <ellipse
                  cx={bubble.x - bubble.radius * 0.3}
                  cy={bubble.y - bubble.radius * 0.3}
                  rx={bubble.radius * 0.3}
                  ry={bubble.radius * 0.2}
                  fill="rgba(255, 255, 255, 0.3)"
                  className="pointer-events-none"
                />

                {/* Interactive overlay */}
                <circle
                  cx={bubble.x}
                  cy={bubble.y}
                  r={bubble.radius}
                  fill="transparent"
                  className="cursor-pointer hover:fill-white hover:fill-opacity-10 transition-all duration-200"
                  onMouseMove={(e) => handleMouseMove(e, bubble)}
                />

                {/* Category label with responsive font size */}
                <text
                  x={bubble.x}
                  y={bubble.y - 8}
                  textAnchor="middle"
                  className="font-semibold fill-slate-700 dark:fill-slate-200 pointer-events-none select-none"
                  style={{
                    fontSize: Math.max(8, Math.min(14, bubble.radius / 4)),
                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  {bubble.shortName}
                </text>

                {/* Progress text with responsive font size */}
                <text
                  x={bubble.x}
                  y={bubble.y + 8}
                  textAnchor="middle"
                  className="font-bold fill-slate-800 dark:fill-slate-100 pointer-events-none select-none"
                  style={{
                    fontSize: Math.max(10, Math.min(16, bubble.radius / 3.5)),
                    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  {bubble.solved}/{bubble.count}
                </text>

                {/* Progress percentage */}
                <text
                  x={bubble.x}
                  y={bubble.y + 22}
                  textAnchor="middle"
                  className="font-medium fill-slate-600 dark:fill-slate-300 pointer-events-none select-none"
                  style={{
                    fontSize: Math.max(6, Math.min(12, bubble.radius / 6)),
                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  {progressPercentage.toFixed(0)}%
                </text>
              </motion.g>
            </g>
          );
        })}
      </svg>

      {/* Enhanced Responsive Tooltip */}
      {hoveredBubble && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="absolute pointer-events-none z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 max-w-[280px] sm:max-w-xs"
          style={{
            left: Math.min(
              tooltipPosition.x + 15,
              containerDimensions.width - 300
            ),
            top: Math.max(10, tooltipPosition.y - 80),
            transform:
              tooltipPosition.x > containerDimensions.width * 0.7
                ? "translateX(-100%)"
                : "none",
          }}
        >
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3 text-sm sm:text-base">
            {hoveredBubble.fullName}
          </h3>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                Total Questions:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {hoveredBubble.count}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                Solved:
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {hoveredBubble.solved}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                Progress:
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {hoveredBubble.count > 0
                  ? (
                      (hoveredBubble.solved / hoveredBubble.count) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">
              You solved {hoveredBubble.solved} out of {hoveredBubble.count}{" "}
              questions
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

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

  // Prepare data for bubble chart
  const bubbleChartData = sortedCategories.map((category) => {
    const categoryName = category.category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      name: categoryName,
      shortName:
        categoryName.length > 10
          ? categoryName.substring(0, 8) + "..."
          : categoryName,
      fullName: categoryName,
      count: category.count,
      solved:
        progressData?.categoryProgress?.find(
          (cp) => cp._id === category.category
        )?.solved || 0,
    };
  });

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
      className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 xl:px-8 py-4"
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
            {/* Floating Bubble Progress Chart */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
              <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6 text-center">
                🫧 Floating Progress Bubbles
              </h2>
              <FloatingBubbleChart data={bubbleChartData} />
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
