"use client";

import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiStar,
  FiCheck,
  FiExternalLink,
  FiCode,
  FiBookOpen,
  FiTarget,
  FiLayers,
} from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../contexts/AuthContext";
import CodeTabs from "../components/CodeTabs";
import LoadingSpinner from "../components/LoadingSpinner";
import RelatedQuestions from "../components/RelatedQuestions";

const QuestionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: questionData, isLoading: questionLoading } = useQuery(
    ["question", id],
    () => axios.get(`/api/questions/${id}`).then((res) => res.data),
    {
      staleTime: 10 * 60 * 1000,
    }
  );

  const { data: progressData } = useQuery(
    ["questionProgress", id],
    () => axios.get("/api/progress").then((res) => res.data),
    {
      enabled: !!user,
      select: (data) => data.progress?.find((p) => p.questionId._id === id),
    }
  );

  const { data: relatedData, isLoading: relatedLoading } = useQuery(
    ["relatedQuestions", id],
    () => axios.get(`/api/questions/${id}/related`).then((res) => res.data),
    {
      staleTime: 10 * 60 * 1000,
      enabled: !!questionData?.question,
    }
  );

  const updateProgressMutation = useMutation(
    (updates) => axios.patch(`/api/progress/${id}`, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["questionProgress", id]);
        toast.success("Progress updated!");
      },
    }
  );

  const handleToggleStar = () => {
    if (!user) {
      toast.error("Please login to star questions");
      return;
    }
    updateProgressMutation.mutate({ starred: !progressData?.starred });
  };

  const handleToggleStatus = () => {
    if (!user) {
      toast.error("Please login to track progress");
      return;
    }
    const newStatus = progressData?.status === "solved" ? "unsolved" : "solved";
    updateProgressMutation.mutate({ status: newStatus });
  };

  if (questionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!questionData?.question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCode className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Question Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            The question you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/questions"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Questions
          </Link>
        </motion.div>
      </div>
    );
  }

  const question = questionData.question;
  const isSolved = progressData?.status === "solved";
  const isStarred = progressData?.starred || false;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-300 dark:border-emerald-700";
      case "Medium":
        return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-300 dark:border-amber-700";
      case "Hard":
        return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-300 dark:border-red-700";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 dark:from-gray-800 dark:to-slate-800 dark:text-gray-200 dark:border-gray-600";
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-3 py-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link
              to="/questions"
              className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
                {question.problem}
              </h1>
            </div>
          </div>

          {/* Metadata and Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-semibold border ${getDifficultyColor(
                    question.difficulty
                  )}`}
                >
                  <FiTarget className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                  {question.difficulty}
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs md:text-sm rounded-full font-medium border border-gray-200 dark:border-gray-600">
                  <FiLayers className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                  {question.category
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={question.leetcodeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs md:text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-full transition-all duration-200 border border-orange-200 dark:border-orange-700"
                >
                  <span className="whitespace-nowrap">LeetCode</span>
                  <FiExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                </motion.a>
              </div>

              {user && (
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleStatus}
                    className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                      isSolved
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <span>{isSolved ? "Solved ✓" : "Mark as Solved"}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleStar}
                    className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                      isStarred
                        ? "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30"
                        : "text-gray-400 bg-gray-100 dark:bg-gray-700 hover:text-yellow-500"
                    }`}
                  >
                    <FiStar
                      className={`w-4 h-4 md:w-5 md:h-5 ${
                        isStarred ? "fill-current" : ""
                      }`}
                    />
                  </motion.button>
                </div>
              )}
            </div>

            {/* Tags */}
            {question.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {question.tags.map((tag, index) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 text-xs md:text-sm rounded-md font-medium border border-blue-200 dark:border-blue-700"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Problem Description */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiBookOpen className="w-5 h-5" />
                    Problem Description
                  </h2>
                </div>
                <div className="p-4">
                  <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed">
                    <ReactMarkdown>{question.description}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>

              {/* Examples */}
              {question.examples?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FiCode className="w-5 h-5" />
                      Examples
                    </h2>
                  </div>
                  <div className="p-4 space-y-4">
                    {question.examples.map((example, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 md:p-4 border border-gray-200 dark:border-gray-600"
                      >
                        <h3 className="font-bold text-gray-900 dark:text-white text-base mb-3 flex items-center gap-2">
                          <span className="w-5 h-5 md:w-6 md:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          Example {index + 1}
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-sm">
                              Input:
                            </span>
                            <code className="block bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600 font-mono text-xs break-all">
                              {example.input}
                            </code>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-sm">
                              Output:
                            </span>
                            <code className="block bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600 font-mono text-xs break-all">
                              {example.output}
                            </code>
                          </div>
                          {example.explanation && (
                            <div>
                              <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-sm">
                                Explanation:
                              </span>
                              <p className="text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-600 text-sm">
                                {example.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Constraints */}
              {question.constraints?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FiTarget className="w-5 h-5" />
                      Constraints
                    </h2>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {question.constraints.map((constraint, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                          <code className="bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono break-all flex-1 border border-gray-200 dark:border-gray-600">
                            {constraint}
                          </code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column - Solutions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden lg:sticky lg:top-4 lg:h-fit"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiCode className="w-5 h-5" />
                  Solutions
                </h2>
              </div>
              <div className="p-1">
                <CodeTabs
                  bruteForce={question.bruteForce}
                  optimal={question.optimal}
                />
              </div>
            </motion.div>
          </div>

          {/* Related Questions Section */}
          {!relatedLoading && relatedData?.relatedQuestions?.length > 0 && (
            <RelatedQuestions questions={relatedData.relatedQuestions} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default QuestionDetail;
