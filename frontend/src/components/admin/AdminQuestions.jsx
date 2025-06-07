"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FiPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi"
import { useQuery, useQueryClient } from "react-query"
import axios from "axios"
import LoadingSpinner from "../LoadingSpinner"

const AdminQuestions = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")
  const [page, setPage] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  const queryClient = useQueryClient()

  // Fetch questions
  const { data: questionsData, isLoading: questionsLoading } = useQuery(
    ["adminQuestions", { search: searchTerm, category: selectedCategory, difficulty: selectedDifficulty, page }],
    () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory) params.append("category", selectedCategory)
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty)

      return axios.get(`/api/questions?${params}`).then((res) => res.data)
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  )

  // Fetch categories
  const { data: categoriesData } = useQuery(
    "categories",
    () => axios.get("/api/questions/stats/categories").then((res) => res.data),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    },
  )

  const categories = categoriesData?.categories || []
  const difficulties = ["Easy", "Medium", "Hard"]

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "difficulty-easy"
      case "Medium":
        return "difficulty-medium"
      case "Hard":
        return "difficulty-hard"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-6 p-2 md:p-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Questions Management</h2>
        <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center space-x-2">
          <FiPlus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input">
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.category} value={cat.category}>
              {cat.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>
        <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} className="input">
          <option value="">All Difficulties</option>
          {difficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearchTerm("")
            setSelectedCategory("")
            setSelectedDifficulty("")
          }}
          className="btn-secondary"
        >
          Clear Filters
        </button>
      </div>

      {/* Questions Table */}
      <div className="card">
        {questionsLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Problem</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Difficulty</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Tags</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questionsData?.questions?.map((question) => (
                  <motion.tr
                    key={question._id}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{question.problem}</div>
                        <a
                          href={question.leetcodeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          LeetCode Link
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-gray-700 dark:text-gray-300">
                        {question.category.replace("-", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
                      >
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {question.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {question.tags?.length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">+{question.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {questionsData?.questions?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No questions found.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {questionsData?.pagination && questionsData.pagination.pages > 1 && (
          <div className="flex justify-center space-x-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
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
    </div>
  )
}

export default AdminQuestions
