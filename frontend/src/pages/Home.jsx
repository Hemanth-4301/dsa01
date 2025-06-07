"use client";

import "../pages/App.css";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiChevronRight, FiPlay, FiPause, FiCode } from "react-icons/fi";
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

// Enhanced code examples with better structure
const codeExamples = [
  {
    title: "Two Sum Problem",
    language: "Python",
    difficulty: "Easy",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    category: "Hash Table",
    code: `def two_sum(nums, target):
    """
    Find two numbers that add up to target
    Time: O(n), Space: O(n)
    """
    seen = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in seen:
            return [seen[complement], i]
        
        seen[num] = i
    
    return []

# Example usage
nums = [2, 7, 11, 15]
target = 9
result = two_sum(nums, target)
print(f"Indices: {result}")  # Output: [0, 1]`,
  },
  {
    title: "Generate Parentheses",
    language: "Python",
    difficulty: "Medium",
    timeComplexity: "O(4^n / √n)",
    spaceComplexity: "O(4^n / √n)",
    category: "Backtracking",
    code: `def generate_parentheses(n):
    """
    Generate all valid parentheses combinations
    Time: O(4^n / sqrt(n)), Space: O(4^n / sqrt(n))
    """
    result = []
    
    def backtrack(current, open_count, close_count):
        # Base case: valid combination found
        if len(current) == 2 * n:
            result.append(current)
            return
        
        # Add opening parenthesis
        if open_count < n:
            backtrack(current + "(", open_count + 1, close_count)
        
        # Add closing parenthesis
        if close_count < open_count:
            backtrack(current + ")", open_count, close_count + 1)
    
    backtrack("", 0, 0)
    return result

# Example usage
n = 3
combinations = generate_parentheses(n)
print(combinations)`,
  },
  {
    title: "Binary Tree Inorder",
    language: "Python",
    difficulty: "Easy",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    category: "Tree Traversal",
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorder_traversal(root):
    """
    Inorder traversal: Left -> Root -> Right
    Time: O(n), Space: O(h) where h is height
    """
    result = []
    
    def inorder(node):
        if not node:
            return
        
        inorder(node.left)   # Visit left subtree
        result.append(node.val)  # Visit root
        inorder(node.right)  # Visit right subtree
    
    inorder(root)
    return result

# Example usage
root = TreeNode(1, None, TreeNode(2, TreeNode(3), None))
print(inorder_traversal(root))  # Output: [1, 3, 2]`,
  },
];

// Syntax highlighting function
const highlightSyntax = (code) => {
  const tokens = [];
  const lines = code.split("\n");

  lines.forEach((line, lineIndex) => {
    const lineTokens = [];
    let currentIndex = 0;

    // Keywords
    const keywords = [
      "def",
      "class",
      "if",
      "else",
      "elif",
      "for",
      "while",
      "return",
      "in",
      "not",
      "and",
      "or",
      "True",
      "False",
      "None",
      "import",
      "from",
    ];
    const builtins = [
      "print",
      "len",
      "range",
      "enumerate",
      "append",
      "pop",
      "str",
      "int",
      "float",
      "list",
      "dict",
    ];

    // Process each character in the line
    while (currentIndex < line.length) {
      const char = line[currentIndex];

      // Skip whitespace
      if (/\s/.test(char)) {
        lineTokens.push({ type: "whitespace", value: char });
        currentIndex++;
        continue;
      }

      // Comments
      if (char === "#") {
        lineTokens.push({ type: "comment", value: line.slice(currentIndex) });
        break;
      }

      // Strings
      if (char === '"' || char === "'") {
        const quote = char;
        let stringValue = quote;
        currentIndex++;

        while (currentIndex < line.length && line[currentIndex] !== quote) {
          stringValue += line[currentIndex];
          currentIndex++;
        }

        if (currentIndex < line.length) {
          stringValue += line[currentIndex];
          currentIndex++;
        }

        lineTokens.push({ type: "string", value: stringValue });
        continue;
      }

      // Numbers
      if (/\d/.test(char)) {
        let numberValue = "";
        while (currentIndex < line.length && /[\d.]/.test(line[currentIndex])) {
          numberValue += line[currentIndex];
          currentIndex++;
        }
        lineTokens.push({ type: "number", value: numberValue });
        continue;
      }

      // Identifiers and keywords
      if (/[a-zA-Z_]/.test(char)) {
        let identifier = "";
        while (
          currentIndex < line.length &&
          /[a-zA-Z0-9_]/.test(line[currentIndex])
        ) {
          identifier += line[currentIndex];
          currentIndex++;
        }

        let type = "identifier";
        if (keywords.includes(identifier)) {
          type = "keyword";
        } else if (builtins.includes(identifier)) {
          type = "builtin";
        }

        lineTokens.push({ type, value: identifier });
        continue;
      }

      // Operators and punctuation
      lineTokens.push({ type: "operator", value: char });
      currentIndex++;
    }

    tokens.push(lineTokens);
  });

  return tokens;
};

