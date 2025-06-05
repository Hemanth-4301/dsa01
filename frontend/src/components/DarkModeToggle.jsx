"use client"

import { motion } from "framer-motion"
import { FiSun, FiMoon } from "react-icons/fi"
import { useTheme } from "../contexts/ThemeContext"

const DarkModeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ${className}`}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle dark mode"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 180 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <FiMoon className="w-5 h-5 text-gray-300" /> : <FiSun className="w-5 h-5 text-yellow-500" />}
      </motion.div>
    </motion.button>
  )
}

export default DarkModeToggle
