"use client";

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { FiArrowLeft, FiStar, FiCheck, FiExternalLink } from "react-icons/fi";
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
  const [page, setPage] = useState(1);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Define difficulty order for sorting
  const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
    setSearchParams(params);
  }, [searchTerm, selectedCategory, selectedDifficulty, setSearchParams]);

  // Fetch questions
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
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Sort questions by difficulty
  const sortedQuestions = questionsData?.questions?.sort((a, b) => {
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });

  // Fetch user progress
  const { data: progressData } = useQuery(
    "userProgress",
    () => axios.get("/api/progress").then((res) => res.data),
    {
      enabled: !!user,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Fetch categories for filter
  const { data: categoriesData } = useQuery(
    "categories",
    () => axios.get("/api/questions/stats/categories").then((res) => res.data),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Update progress mutation
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
    return progressData?.progress?.find((p) => p.questionId._id === questionId);
  };

  const categories = categoriesData?.categories || [];
  const difficulties = ["Easy", "Medium", "Hard"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link to="/" className="text-gray-400 text-2xl">
            <FiArrowLeft /> 
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Practice Questions
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {questionsData?.pagination?.total || 0} problems available
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center space-x-2 sm:hidden"
        >
          <FiFilter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 pr-4"
          />
        </div>

        {/* Filters */}
        <div className={`${showFilters ? "block" : "hidden"} sm:block`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
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
            <div className="flex-1">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input"
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
              <button
                onClick={clearFilters}
                className="btn-secondary flex items-center space-x-2"
              >
                <FiX className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      {questionsLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${selectedDifficulty}-${searchTerm}-${page}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {sortedQuestions?.map((question) => (
                <QuestionCard
                  key={question._id}
                  question={question}
                  progress={getProgressForQuestion(question._id)}
                  onToggleStar={handleToggleStar}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {sortedQuestions?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No questions found matching your criteria.
              </p>
              <button onClick={clearFilters} className="btn-primary mt-4">
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {questionsData?.pagination && questionsData.pagination.pages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300">
                Page {page} of {questionsData.pagination.pages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === questionsData.pagination.pages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Questions;
