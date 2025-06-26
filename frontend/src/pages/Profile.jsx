"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

// Enhanced Floating Bubble Chart Component
const EnhancedFloatingBubbleChart = ({ data }) => {
  const [hoveredBubble, setHoveredBubble] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [containerDimensions, setContainerDimensions] = useState({
    width: 800,
    height: 500,
  });
  const containerRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Debounced hover handler to prevent glitches
  const debouncedSetHoveredBubble = useCallback((bubble) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredBubble(bubble);
    }, 50);
  }, []);

  // Update container dimensions with debouncing
  useEffect(() => {
    let resizeTimeout;
    const updateDimensions = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setContainerDimensions({ width: rect.width, height: rect.height });
        }
      }, 100);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Enhanced responsive bubble sizing with smoother scaling
  const getResponsiveBubbleRadius = (count, screenWidth) => {
    const maxCount = Math.max(...data.map((d) => d.count));
    const ratio = count / maxCount;
    let minRadius, maxRadius;

    if (screenWidth < 480) {
      // Extra small mobile
      minRadius = 20;
      maxRadius = 35;
    } else if (screenWidth < 640) {
      // Small mobile
      minRadius = 25;
      maxRadius = 40;
    } else if (screenWidth < 768) {
      // Large mobile
      minRadius = 30;
      maxRadius = 50;
    } else if (screenWidth < 1024) {
      // Tablet
      minRadius = 35;
      maxRadius = 60;
    } else if (screenWidth < 1280) {
      // Small desktop
      minRadius = 40;
      maxRadius = 70;
    } else {
      // Large desktop
      minRadius = 45;
      maxRadius = 85;
    }

    return minRadius + ratio * (maxRadius - minRadius);
  };

  // Enhanced responsive positioning with better spacing
  const generateResponsiveBubblePositions = () => {
    const { width, height } = containerDimensions;
    const positions = [];

    // More granular responsive grid
    let cols, padding;
    if (width < 480) {
      cols = 2;
      padding = 15;
    } else if (width < 640) {
      cols = 3;
      padding = 20;
    } else if (width < 768) {
      cols = 3;
      padding = 25;
    } else if (width < 1024) {
      cols = 4;
      padding = 30;
    } else if (width < 1280) {
      cols = 4;
      padding = 35;
    } else {
      cols = 5;
      padding = 40;
    }

    const rows = Math.ceil(data.length / cols);
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;

    data.forEach((item, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      const radius = getResponsiveBubbleRadius(item.count, width);

      // Calculate position with better spacing
      const baseX = padding + (col + 0.5) * cellWidth;
      const baseY = padding + (row + 0.5) * cellHeight;

      // Reduced randomness for more stable positioning
      const offsetX = (Math.random() - 0.5) * Math.min(cellWidth * 0.15, 15);
      const offsetY = (Math.random() - 0.5) * Math.min(cellHeight * 0.15, 15);

      positions.push({
        x: Math.max(radius + 5, Math.min(width - radius - 5, baseX + offsetX)),
        y: Math.max(radius + 5, Math.min(height - radius - 5, baseY + offsetY)),
        radius,
        floatDelay: index * 0.2, // More predictable delays
        floatDuration: 4 + (index % 3), // Varied but consistent durations
        waveDelay: index * 0.3,
        ...item,
      });
    });

    return positions;
  };

  // Smooth hover handlers
  const handleMouseEnter = useCallback(
    (event, bubble) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltipPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
        debouncedSetHoveredBubble(bubble);
      }
    },
    [debouncedSetHoveredBubble]
  );

  const handleMouseMove = useCallback(
    (event, bubble) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && hoveredBubble?.name === bubble.name) {
        setTooltipPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    },
    [hoveredBubble]
  );

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredBubble(null);
  }, []);

  // Beautiful color palette with gradients
  const colorPalette = [
    { primary: "#6366f1", secondary: "#8b5cf6", accent: "#a855f7" },
    { primary: "#3b82f6", secondary: "#6366f1", accent: "#8b5cf6" },
    { primary: "#06b6d4", secondary: "#3b82f6", accent: "#6366f1" },
    { primary: "#10b981", secondary: "#06b6d4", accent: "#3b82f6" },
    { primary: "#84cc16", secondary: "#10b981", accent: "#06b6d4" },
    { primary: "#eab308", secondary: "#84cc16", accent: "#10b981" },
    { primary: "#f59e0b", secondary: "#eab308", accent: "#84cc16" },
    { primary: "#ef4444", secondary: "#f59e0b", accent: "#eab308" },
    { primary: "#ec4899", secondary: "#ef4444", accent: "#f59e0b" },
    { primary: "#8b5cf6", secondary: "#ec4899", accent: "#ef4444" },
    { primary: "#6366f1", secondary: "#8b5cf6", accent: "#ec4899" },
    { primary: "#3b82f6", secondary: "#6366f1", accent: "#8b5cf6" },
    { primary: "#06b6d4", secondary: "#3b82f6", accent: "#6366f1" },
    { primary: "#10b981", secondary: "#06b6d4", accent: "#3b82f6" },
    { primary: "#84cc16", secondary: "#10b981", accent: "#06b6d4" },
    { primary: "#eab308", secondary: "#84cc16", accent: "#10b981" },
    { primary: "#f59e0b", secondary: "#eab308", accent: "#84cc16" },
  ];

  // Enhanced wave path generation
  const generateSmoothWavePath = (
    centerX,
    centerY,
    radius,
    waveOffset = 0,
    amplitude = 0.08
  ) => {
    const waveHeight = radius * amplitude;
    const points = 8;
    const angleStep = (Math.PI * 2) / points;

    let path = `M ${centerX - radius} ${
      centerY + Math.sin(waveOffset) * waveHeight
    }`;

    for (let i = 1; i <= points; i++) {
      const angle = i * angleStep;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(waveOffset + angle * 2) * waveHeight;

      if (i === 1) {
        path += ` Q ${centerX - radius * 0.5} ${y} ${x} ${y}`;
      } else {
        const prevAngle = (i - 1) * angleStep;
        const prevX = centerX + Math.cos(prevAngle) * radius;
        const controlX = (prevX + x) / 2;
        const controlY =
          centerY +
          Math.sin(waveOffset + ((prevAngle + angle) / 2) * 2) * waveHeight;
        path += ` Q ${controlX} ${controlY} ${x} ${y}`;
      }
    }

    path += ` L ${centerX + radius} ${centerY + radius} L ${centerX - radius} ${
      centerY + radius
    } Z`;
    return path;
  };

  const bubblePositions = generateResponsiveBubblePositions();

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300px] xs:h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px] 2xl:h-[600px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50"
    >
      <svg
        width="100%"
        height="100%"
        className="cursor-pointer"
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Enhanced gradient definitions */}
          {bubblePositions.map((_, index) => {
            const colors = colorPalette[index % colorPalette.length];
            return (
              <g key={`gradients-${index}`}>
                <radialGradient
                  id={`bubble-gradient-${index}`}
                  cx="30%"
                  cy="30%"
                >
                  <stop
                    offset="0%"
                    stopColor={colors.primary}
                    stopOpacity="0.1"
                  />
                  <stop
                    offset="70%"
                    stopColor={colors.secondary}
                    stopOpacity="0.3"
                  />
                  <stop
                    offset="100%"
                    stopColor={colors.accent}
                    stopOpacity="0.5"
                  />
                </radialGradient>

                <linearGradient
                  id={`water-gradient-${index}`}
                  x1="0%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor={colors.primary}
                    stopOpacity="0.8"
                  />
                  <stop
                    offset="50%"
                    stopColor={colors.secondary}
                    stopOpacity="0.6"
                  />
                  <stop
                    offset="100%"
                    stopColor={colors.accent}
                    stopOpacity="0.4"
                  />
                </linearGradient>

                <linearGradient
                  id={`border-gradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={colors.primary} />
                  <stop offset="50%" stopColor={colors.secondary} />
                  <stop offset="100%" stopColor={colors.accent} />
                </linearGradient>
              </g>
            );
          })}

          {/* Clip paths */}
          {bubblePositions.map((bubble, index) => (
            <clipPath key={`clip-${index}`} id={`clip-${index}`}>
              <circle cx={bubble.x} cy={bubble.y} r={bubble.radius - 2} />
            </clipPath>
          ))}

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {bubblePositions.map((bubble, index) => {
          const progressPercentage =
            bubble.count > 0 ? (bubble.solved / bubble.count) * 100 : 0;
          const fillHeight = (progressPercentage / 100) * (bubble.radius * 1.6);
          const waterLevel = bubble.y + bubble.radius - fillHeight;
          const colors = colorPalette[index % colorPalette.length];
          const isHovered = hoveredBubble?.name === bubble.name;

          return (
            <motion.g
              key={`${bubble.name}-${index}`}
              animate={{
                y: [0, -6, 0],
                x: [0, 2, -2, 0],
              }}
              transition={{
                duration: bubble.floatDuration,
                delay: bubble.floatDelay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              {/* Outer glow effect */}
              <circle
                cx={bubble.x}
                cy={bubble.y}
                r={bubble.radius + 8}
                fill={`url(#bubble-gradient-${index})`}
                className="animate-pulse"
                style={{ animationDuration: `${3 + (index % 2)}s` }}
              />

              {/* Main bubble background */}
              <circle
                cx={bubble.x}
                cy={bubble.y}
                r={bubble.radius}
                fill="rgba(255, 255, 255, 0.1)"
                stroke={`url(#border-gradient-${index})`}
                strokeWidth={isHovered ? "3" : "2"}
                className="transition-all duration-300 ease-out"
                filter={isHovered ? "url(#glow)" : "none"}
              />

              {/* Animated water fill with enhanced waves */}
              <motion.path
                d={generateSmoothWavePath(
                  bubble.x,
                  waterLevel,
                  bubble.radius,
                  0
                )}
                fill={`url(#water-gradient-${index})`}
                clipPath={`url(#clip-${index})`}
                animate={{
                  d: [
                    generateSmoothWavePath(
                      bubble.x,
                      waterLevel,
                      bubble.radius,
                      0
                    ),
                    generateSmoothWavePath(
                      bubble.x,
                      waterLevel,
                      bubble.radius,
                      Math.PI
                    ),
                    generateSmoothWavePath(
                      bubble.x,
                      waterLevel,
                      bubble.radius,
                      Math.PI * 2
                    ),
                  ],
                }}
                transition={{
                  duration: 3 + bubble.waveDelay,
                  delay: bubble.waveDelay,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />

              {/* Secondary wave layer */}
              <motion.path
                d={generateSmoothWavePath(
                  bubble.x,
                  waterLevel - 3,
                  bubble.radius * 0.95,
                  Math.PI
                )}
                fill={colors.primary}
                fillOpacity="0.2"
                clipPath={`url(#clip-${index})`}
                animate={{
                  d: [
                    generateSmoothWavePath(
                      bubble.x,
                      waterLevel - 3,
                      bubble.radius * 0.95,
                      Math.PI
                    ),
                    generateSmoothWavePath(
                      bubble.x,
                      waterLevel - 3,
                      bubble.radius * 0.95,
                      Math.PI * 2
                    ),
                    generateSmoothWavePath(
                      bubble.x,
                      waterLevel - 3,
                      bubble.radius * 0.95,
                      Math.PI * 3
                    ),
                  ],
                }}
                transition={{
                  duration: 4 + bubble.waveDelay * 0.5,
                  delay: bubble.waveDelay * 0.7,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />

              {/* Interactive overlay with smooth hover */}
              <circle
                cx={bubble.x}
                cy={bubble.y}
                r={bubble.radius}
                fill="transparent"
                className="cursor-pointer transition-all duration-200 ease-out"
                onMouseEnter={(e) => handleMouseEnter(e, bubble)}
                onMouseMove={(e) => handleMouseMove(e, bubble)}
                style={{
                  filter: isHovered
                    ? "drop-shadow(0 0 20px rgba(99, 102, 241, 0.3))"
                    : "none",
                }}
              />

              {/* Responsive text labels */}
              <text
                x={bubble.x}
                y={bubble.y - bubble.radius * 0.15}
                textAnchor="middle"
                className="font-bold fill-slate-700 dark:fill-slate-200 pointer-events-none select-none transition-all duration-200"
                style={{
                  fontSize: Math.max(8, Math.min(16, bubble.radius / 3.5)),
                  filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))",
                }}
              >
                {bubble.shortName}
              </text>

              <text
                x={bubble.x}
                y={bubble.y + bubble.radius * 0.1}
                textAnchor="middle"
                className="font-extrabold fill-slate-800 dark:fill-slate-100 pointer-events-none select-none transition-all duration-200"
                style={{
                  fontSize: Math.max(10, Math.min(18, bubble.radius / 3)),
                  filter: "drop-shadow(1px 1px 3px rgba(0,0,0,0.5))",
                }}
              >
                {bubble.solved}/{bubble.count}
              </text>

              <text
                x={bubble.x}
                y={bubble.y + bubble.radius * 0.35}
                textAnchor="middle"
                className="font-semibold fill-slate-600 dark:fill-slate-300 pointer-events-none select-none transition-all duration-200"
                style={{
                  fontSize: Math.max(6, Math.min(14, bubble.radius / 5)),
                  filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))",
                }}
              >
                {progressPercentage.toFixed(0)}%
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Enhanced Tooltip with AnimatePresence */}
      <AnimatePresence>
        {hoveredBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute pointer-events-none z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 max-w-[280px] sm:max-w-xs"
            style={{
              left: Math.min(
                Math.max(10, tooltipPosition.x + 15),
                containerDimensions.width - 300
              ),
              top: Math.max(10, tooltipPosition.y - 100),
            }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${
                    colorPalette[
                      data.findIndex((d) => d.name === hoveredBubble.name) %
                        colorPalette.length
                    ]?.primary
                  }, ${
                    colorPalette[
                      data.findIndex((d) => d.name === hoveredBubble.name) %
                        colorPalette.length
                    ]?.secondary
                  })`,
                }}
              />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                {hoveredBubble.fullName}
              </h3>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Total Questions:
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {hoveredBubble.count}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Solved:
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {hoveredBubble.solved}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
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

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  You solved {hoveredBubble.solved} out of {hoveredBubble.count}{" "}
                  questions
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
        categoryName.length > 8
          ? categoryName.substring(0, 6) + "..."
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
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 xl:px-8 py-4 max-w-7xl mx-auto"
    >
      {/* Enhanced Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-200/60 dark:border-slate-700/60"
      >
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src={user?.avatar || "/placeholder.svg?height=80&width=80"}
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-4 border-blue-500/20 shadow-xl"
            />
            <motion.div
              className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <span className="text-white text-xs sm:text-sm font-bold">
                {stats.totalSolved}
              </span>
            </motion.div>
          </motion.div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
              {user?.name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <FiMail className="w-4 h-4 text-blue-500" />
                <span className="truncate max-w-[200px] sm:max-w-none">
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
      </motion.div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-4 sm:p-6 lg:p-8 text-center shadow-xl border border-emerald-200/50 dark:border-emerald-700/50"
        >
          <motion.div
            className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            {stats.totalSolved}
          </motion.div>
          <div className="text-xs sm:text-sm lg:text-base text-emerald-700 dark:text-emerald-300 font-semibold">
            Problems Solved
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 sm:p-6 lg:p-8 text-center shadow-xl border border-amber-200/50 dark:border-amber-700/50"
        >
          <motion.div
            className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 3,
              delay: 0.5,
              repeat: Number.POSITIVE_INFINITY,
            }}
          >
            {stats.totalStarred}
          </motion.div>
          <div className="text-xs sm:text-sm lg:text-base text-amber-700 dark:text-amber-300 font-semibold">
            Questions Starred
          </div>
        </motion.div>
      </div>

      {/* Enhanced Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex space-x-1 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-xl p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-center space-x-2 flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl scale-105"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
            }`}
          >
            <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Enhanced Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Enhanced Floating Bubble Chart */}
              <div className="bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-200/60 dark:border-slate-700/60">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6 lg:mb-8 text-center">
                  🫧 Interactive Progress Bubbles
                </h2>
                <EnhancedFloatingBubbleChart data={bubbleChartData} />
              </div>
            </motion.div>
          )}

          {activeTab === "starred" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-200/60 dark:border-slate-700/60"
            >
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6 lg:mb-8 text-center">
                ⭐ Starred Questions
              </h2>
              {starredLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {starredData?.starred?.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="flex items-center justify-between p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-600/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900 dark:text-white truncate mb-1">
                          {item.questionId.problem}
                        </h3>
                        <div className="flex items-center space-x-2">
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
                          <motion.span
                            className="text-emerald-500"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                            }}
                          >
                            <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                          </motion.span>
                        )}
                        <FiStar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-current" />
                        <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                      </div>
                    </motion.div>
                  ))}
                  {starredData?.starred?.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 lg:py-16"
                    >
                      <motion.div
                        className="text-4xl sm:text-6xl lg:text-8xl mb-4"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{
                          duration: 4,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                      >
                        ⭐
                      </motion.div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base lg:text-lg">
                        No starred questions yet. Star questions to save them
                        for later!
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
