"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiStar,
  FiCheck,
  FiExternalLink,
  FiCode,
  FiBookmark,
} from "react-icons/fi";

const QuestionCard = ({ question, progress, onToggleStar, onToggleStatus }) => {
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

  const isSolved = progress?.status === "solved";
  const isStarred = progress?.starred || false;

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        y: -4,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative bg-slate-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Gradient overlay for visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Status indicator bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isSolved
            ? "bg-gradient-to-r from-green-400 to-emerald-500"
            : "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
        }`}
      />

      <div className="relative p-3 sm:p-4">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <Link
              to={`/questions/${question._id}`}
              className="group/link block"
            >
              <h3
                style={{
                  textDecoration: "underLine",
                }}
                className="text-base sm:text-lg font-bold text-blue-500 leading-tight mb-1 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors duration-200"
              >
                {question.problem}
              </h3>
              <div className="w-0 group-hover/link:w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full" />
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isSolved && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full"
              >
                <FiCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleStar?.(question._id, !isStarred)}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                isStarred
                  ? "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 shadow-md"
                  : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:text-gray-500 dark:hover:text-yellow-500 dark:hover:bg-yellow-900/20"
              }`}
            >
              <FiStar
                className={`w-4 h-4 ${isStarred ? "fill-current" : ""}`}
              />
            </motion.button>
          </div>
        </div>

        {/* Metadata Section */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(
              question.difficulty
            )}`}
          >
            <FiCode className="w-3 h-3 mr-1" />
            {question.difficulty}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium border border-gray-200 dark:border-gray-600">
            <FiBookmark className="w-3 h-3 mr-1" />
            {question.category
              .replace("-", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </div>

        {/* Tags Section */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {question.tags.slice(0, 4).map((tag, index) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md font-medium border border-blue-200 dark:border-blue-700"
              >
                {tag}
              </motion.span>
            ))}
            {question.tags.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md font-medium border border-gray-200 dark:border-gray-600">
                +{question.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              onToggleStatus?.(question._id, isSolved ? "unsolved" : "solved")
            }
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
              isSolved
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500"
            }`}
          >
            {isSolved ? "Solved ✓" : "Mark as Solved"}
          </motion.button>
          {/* 
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={question.leetcodeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-md transition-all duration-200 border border-orange-200 dark:border-orange-700"
          >
            <span>LeetCode</span>
            <FiExternalLink className="w-3 h-3" />
          </motion.a> */}
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
