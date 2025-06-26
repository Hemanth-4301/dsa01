"use client";

import { useState, useEffect, useRef, useMemo, memo } from "react";
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
import debounce from "lodash/debounce";

// Custom Floating Bubble Chart Component
const FloatingBubbleChart = memo(({ data }) => {
  const [hoveredBubble, setHoveredBubble] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [containerDimensions, setContainerDimensions] = useState({
    width: 800,
    height: 500,
  });
  const containerRef = useRef(null);

  // Debounced resize handler
  const updateDimensions = useMemo(
    () =>
      debounce(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setContainerDimensions({ width: rect.width, height: rect.height });
        }
      }, 100),
    []
  );

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
      updateDimensions.cancel();
    };
  }, [updateDimensions]);

  const getResponsiveBubbleRadius = (count, screenWidth) => {
    const maxCount = Math.max(...data.map((d) => d.count));
    const minRadius = screenWidth < 640 ? 20 : screenWidth < 1024 ? 30 : 40;
    const maxRadius = screenWidth < 640 ? 40 : screenWidth < 1024 ? 60 : 80;
    return minRadius + (count / maxCount) * (maxRadius - minRadius);
  };

  const generateResponsiveBubblePositions = useMemo(() => {
    const { width, height } = containerDimensions;
    const positions = [];
    const cols =
      width < 640
        ? 3
        : width < 1024
        ? 4
        : Math.min(5, Math.ceil(Math.sqrt(data.length)));
    const rows = Math.ceil(data.length / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const maxRadius = getResponsiveBubbleRadius(
      Math.max(...data.map((d) => d.count)),
      width
    );

    data.forEach((item, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const baseX = (col + 0.5) * cellWidth;
      const baseY = (row + 0.5) * cellHeight;
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
        floatDelay: Math.random() * 2,
        floatDuration: 2 + Math.random(),
        waveDelay: Math.random(),
        ...item,
      });
    });

    return positions;
  }, [containerDimensions, data]);

  const handleMouseMove = useMemo(
    () =>
      debounce((event, bubble) => {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltipPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
        setHoveredBubble(bubble);
      }, 50),
    []
  );

  const handleMouseLeave = () => {
    setHoveredBubble(null);
    handleMouseMove.cancel();
  };

  const bubbleColors = [
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

  const waterColors = [
    "#60a5fa",
    "#7f9cf5",
    "#a78bfa",
    "#c084fc",
    "#d946ef",
    "#ec4899",
    "#f87171",
    "#ef4444",
    "#fb923c",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#14c4b2",
    "#22d3ee",
    "#38bdf8",
    "#3b82f6",
  ];

  const generateWavePath = (centerX, centerY, radius, waveOffset = 0) => {
    const waveHeight = radius * 0.1;
    const waveWidth = radius * 2;
    const startX = centerX - radius;
    const endX = centerX + radius;

    const wave1 = Math.sin(waveOffset) * waveHeight;
    const wave2 = Math.sin(waveOffset + Math.PI / 2) * waveHeight;

    return `M ${startX} ${centerY + wave1}
            Q ${startX + waveWidth * 0.25} ${
      centerY + wave2
    } ${centerX} ${centerY}
            Q ${centerX + waveWidth * 0.25} ${centerY - wave2} ${endX} ${
      centerY + wave1
    }
            L ${endX} ${centerY + radius}
            L ${startX} ${centerY + radius}
            Z`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px] overflow-hidden rounded-xl"
    >
      <svg
        width="100%"
        height="100%"
        className="cursor-pointer select-none"
        onMouseLeave={handleMouseLeave}
      >
        <defs>
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
                stopColor={bubbleColors[index % bubbleColors.length]}
                stopOpacity="0.15"
              />
              <stop
                offset="100%"
                stopColor={bubbleColors[index % bubbleColors.length]}
                stopOpacity="0.3"
              />
            </linearGradient>
          ))}
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
                stopColor={waterColors[index % waterColors.length]}
                stopOpacity="0.8"
              />
              <stop
                offset="100%"
                stopColor={waterColors[index % waterColors.length]}
                stopOpacity="1"
              />
            </linearGradient>
          ))}
          {generateResponsiveBubblePositions.map((bubble, index) => (
            <clipPath key={`clip-${index}`} id={`clip-${index}`}>
              <circle cx={bubble.x} cy={bubble.y} r={bubble.radius - 2} />
            </clipPath>
          ))}
          <filter
            id="water-shadow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {generateResponsiveBubblePositions.map((bubble, index) => {
          const progressPercentage =
            bubble.count > 0 ? (bubble.solved / bubble.count) * 100 : 0;
          const fillHeight = (progressPercentage / 100) * (bubble.radius * 1.8);
          const waterLevel = bubble.y + bubble.radius - fillHeight;

          return (
            <g key={`${bubble.name}-${index}`}>
              <motion.g
                animate={{
                  y: [0, -5, 0],
                  x: [0, 2, -2, 0],
                }}
                transition={{
                  duration: bubble.floatDuration,
                  delay: bubble.floatDelay,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <circle
                  cx={bubble.x}
                  cy={bubble.y}
                  r={bubble.radius}
                  fill={`url(#gradient-${index})`}
                  stroke={bubbleColors[index % bubbleColors.length]}
                  strokeWidth="2"
                  className="transition-all duration-200 hover:stroke-[3px] hover:drop-shadow-lg"
                />
                <motion.path
                  d={generateWavePath(bubble.x, waterLevel, bubble.radius)}
                  fill={`url(#wave-gradient-${index})`}
                  clipPath={`url(#clip-${index})`}
                  filter="url(#water-shadow)"
                  animate={{
                    d: [
                      generateWavePath(bubble.x, waterLevel, bubble.radius, 0),
                      generateWavePath(
                        bubble.x,
                        waterLevel,
                        bubble.radius,
                        Math.PI / 2
                      ),
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
                        Math.PI * 1.5
                      ),
                    ],
                  }}
                  transition={{
                    duration: 2,
                    delay: bubble.waveDelay,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <circle
                  cx={bubble.x}
                  cy={bubble.y}
                  r={bubble.radius}
                  fill="transparent"
                  className="cursor-pointer transition-colors duration-150 hover:fill-white/5"
                  onMouseMove={(e) => handleMouseMove(e, bubble)}
                />
                <text
                  x={bubble.x}
                  y={bubble.y - 6}
                  textAnchor="middle"
                  className="font-semibold fill-slate-800 dark:fill-slate-100 pointer-events-none"
                  style={{
                    fontSize: Math.max(8, Math.min(12, bubble.radius / 4)),
                  }}
                >
                  {bubble.shortName}
                </text>
                <text
                  x={bubble.x}
                  y={bubble.y + 6}
                  textAnchor="middle"
                  className="font-bold fill-slate-900 dark:fill-white pointer-events-none"
                  style={{
                    fontSize: Math.max(9, Math.min(14, bubble.radius / 3.5)),
                  }}
                >
                  {bubble.solved}/{bubble.count}
                </text>
              </motion.g>
            </g>
          );
        })}
      </svg>

      <AnimatePresence>
        {hoveredBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute pointer-events-none z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3 rounded-lg shadow-lg border border-slate-200/50 dark:border-slate-700/50 max-w-[250px]"
            style={{
              left: Math.min(
                tooltipPosition.x + 10,
                containerDimensions.width - 260
              ),
              top: Math.max(10, tooltipPosition.y - 70),
              transform:
                tooltipPosition.x > containerDimensions.width * 0.7
                  ? "translateX(-100%)"
                  : "none",
            }}
          >
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">
              {hoveredBubble.fullName}
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  Total:
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {hoveredBubble.count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  Solved:
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {hoveredBubble.solved}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  Progress:
                </span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: progressData, isLoading: progressLoading } = useQuery(
    "userProgress",
    () => axios.get("/api/progress").then((res) => res.data),
    { staleTime: 2 * 60 * 1000 }
  );

  const { data: starredData, isLoading: starredLoading } = useQuery(
    "starredQuestions",
    () => axios.get("/api/progress/starred").then((res) => res.data),
    { staleTime: 2 * 60 * 1000 }
  );

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    "categories",
    () => axios.get("/api/questions/stats/categories").then((res) => res.data),
    { staleTime: 5 * 60 * 1000 }
  );

  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: FiTrendingUp },
      { id: "starred", label: "Starred", icon: FiStar },
    ],
    []
  );

  const stats = progressData?.stats || {
    totalSolved: 0,
    totalAttempted: 0,
    totalStarred: 0,
  };

  const categoryOrder = useMemo(
    () => [
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
    ],
    []
  );

  const sortedCategories = useMemo(
    () =>
      categoriesData?.categories
        ? [...categoriesData.categories].sort(
            (a, b) =>
              categoryOrder.indexOf(a.category) -
              categoryOrder.indexOf(b.category)
          )
        : [],
    [categoriesData, categoryOrder]
  );

  const bubbleChartData = useMemo(
    () =>
      sortedCategories.map((category) => {
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
      }),
    [sortedCategories, progressData]
  );

  if (progressLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto"
    >
      <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-md border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <img
              src={user?.avatar || "/placeholder.svg?height=80&width=80"}
              alt={user?.name}
              className="w-16 sm:w-20 h-16 sm:h-20 rounded-full border-2 border-blue-500/20"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {stats.totalSolved}
              </span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
              {user?.name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <FiMail className="w-4 h-4 text-blue-500" />
                <span className="truncate max-w-[200px]">{user?.email}</span>
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

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
          className="bg-emerald-50/80 dark:bg-emerald-900/20 rounded-xl p-4 text-center border border-emerald-200/40 dark:border-emerald-700/40"
        >
          <div className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
            {stats.totalSolved}
          </div>
          <div className="text-sm text-emerald-700 dark:text-emerald-300">
            Problems Solved
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
          className="bg-amber-50/80 dark:bg-amber-900/20 rounded-xl p-4 text-center border border-amber-200/40 dark:border-amber-700/40"
        >
          <div className="text-3xl font-semibold text-amber-600 dark:text-amber-400">
            {stats.totalStarred}
          </div>
          <div className="text-sm text-amber-700 dark:text-amber-300">
            Questions Starred
          </div>
        </motion.div>
      </div>

      <div className="flex space-x-2 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center space-x-2 flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === "overview" && (
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-md border border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center">
                Progress Overview
              </h2>
              <FloatingBubbleChart data={bubbleChartData} />
            </div>
          )}

          {activeTab === "starred" && (
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-md border border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center">
                Starred Questions
              </h2>
              {starredLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-3">
                  {starredData?.starred?.map((item) => (
                    <motion.div
                      key={item._id}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg border border-slate-200/40 dark:border-slate-600/40 hover:border-blue-300/40 dark:hover:border-blue-600/40 transition-colors duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">
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
                      <div className="flex items-center space-x-2">
                        {item.status === "solved" && (
                          <FiTrendingUp className="w-4 h-4 text-emerald-500" />
                        )}
                        <FiStar className="w-4 h-4 text-amber-500 fill-current" />
                        <FiChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </motion.div>
                  ))}
                  {starredData?.starred?.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">⭐</div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No starred questions yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