// Enhanced Typing Animation Component with Mobile Responsiveness
const CodeTypingAnimation = () => {
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [displayedCode, setDisplayedCode] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const currentExample = codeExamples[currentExampleIndex];
  const typingSpeed = 20;

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isPaused || !isTyping) return;

    const timer = setTimeout(() => {
      if (currentCharIndex < currentExample.code.length) {
        setDisplayedCode(currentExample.code.slice(0, currentCharIndex + 1));
        setCurrentCharIndex(currentCharIndex + 1);
      } else {
        setTimeout(() => {
          setCurrentExampleIndex((prev) => (prev + 1) % codeExamples.length);
          setDisplayedCode("");
          setCurrentCharIndex(0);
        }, 3000);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentCharIndex, currentExample.code, isPaused, isTyping]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetAnimation = () => {
    setCurrentExampleIndex(0);
    setDisplayedCode("");
    setCurrentCharIndex(0);
    setIsTyping(true);
    setIsPaused(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "Medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "Hard":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  // Render highlighted code with mobile responsiveness
  const renderHighlightedCode = () => {
    const tokens = highlightSyntax(displayedCode);

    return (
      <div
        className={`font-mono leading-relaxed overflow-x-auto ${
          isMobile ? "text-xs" : "text-sm"
        }`}
      >
        {tokens.map((lineTokens, lineIndex) => (
          <div key={lineIndex} className="min-h-[1.4em] whitespace-nowrap">
            {lineTokens.map((token, tokenIndex) => {
              let className = "text-gray-100";

              switch (token.type) {
                case "keyword":
                  className = "text-purple-400 font-semibold";
                  break;
                case "string":
                  className = "text-green-400";
                  break;
                case "comment":
                  className = "text-gray-500 italic";
                  break;
                case "number":
                  className = "text-orange-400";
                  break;
                case "builtin":
                  className = "text-cyan-400";
                  break;
                case "operator":
                  className = "text-pink-400";
                  break;
                case "identifier":
                  className = "text-blue-300";
                  break;
                default:
                  className = "text-gray-100";
              }

              return (
                <span key={tokenIndex} className={className}>
                  {token.value}
                </span>
              );
            })}
          </div>
        ))}
        {currentCharIndex < currentExample.code.length && (
          <span className="animate-pulse bg-white text-black ml-0.5 inline-block w-2">
            |
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Terminal Container - Enhanced Mobile Responsiveness */}
      <div className="bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-gray-800 backdrop-blur-sm relative">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-pulse"></div>
        </div>

        {/* Enhanced Terminal Header - Mobile Responsive */}
        <div className="relative z-10 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="flex space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
              <div
                className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full shadow-lg animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full shadow-lg animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <FiCode className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span className="text-white text-xs sm:text-sm font-semibold truncate">
                {currentExample.title}
              </span>
              {!isMobile && (
                <>
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                      currentExample.difficulty
                    )}`}
                  >
                    {currentExample.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                    {currentExample.category}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <button
              onClick={togglePause}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 transition-all duration-200 text-gray-400 hover:text-white group"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? (
                <FiPlay className="w-3 h-3 sm:w-4 sm:h-4 group-hover:text-green-400 transition-colors" />
              ) : (
                <FiPause className="w-3 h-3 sm:w-4 sm:h-4 group-hover:text-yellow-400 transition-colors" />
              )}
            </button>
            {!isMobile && (
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span className="px-2 py-1 bg-gray-800 rounded border border-gray-700">
                  {currentExample.language}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile-specific info bar */}
        {isMobile && (
          <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                    currentExample.difficulty
                  )}`}
                >
                  {currentExample.difficulty}
                </span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                  {currentExample.category}
                </span>
              </div>
              <span className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-gray-400">
                {currentExample.language}
              </span>
            </div>
          </div>
        )}

        {/* Enhanced Code Content - Mobile Responsive */}
        <div className="relative">
          <div
            className={`p-3 sm:p-6 overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black ${
              isMobile ? "h-64 sm:h-80" : "h-80 sm:h-96"
            }`}
          >
            {/* Line numbers */}
            <div className="flex">
              <div
                className={`flex flex-col text-gray-600 mr-2 sm:mr-4 select-none ${
                  isMobile ? "text-xs" : "text-xs"
                }`}
              >
                {displayedCode.split("\n").map((_, index) => (
                  <div
                    key={index}
                    className={`h-[1.4em] flex items-center justify-end ${
                      isMobile ? "w-6" : "w-8"
                    }`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              <div className="flex-1 overflow-x-auto">
                {renderHighlightedCode()}
              </div>
            </div>
          </div>

          {/* Enhanced Progress Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-100 shadow-lg relative overflow-hidden"
              style={{
                width: `${
                  (currentCharIndex / currentExample.code.length) * 100
                }%`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>

          {/* Enhanced Floating Particles - Reduced for mobile */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(isMobile ? 6 : 12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute border border-white/10 rounded-full"
                style={{
                  width: `${80 + i * 20}px`,
                  height: `${80 + i * 20}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, 150, -150, 0],
                  y: [0, -150, 150, 0],
                  rotate: [0, 180, 360],
                  scale: [1, 1.3, 0.8, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 25 + i * 5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Footer - Mobile Responsive */}
        <div className="relative z-10 px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 sm:space-x-2">
              {codeExamples.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentExampleIndex(index);
                    setDisplayedCode("");
                    setCurrentCharIndex(0);
                  }}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === currentExampleIndex
                      ? "bg-blue-500 shadow-lg shadow-blue-500/50 scale-125"
                      : "bg-gray-600 hover:bg-gray-500 hover:scale-110"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={resetAnimation}
                className="text-xs text-gray-400 hover:text-white transition-colors px-2 sm:px-3 py-1 rounded-md hover:bg-gray-800"
              >
                Reset
              </button>
              <div className="text-xs text-gray-500">
                {currentExampleIndex + 1} / {codeExamples.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Problem Info - Mobile Responsive */}
      <motion.div
        className="mt-4 sm:mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3
          className={`font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent mb-3 ${
            isMobile ? "text-lg" : "text-2xl"
          }`}
        >
          {currentExample.title}
        </h3>
      </motion.div>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();

  // Fetch categories stats
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    "categories",
    () => axios.get("/api/questions/stats/categories").then((res) => res.data),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  // Fetch user progress if logged in
  const { data: progressData, isLoading: progressLoading } = useQuery(
    "userProgress",
    () => axios.get("/api/progress").then((res) => res.data),
    {
      enabled: !!user,
      staleTime: 2 * 60 * 1000,
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
    ) || 150;
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
      color: "#10b981",
      gradient: ["#10b981", "#059669"],
      icon: "✅",
    },
    {
      name: "Starred",
      value: totalStarred,
      color: "#f59e0b",
      gradient: ["#f59e0b", "#d97706"],
      icon: "⭐",
    },
    {
      name: "Remaining",
      value: totalRemaining,
      color: "#64748b",
      gradient: ["#64748b", "#475569"],
      icon: "📝",
    },
  ].filter((item) => item.value > 0);

  // Custom tooltip for category chart
  const CustomCategoryTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2 sm:mb-6">
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
            <span className="text-lg sm:text-xl">{data.icon}</span>
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 sm:space-y-12"
    >
      {/* Enhanced Hero Section with Black-White Theme */}
      <section id="hero">
        <motion.div
          className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl border border-gray-800 mb-8 sm:mb-10 shadow-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Enhanced Animated Grid Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-blue-500/10"></div>
          </div>

          {/* Enhanced Floating Geometric Shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute border border-white/10 rounded-full"
                style={{
                  width: `${80 + i * 20}px`,
                  height: `${80 + i * 20}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, 150, -150, 0],
                  y: [0, -150, 150, 0],
                  rotate: [0, 180, 360],
                  scale: [1, 1.3, 0.8, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 25 + i * 5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Spotlight Effect */}
          <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent"></div>

          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
                {/* Enhanced Left section */}
                <motion.div
                  className="flex-1 w-full lg:max-w-2xl"
                  variants={itemVariants}
                >
                  <motion.div
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-white/10 to-gray-800/50 text-white mb-6 shadow-lg border border-white/20 backdrop-blur-sm"
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 20px rgba(255,255,255,0.2)",
                    }}
                  >
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                    ✨ Learn DSA with {totalQuestions - 3}+ Curated Problems
                  </motion.div>

                  <motion.h1
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight"
                    variants={itemVariants}
                  >
                    <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                      Code Your Way to
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Excellence
                    </span>
                  </motion.h1>

                  <motion.p
                    className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl leading-relaxed"
                    variants={itemVariants}
                  >
                    Transform your coding journey with our interactive platform.
                    Practice and learn essential algorithms, conquer data
                    structures, and ace technical interviews with confidence.
                  </motion.p>

                  <motion.div
                    className="flex flex-col sm:flex-row gap-4 mb-8"
                    variants={itemVariants}
                  >
                    <motion.a
                      href="#categories"
                      className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-black bg-white hover:bg-gray-100 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 20px 40px rgba(255,255,255,0.3)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Start Learning
                      <FiChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  </motion.div>

                  {/* Enhanced Stats Row */}
                </motion.div>

                {/* Right section - Enhanced Code Typing Animation */}
                <motion.div
                  className="flex-1 w-full max-w-4xl"
                  variants={itemVariants}
                >
                  <CodeTypingAnimation />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Enhanced Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
        </motion.div>
      </section>

      {/* User Stats Section - REORDERED: Progress Overview First, then Questions by Category */}
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
                {/* Progress Overview Pie Chart - MOVED TO TOP */}
                <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                  <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6 text-center">
                    🎯 Progress Overview
                  </h3>
                  <div className="flex flex-col xl:flex-row items-center justify-center gap-6 sm:gap-8">
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

                {/* Questions by Category Bar Chart - MOVED TO BOTTOM */}
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
