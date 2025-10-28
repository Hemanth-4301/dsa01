import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiTarget, FiLayers, FiTrendingUp } from "react-icons/fi";

const RelatedQuestions = ({ questions }) => {
  if (!questions || questions.length === 0) {
    return null;
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "Medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
      case "Hard":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
          <FiTrendingUp className="w-5 h-5 md:w-6 md:h-6" />
          Related Questions You Might Like
        </h2>
        <p className="text-white/90 text-xs md:text-sm mt-1">
          Continue learning with similar problems
        </p>
      </div>

      <div className="p-4 space-y-3">
        {questions.map((question, index) => (
          <motion.div
            key={question._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="group"
          >
            <Link
              to={`/questions/${question._id}`}
              className="block p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-600/50 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {question.problem}
                  </h3>

                  {/* Matching Tags */}
                  {question.matchingTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {question.matchingTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-md font-medium border border-blue-200 dark:border-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getDifficultyColor(
                        question.difficulty
                      )}`}
                    >
                      <FiTarget className="w-3 h-3 mr-1" />
                      {question.difficulty}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                      <FiLayers className="w-3 h-3 mr-1" />
                      {question.category
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                    {question.relevanceScore > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium">
                        {question.relevanceScore > 5
                          ? "Highly Relevant"
                          : "Relevant"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-500 dark:group-hover:bg-blue-600 transition-colors">
                    <FiArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-300 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <Link
          to="/questions"
          className="block w-full text-center py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Explore More Questions
        </Link>
      </div>
    </motion.div>
  );
};

export default RelatedQuestions;
