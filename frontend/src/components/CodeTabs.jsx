"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiCopy, FiCheck } from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-toastify";

const CodeTabs = ({ bruteForce, optimal, showComplexity = true }) => {
  const [activeTab, setActiveTab] = useState("optimal");
  const [activeLanguage, setActiveLanguage] = useState("java");
  const [copiedStates, setCopiedStates] = useState({});
  const { isDark } = useTheme();

  const languages = [
    { key: "java", label: "Java", syntax: "java" },
    { key: "python", label: "Python", syntax: "python" },
    { key: "cpp", label: "C++", syntax: "cpp" },
  ];

  const solutions = {
    bruteForce,
    optimal,
  };

  const copyToClipboard = async (code, key) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedStates({ ...copiedStates, [key]: true });
      toast.success("Code copied to clipboard!");
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false });
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const currentSolution = solutions[activeTab];
  const currentCode = currentSolution?.code?.[activeLanguage];

  return (
    <div className="space-y-4">
      {/* Solution Type Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("optimal")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeTab === "optimal"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Optimal Solution
        </button>
        <button
          onClick={() => setActiveTab("bruteForce")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeTab === "bruteForce"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Brute Force
        </button>
      </div>

      {/* Language Tabs */}
      <div className="flex space-x-1 bg-gray-50 dark:bg-gray-800/50 p-1 rounded-lg">
        {languages.map((lang) => (
          <button
            key={lang.key}
            onClick={() => setActiveLanguage(lang.key)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeLanguage === lang.key
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Code Block */}
      <motion.div
        key={`${activeTab}-${activeLanguage}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <div className="code-block">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {languages.find((l) => l.key === activeLanguage)?.label} -{" "}
              {activeTab === "optimal" ? "Optimal" : "Brute Force"}
            </span>
            <button
              onClick={() =>
                copyToClipboard(currentCode, `${activeTab}-${activeLanguage}`)
              }
              className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              {copiedStates[`${activeTab}-${activeLanguage}`] ? (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <SyntaxHighlighter
            language={languages.find((l) => l.key === activeLanguage)?.syntax}
            style={isDark ? oneDark : oneLight}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              background: "transparent",
            }}
          >
            {currentCode || "// Code not available"}
          </SyntaxHighlighter>
        </div>
      </motion.div>

      {/* Complexity and Explanation */}
      {showComplexity && currentSolution && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="space-y-4"
        >
          {/* Complexity */}
          {currentSolution.complexity && (
            <div className="card">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Complexity Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Time Complexity:
                  </span>
                  <p className="text-lg font-mono text-gray-900 dark:text-white">
                    {currentSolution.complexity.time}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Space Complexity:
                  </span>
                  <p className="text-lg font-mono text-gray-900 dark:text-white">
                    {currentSolution.complexity.space}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Explanation */}
          {currentSolution.explanation && (
            <div className="card">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Explanation
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentSolution.explanation}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CodeTabs;
