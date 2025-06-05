"use client"

import { motion } from "framer-motion"

const ProgressBar = ({ solved, total, category, className = "" }) => {
  const percentage = total > 0 ? (solved / total) * 100 : 0

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-primary-500"
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
          {category || "Progress"}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {solved}/{total}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${getProgressColor(percentage)}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}% complete</div>
    </div>
  )
}

export default ProgressBar
