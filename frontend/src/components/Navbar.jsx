"use client";

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import avatar from "./avatar.png";
import {
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiSettings,
  FiTrendingUp,
  FiAward,
  FiTarget,
  FiStar,
  FiChevronDown,
  FiShield,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useQuery } from "react-query";
import axios from "axios";

// Custom Progress Bar Component
const ProgressBar = ({ solved, total, height = "h-3", className = "" }) => {
  const percentage = Math.min((solved / total) * 100, 100);

  return (
    <div
      className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${height} ${className}`}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch categories stats
  const { data: categoriesData } = useQuery(
    "categories",
    () => axios.get("/api/questions/stats/categories").then((res) => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch user progress if logged in
  const { data: progressData } = useQuery(
    "userProgress",
    () => axios.get("/api/progress").then((res) => res.data),
    {
      enabled: !!user,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Calculate total questions from categories data
  const totalQuestions =
    categoriesData?.categories?.reduce(
      (total, category) => total + category.count,
      0
    ) || 150;
  const totalSolved = progressData?.stats?.totalSolved || 0;
  const totalStarred = progressData?.stats?.totalStarred || 0;

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setShowUserMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/questions", label: "Questions", icon: "📝" },
    { path: "/about", label: "About us", icon: "ℹ️" },
  ];

  // Get display name with fallback
  const getDisplayName = () => {
    if (!user) return "";
    if (user.displayName) return user.displayName.split(" ")[0];
    return user.email ? user.email.split("@")[0] : "User";
  };

  // Get user level based on solved problems
  const getUserLevel = () => {
    if (totalSolved >= 100)
      return {
        level: "Expert",
        color: "text-purple-600",
        bg: "bg-purple-100 dark:bg-purple-900/30",
      };
    if (totalSolved >= 50)
      return {
        level: "Advanced",
        color: "text-blue-600",
        bg: "bg-blue-100 dark:bg-blue-900/30",
      };
    if (totalSolved >= 20)
      return {
        level: "Intermediate",
        color: "text-emerald-600",
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
      };
    return {
      level: "Beginner",
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    };
  };

  const userLevel = getUserLevel();

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              dark DSA
            </span>
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <motion.div
            className="flex items-center flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                dsa01
              </span>
            </Link>
          </motion.div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 px-8">
            <div className="flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                    isActive(link.path)
                      ? "text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </span>
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 rounded-full"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Enhanced Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <FiSun className="w-5 h-5" />
              ) : (
                <FiMoon className="w-5 h-5" />
              )}
            </motion.button>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm hover:shadow-md group"
                >
                  <div className="relative">
                    <img
                      src={avatar || "/placeholder.svg?height=40&width=40"}
                      alt={user.displayName || "User"}
                      className="w-10 h-10 rounded-full border-2 border-blue-500/30 shadow-lg object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                      {totalSolved > 99 ? "99+" : totalSolved}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-24 truncate">
                      {getDisplayName()}
                    </span>
                    <FiChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        showUserMenu ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 py-3 z-50 overflow-hidden"
                      style={{
                        maxHeight: "85vh",
                        overflowY: "auto",
                      }}
                    >
                      {/* Enhanced User Info Header */}
                      <div className="px-6 py-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-start space-x-4">
                          <div className="relative flex-shrink-0">
                            <img
                              src={
                                avatar || "/placeholder.svg?height=56&width=56"
                              }
                              alt={user.displayName || "User"}
                              className="w-14 h-14 rounded-full border-3 border-blue-500/30 shadow-lg object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                              {totalSolved > 99 ? "99+" : totalSolved}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate pr-2">
                                {user.displayName || user.email || "User"}
                              </h3>
                              {user.isAdmin && (
                                <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full font-medium flex-shrink-0">
                                  <FiShield className="w-3 h-3 mr-1" />
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate mb-2">
                              {user.email}
                            </p>
                            <div className="flex items-center">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userLevel.bg} ${userLevel.color}`}
                              >
                                <FiAward className="w-3 h-3 mr-1" />
                                {userLevel.level}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Progress Section */}
                      <div className="px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                            <FiTrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                            Progress Overview
                          </span>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {totalSolved}/{totalQuestions}
                          </span>
                        </div>
                        <ProgressBar
                          solved={totalSolved}
                          total={totalQuestions}
                          height="h-3"
                          className="mb-4"
                        />
                      </div>

                      {/* Enhanced Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center space-x-4 px-6 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-200 flex-shrink-0">
                            <FiUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold block">Profile</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              View your profile and stats
                            </p>
                          </div>
                        </Link>
                        {user.isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-4 px-6 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors duration-200 flex-shrink-0">
                              <FiSettings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <span className="font-semibold block">
                                Admin Panel
                              </span>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Manage platform settings
                              </p>
                            </div>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-4 w-full px-6 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                        >
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors duration-200 flex-shrink-0">
                            <FiLogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-semibold block">Logout</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Sign out of your account
                            </p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                >
                  Login
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Enhanced Mobile Right Side */}
          <div className="flex md:hidden items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <FiSun className="w-5 h-5" />
              ) : (
                <FiMoon className="w-5 h-5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg relative z-50"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Navigation Links */}
                <div className="space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                        isActive(link.path)
                          ? "text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-700/50 shadow-sm"
                          : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>

                {/* User Profile Section for Mobile */}
                {user && (
                  <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    {/* User Info Header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="relative flex-shrink-0">
                          <img
                            src={
                              avatar || "/placeholder.svg?height=48&width=48"
                            }
                            alt={user.displayName || "User"}
                            className="w-12 h-12 rounded-full border-3 border-blue-500/30 shadow-lg object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                            {totalSolved > 99 ? "99+" : totalSolved}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate pr-2">
                              {user.displayName || user.email || "User"}
                            </h3>
                            {user.isAdmin && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full font-medium flex-shrink-0">
                                <FiShield className="w-2.5 h-2.5 mr-0.5" />
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate mb-2">
                            {user.email}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${userLevel.bg} ${userLevel.color}`}
                          >
                            <FiAward className="w-3 h-3 mr-1" />
                            {userLevel.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="px-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                          <FiTrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                          Progress
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {totalSolved}/{totalQuestions}
                        </span>
                      </div>
                      <ProgressBar
                        solved={totalSolved}
                        total={totalQuestions}
                        height="h-2.5"
                        className="mb-3"
                      />
                      <div className="grid grid-cols-3 gap-3"></div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-1">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 rounded-xl"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                          <FiUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium block">Profile</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            View your profile and stats
                          </p>
                        </div>
                      </Link>
                      {user.isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 rounded-xl"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                            <FiSettings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium block">
                              Admin Panel
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Manage platform settings
                            </p>
                          </div>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-xl"
                      >
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg flex-shrink-0">
                          <FiLogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="font-medium block">Logout</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Sign out of your account
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Auth Links for Non-logged in Users */}
                {!user && (
                  <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-3">
                    <Link
                      to="/login"
                      className="block px-4 py-3 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
