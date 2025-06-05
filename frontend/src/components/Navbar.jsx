"use client";

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useQuery } from "react-query";
import axios from "axios";
import ProgressBar from "./ProgressBar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

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
    ) || 150; // Fallback to 150 if not loaded yet
  const totalSolved = progressData?.stats?.totalSolved || 0;

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setShowUserMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/questions", label: "Questions" },
  ];

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Mobile Progress */}
          <div className="flex items-center flex-1 md:flex-none">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent hidden sm:block">
                dark DSA
              </span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent sm:hidden">
                dark DSA
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 flex-1 mx-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                  isActive(link.path)
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <FiSun className="w-5 h-5" />
              ) : (
                <FiMoon className="w-5 h-5" />
              )}
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="relative">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-blue-500 dark:border-blue-400 shadow-sm"
                    />
                    {totalSolved > 0 && (
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-sm">
                        {totalSolved}
                      </div>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {user.name.split(" ")[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 py-1 z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-200/60 dark:border-slate-700/60">
                        <div className="text-sm font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {user.email}
                        </div>
                      </div>
                      <div className="px-4 py-3 border-b border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                          <span className="font-medium">Progress</span>
                          <span className="font-semibold">
                            {totalSolved}/{totalQuestions}
                          </span>
                        </div>
                        <ProgressBar
                          solved={totalSolved}
                          total={totalQuestions}
                          height="h-2"
                          className="mb-1"
                        />
                        <div className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
                          {Math.round((totalSolved / totalQuestions) * 100)}%
                          Complete
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiUser className="w-4 h-4" />
                        <span className="font-medium">Profile</span>
                      </Link>
                      {user.isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FiSettings className="w-4 h-4" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-200/60 dark:border-slate-700/60 py-4"
            >
              <div className="space-y-2 px-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? "text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50"
                        : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-3 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
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
