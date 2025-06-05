"use client";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiStar, FiCheck, FiExternalLink } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../contexts/AuthContext";
import CodeTabs from "../components/CodeTabs";
import LoadingSpinner from "../components/LoadingSpinner";

const QuestionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch question details
  const { data: questionData, isLoading: questionLoading } = useQuery(
    ["question", id],
    () => axios.get(`/api/questions/${id}`).then((res) => res.data),
    {
      staleTime: 10 * 60 * 1000,
    }
  );

  // Fetch user progress
  const { data: progressData } = useQuery(
    ["questionProgress", id],
    () => axios.get("/api/progress").then((res) => res.data),
    {
      enabled: !!user,
      select: (data) => data.progress?.find((p) => p.questionId._id === id),
    }
  );

  // Update progress mutation
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
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!questionData?.question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Question Not Found
        </h1>
        <Link
          to="/questions"
          className="btn-primary px-4 py-2 rounded-md text-sm"
        >
          Back to Questions
        </Link>
      </div>
    );
  }

  const question = questionData.question;
  const isSolved = progressData?.status === "solved";
  const isStarred = progressData?.starred || false;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 pb-2 pt-0 max-w-7xl"
    >
      <Link
        to="/questions"
        className="p-2 rounded-md text-gray-500 dark:text-gray-400   mt-1"
      >
        <FiArrowLeft className="w-5 h-5" />
      </Link>
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div className="flex items-start space-x-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white break-words">
              {question.problem}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                  question.difficulty
                )}`}
              >
                {question.difficulty}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {question.category.replace("-", " ")}
              </span>
              <a
                href={question.leetcodeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                <span>LeetCode</span>
                <FiExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-3 self-start md:self-auto">
            <button
              onClick={handleToggleStatus}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                isSolved
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              <FiCheck className="w-4 h-4" />
              <span>{isSolved ? "Solved" : "Solve"}</span>
            </button>
            <button
              onClick={handleToggleStar}
              className={`p-2 rounded-md ${
                isStarred
                  ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                  : "text-gray-400 dark:text-gray-500 hover:text-yellow-500"
              }`}
            >
              <FiStar
                className={`w-5 h-5 ${isStarred ? "fill-current" : ""}`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Tags */}
      {question.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Problem Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Problem
            </h2>
            <div className="prose dark:prose-invert max-w-none text-base">
              <ReactMarkdown>{question.description}</ReactMarkdown>
            </div>
          </div>

          {/* Examples */}
          {question.examples?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Examples
              </h2>
              <div className="space-y-3">
                {question.examples.map((example, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white text-base mb-2">
                      Example {index + 1}:
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Input: </span>
                        <p className=" px-2 py-1 rounded break-all tracking-widest">
                          {example.input}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Output: </span>
                        <p className=" px-2 py-1 rounded">{example.output}</p>
                      </div>
                      {example.explanation && (
                        <div>
                          <span className="font-medium">Explanation: </span>
                          <span className="text-gray-600 dark:text-gray-300">
                            {example.explanation}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints */}
          {question.constraints?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Constraints
              </h2>
              <ul className="space-y-2 text-base">
                {question.constraints.map((constraint, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <p className=" px-2 py-1 rounded break-all">{constraint}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column - Solutions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg py-4 px-1 shadow-sm border border-gray-200 dark:border-gray-700 h-fit sticky top-4">
          <h2 className="text-xl ms-2 font-semibold text-gray-900 dark:text-white mb-3">
            Solutions
          </h2>
          <CodeTabs
            bruteForce={question.bruteForce}
            optimal={question.optimal}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionDetail;
