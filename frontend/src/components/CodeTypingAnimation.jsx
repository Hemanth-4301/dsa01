"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlay, FiPause, FiRotateCcw } from "react-icons/fi";
import TypingEffect from "./TypingEffect";

const CodeTypingAnimation = () => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSolution, setShowSolution] = useState(false);

  const codingProblems = [
    {
      title: "Generate Parentheses (Recursion)",
      problem: "Generate all combinations of well-formed parentheses.",
      code: `def generateParenthesis(n):
    result = []
    
    def backtrack(current, open_count, close_count):
        # Base case: we've used all n pairs
        if len(current) == 2 * n:
            result.append(current)
            return
        
        # Add opening parenthesis if we can
        if open_count < n:
            backtrack(current + "(", open_count + 1, close_count)
        
        # Add closing parenthesis if valid
        if close_count < open_count:
            backtrack(current + ")", open_count, close_count + 1)
    
    backtrack("", 0, 0)
    return result

# Example: generateParenthesis(3)
# Output: ["((()))", "(()())", "(())()", "()(())", "()()()"]`,
      explanation: "Uses backtracking to build valid combinations",
      timeComplexity: "O(4^n / √n)",
      spaceComplexity: "O(4^n / √n)",
    },
    {
      title: "Two Sum (Hash Map)",
      problem: "Find two numbers that add up to target.",
      code: `def twoSum(nums, target):
    # Hash map to store value -> index mapping
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        # Check if complement exists in our map
        if complement in num_map:
            return [num_map[complement], i]
        
        # Store current number and its index
        num_map[num] = i
    
    return []  # No solution found

# Example: twoSum([2, 7, 11, 15], 9)
# Output: [0, 1] (nums[0] + nums[1] = 2 + 7 = 9)`,
      explanation: "Single pass with hash map for O(n) solution",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
    },
    {
      title: "Binary Search",
      problem: "Search for target in sorted array.",
      code: `def binarySearch(nums, target):
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1  # Search right half
        else:
            right = mid - 1  # Search left half
    
    return -1  # Target not found

# Example: binarySearch([1, 3, 5, 7, 9], 5)
# Output: 2 (index of target 5)`,
      explanation: "Divide and conquer approach",
      timeComplexity: "O(log n)",
      spaceComplexity: "O(1)",
    },
    {
      title: "Fibonacci (Dynamic Programming)",
      problem: "Calculate nth Fibonacci number efficiently.",
      code: `def fibonacci(n):
    if n <= 1:
        return n
    
    # Bottom-up DP approach
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    
    return dp[n]

# Space optimized version
def fibonacciOptimized(n):
    if n <= 1:
        return n
    
    prev2, prev1 = 0, 1
    for i in range(2, n + 1):
        current = prev1 + prev2
        prev2, prev1 = prev1, current
    
    return prev1`,
      explanation: "Optimized with memoization",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1) optimized",
    },
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setShowSolution(false);
        setTimeout(() => {
          setCurrentProblem((prev) => (prev + 1) % codingProblems.length);
          setShowSolution(true);
        }, 500);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, codingProblems.length]);

  useEffect(() => {
    setShowSolution(true);
  }, []);

  const currentCode = codingProblems[currentProblem];

  return (
    <div className="bg-gray-900 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-hidden border border-gray-700">
      {/* Terminal Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-400 text-xs">{currentCode.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            {isPlaying ? (
              <FiPause className="w-3 h-3" />
            ) : (
              <FiPlay className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={() => {
              setShowSolution(false);
              setTimeout(() => setShowSolution(true), 100);
            }}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <FiRotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Problem Description */}
      <div className="mb-3 p-2 bg-blue-900/30 rounded border-l-2 border-blue-400">
        <div className="text-blue-300 text-xs font-semibold mb-1">Problem:</div>
        <div className="text-blue-200 text-xs">{currentCode.problem}</div>
      </div>

      {/* Code Section */}
      <AnimatePresence mode="wait">
        {showSolution && (
          <motion.div
            key={currentProblem}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <pre className="text-green-400 leading-relaxed overflow-x-auto mb-3">
              <TypingEffect text={currentCode.code} speed={25} />
            </pre>

            {/* Explanation and Complexity */}
            <div className="space-y-2 text-xs">
              <div className="text-yellow-400">
                <span className="text-gray-500"># </span>
                <TypingEffect text={currentCode.explanation} speed={40} />
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                <div className="text-purple-400">
                  <span className="text-gray-500"># Time: </span>
                  <TypingEffect text={currentCode.timeComplexity} speed={60} />
                </div>
                <div className="text-cyan-400">
                  <span className="text-gray-500"># Space: </span>
                  <TypingEffect text={currentCode.spaceComplexity} speed={60} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="flex justify-center mt-3 gap-1">
        {codingProblems.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentProblem(index);
              setShowSolution(false);
              setTimeout(() => setShowSolution(true), 100);
            }}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
              index === currentProblem
                ? "bg-blue-400"
                : "bg-gray-600 hover:bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CodeTypingAnimation;
