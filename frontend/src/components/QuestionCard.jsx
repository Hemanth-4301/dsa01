"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiStar, FiCheck, FiExternalLink } from "react-icons/fi";

const QuestionCard = ({ question, progress, onToggleStar, onToggleStatus }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "difficulty-easy";
      case "Medium":
        return "difficulty-medium";
      case "Hard":
        return "difficulty-hard";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const isSolved = progress?.status === "solved";
  const isStarred = progress?.starred || false;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="card hover:shadow-md transition-shadow duration-200 p-6"
    >
      {/* Header Section - Title and Actions */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <Link
            to={`/questions/${question._id}`}
            style={{ textDecoration: "underline" }}
            className="block text-lg font-semibold text-primary-600 hover:text-primary-400 transition-colors duration-200 leading-tight"
          >
            {question.problem}
          </Link>
        </div>

        {/* Action Buttons - Right Aligned */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSolved && (
            <div className="flex items-center justify-center w-8 h-8">
              <FiCheck className="w-5 h-5 text-green-500" />
            </div>
          )}
          <button
            onClick={() => onToggleStar?.(question._id, !isStarred)}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 ${
              isStarred
                ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                : "text-gray-400 hover:text-yellow-500 hover:bg-gray-50 dark:text-gray-500 dark:hover:text-yellow-500 dark:hover:bg-gray-800"
            }`}
          >
            <FiStar className={`w-5 h-5 ${isStarred ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Metadata Section - Difficulty and Category */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
            question.difficulty
          )}`}
        >
          {question.difficulty}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize font-medium">
          {question.category}
        </span>
      </div>

      {/* Tags Section */}
      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {question.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md font-medium"
            >
              {tag}
            </span>
          ))}
          {question.tags.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md font-medium">
              +{question.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer Section - Actions and Links */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() =>
            onToggleStatus?.(question._id, isSolved ? "unsolved" : "solved")
          }
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isSolved
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 shadow-sm"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm"
          }`}
        >
          {isSolved ? "solved" : "mark as solved"}
        </button>

        <a
          href={question.leetcodeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200"
        >
          <span>LeetCode</span>
          <FiExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
