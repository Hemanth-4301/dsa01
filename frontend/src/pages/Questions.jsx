"use client";

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiArrowLeft,
  FiGrid,
  FiList,
  FiTrendingUp,
} from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import QuestionCard from "../components/QuestionCard";
import LoadingSpinner from "../components/LoadingSpinner";

const Questions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    searchParams.get("difficulty") || ""
  );
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
    setSearchParams(params);
  }, [searchTerm, selectedCategory, selectedDifficulty, setSearchParams]);

  const { data: questionsData, isLoading: questionsLoading } = useQuery(
    [
      "questions",
      {
        search: searchTerm,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        page,
      },
    ],
    () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);

      return axios.get(`/api/questions?${params}`).then((res) => res.data);
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    }
  );

  const sortedQuestions = questionsData?.questions?.sort((a, b) => {
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });

  const { data: progressData, isLoading: progressLoading } = useQuery(
    "userProgress",
    () => axios.get("/api/progress").then((res) => res.data),
    {
      enabled: !!user,
      staleTime: 2 * 60 * 1000,
    }
  );

  const { data: categoriesData } = useQuery(
    "categories",
    () => axios.get("/api/questions/stats/categories").then((res) => res.data),
    {
      staleTime: 10 * 60 * 1000,
    }
  );

  const updateProgressMutation = useMutation(
    ({ questionId, updates }) =>
      axios.patch(`/api/progress/${questionId}`, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("userProgress");
        toast.success("Progress updated!");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.error?.message || "Failed to update progress"
        );
      },
    }
  );

  const handleToggleStar = (questionId, starred) => {
    if (!user) {
      toast.error("Please login to star questions");
      return;
    }
    updateProgressMutation.mutate({ questionId, updates: { starred } });
  };

  const handleToggleStatus = (questionId, status) => {
    if (!user) {
      toast.error("Please login to track progress");
      return;
    }
    updateProgressMutation.mutate({ questionId, updates: { status } });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedDifficulty("");
    setPage(1);
  };

  const getProgressForQuestion = (questionId) => {
    // Check if progressData and progressData.progress exist
    if (
      !progressData ||
      !progressData.progress ||
      !Array.isArray(progressData.progress)
    ) {
      return null; // Return null if progress data is not available
    }
    return (
      progressData.progress.find((p) => p.questionId?._id === questionId) ||
      null
    );
  };

  const categories = categoriesData?.categories || [];
  const difficulties = ["Easy", "Medium", "Hard"];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 py-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Practice Questions
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2 text-sm">
                <FiTrendingUp className="w-4 h-4" />
                {questionsData?.pagination?.total || 0} problems available
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-0.5 shadow-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <FiGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <FiList className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-sm"
            >
              <FiFilter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 mb-6"
        >
          {/* Search Bar */}
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search questions by title, tags, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>

          {/* Filters */}
          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                      ({cat.count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="">All Difficulties</option>
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>

              {(searchTerm || selectedCategory || selectedDifficulty) && (
                <div className="flex items-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Clear</span>
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Questions Grid/List */}
        {questionsLoading || (user && progressLoading) ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${selectedDifficulty}-${searchTerm}-${page}-${viewMode}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "space-y-3"
                }
              >
                {sortedQuestions?.map((question, index) => (
                  <motion.div
                    key={question._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <QuestionCard
                      question={question}
                      progress={getProgressForQuestion(question._id)}
                      onToggleStar={handleToggleStar}
                      onToggleStatus={handleToggleStatus}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {sortedQuestions?.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiSearch className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No questions found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                    Try adjusting your search criteria or clear the filters.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                  >
                    Clear Filters
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {questionsData?.pagination &&
              questionsData.pagination.pages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6"
                >
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                    >
                      Previous
                    </motion.button>

                    <div className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg font-medium shadow-lg text-sm">
                      Page {page} of {questionsData.pagination.pages}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPage(page + 1)}
                      disabled={page === questionsData.pagination.pages}
                      className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                    >
                      Next
                    </motion.button>
                  </div>
                </motion.div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;
