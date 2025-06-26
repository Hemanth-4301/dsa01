"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiX,
  FiMinus,
} from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import LoadingSpinner from "../LoadingSpinner";

const AdminQuestions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    problem: "",
    category: "",
    difficulty: "",
    leetcodeLink: "",
    description: "",
    tags: "",
    examples: [{ input: "", output: "", explanation: "" }],
    constraints: [""],
    bruteForce: {
      code: { java: "", python: "", cpp: "" },
      complexity: { time: "", space: "" },
      explanation: "",
    },
    optimal: {
      code: { java: "", python: "", cpp: "" },
      complexity: { time: "", space: "" },
      explanation: "",
    },
  });
  const queryClient = useQueryClient();

  // Fetch questions
  const { data: questionsData, isLoading: questionsLoading } = useQuery(
    [
      "adminQuestions",
      {
        search: searchTerm,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        page,
      },
    ],
    () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);

      return axios.get(`/api/questions?${params}`).then((res) => res.data);
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Fetch categories
  const { data: categoriesData } = useQuery(
    "categories",
    () => axios.get("/api/questions/stats/categories").then((res) => res.data),
    {
      staleTime: 10 * 60 * 1000,
    }
  );

  // Mutations
  const addQuestion = useMutation(
    (newQuestion) => axios.post("/api/questions", newQuestion),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("adminQuestions");
        setShowForm(false);
        resetForm();
      },
    }
  );

  const updateQuestion = useMutation(
    ({ id, data }) => axios.put(`/api/questions/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("adminQuestions");
        setShowForm(false);
        setEditingQuestion(null);
        resetForm();
      },
    }
  );

  const deleteQuestion = useMutation(
    (id) => axios.delete(`/api/questions/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("adminQuestions");
      },
    }
  );

  const categories = categoriesData?.categories || [];
  const difficulties = ["Easy", "Medium", "Hard"];

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

  const resetForm = () => {
    setFormData({
      problem: "",
      category: "",
      difficulty: "",
      leetcodeLink: "",
      description: "",
      tags: "",
      examples: [{ input: "", output: "", explanation: "" }],
      constraints: [""],
      bruteForce: {
        code: { java: "", python: "", cpp: "" },
        complexity: { time: "", space: "" },
        explanation: "",
      },
      optimal: {
        code: { java: "", python: "", cpp: "" },
        complexity: { time: "", space: "" },
        explanation: "",
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      examples: formData.examples.filter(
        (ex) => ex.input || ex.output || ex.explanation
      ),
      constraints: formData.constraints.filter((con) => con),
    };

    try {
      if (editingQuestion) {
        await updateQuestion.mutateAsync({
          id: editingQuestion._id,
          data: processedData,
        });
      } else {
        await addQuestion.mutateAsync(processedData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleEdit = async (questionId) => {
    try {
      const response = await axios.get(`/api/questions/${questionId}`);
      const question = response.data.question;
      setEditingQuestion(question);
      setFormData({
        ...question,
        tags: question.tags.join(", "),
        examples: question.examples.length
          ? question.examples
          : [{ input: "", output: "", explanation: "" }],
        constraints: question.constraints.length ? question.constraints : [""],
        bruteForce: {
          code: {
            java: question.bruteForce.code.java || "",
            python: question.bruteForce.code.python || "",
            cpp: question.bruteForce.code.cpp || "",
          },
          complexity: {
            time: question.bruteForce.complexity.time || "",
            space: question.bruteForce.complexity.space || "",
          },
          explanation: question.bruteForce.explanation || "",
        },
        optimal: {
          code: {
            java: question.optimal.code.java || "",
            python: question.optimal.code.python || "",
            cpp: question.optimal.code.cpp || "",
          },
          complexity: {
            time: question.optimal.complexity.time || "",
            space: question.optimal.complexity.space || "",
          },
          explanation: question.optimal.explanation || "",
        },
      });
      setShowForm(true);
    } catch (error) {
      console.error("Fetch question for edit error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion.mutateAsync(id);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [
        ...formData.examples,
        { input: "", output: "", explanation: "" },
      ],
    });
  };

  const removeExample = (index) => {
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, i) => i !== index),
    });
  };

  const updateExample = (index, field, value) => {
    const newExamples = [...formData.examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setFormData({ ...formData, examples: newExamples });
  };

  const addConstraint = () => {
    setFormData({
      ...formData,
      constraints: [...formData.constraints, ""],
    });
  };

  const removeConstraint = (index) => {
    setFormData({
      ...formData,
      constraints: formData.constraints.filter((_, i) => i !== index),
    });
  };

  const updateConstraint = (index, value) => {
    const newConstraints = [...formData.constraints];
    newConstraints[index] = value;
    setFormData({ ...formData, constraints: newConstraints });
  };

  return (
    <div className="space-y-6 p-2 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Questions Management
        </h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingQuestion(null);
            resetForm();
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingQuestion(null);
                resetForm();
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Problem Title *
                </label>
                <input
                  type="text"
                  value={formData.problem}
                  onChange={(e) =>
                    setFormData({ ...formData, problem: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="input"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                  className="input"
                  required
                >
                  <option value="">Select Difficulty</option>
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  LeetCode Link *
                </label>
                <input
                  type="url"
                  value={formData.leetcodeLink}
                  onChange={(e) =>
                    setFormData({ ...formData, leetcodeLink: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Examples
              </label>
              {formData.examples.map((example, index) => (
                <div key={index} className="border p-4 rounded mb-2 relative">
                  <button
                    type="button"
                    onClick={() => removeExample(index)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    disabled={formData.examples.length === 1}
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Input
                      </label>
                      <input
                        type="text"
                        value={example.input}
                        onChange={(e) =>
                          updateExample(index, "input", e.target.value)
                        }
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Output
                      </label>
                      <input
                        type="text"
                        value={example.output}
                        onChange={(e) =>
                          updateExample(index, "output", e.target.value)
                        }
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Explanation
                      </label>
                      <input
                        type="text"
                        value={example.explanation}
                        onChange={(e) =>
                          updateExample(index, "explanation", e.target.value)
                        }
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addExample}
                className="btn-secondary flex items-center space-x-2 mt-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Example</span>
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Constraints
              </label>
              {formData.constraints.map((constraint, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={constraint}
                    onChange={(e) => updateConstraint(index, e.target.value)}
                    className="input"
                  />
                  <button
                    type="button"
                    onClick={() => removeConstraint(index)}
                    className="text-red-600 hover:text-red-800"
                    disabled={formData.constraints.length === 1}
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addConstraint}
                className="btn-secondary flex items-center space-x-2 mt-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Constraint</span>
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Brute Force Solution
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Java Code
                  </label>
                  <textarea
                    value={formData.bruteForce.code.java}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bruteForce: {
                          ...formData.bruteForce,
                          code: {
                            ...formData.bruteForce.code,
                            java: e.target.value,
                          },
                        },
                      })
                    }
                    className="input"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Python Code
                  </label>
                  <textarea
                    value={formData.bruteForce.code.python}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bruteForce: {
                          ...formData.bruteForce,
                          code: {
                            ...formData.bruteForce.code,
                            python: e.target.value,
                          },
                        },
                      })
                    }
                    className="input"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    C++ Code
                  </label>
                  <textarea
                    value={formData.bruteForce.code.cpp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bruteForce: {
                          ...formData.bruteForce,
                          code: {
                            ...formData.bruteForce.code,
                            cpp: e.target.value,
                          },
                        },
                      })
                    }
                    className="input"
                    rows={4}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Time Complexity
                  </label>
                  <input
                    type="text"
                    value={formData.bruteForce.complexity.time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bruteForce: {
                          ...formData.bruteForce,
                          complexity: {
                            ...formData.bruteForce.complexity,
                            time: e.target.value,
                          },
                        },
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Space Complexity
                  </label>
                  <input
                    type="text"
                    value={formData.bruteForce.complexity.space}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bruteForce: {
                          ...formData.bruteForce,
                          complexity: {
                            ...formData.bruteForce.complexity,
                            space: e.target.value,
                          },
                        },
                      })
                    }
                    className="input"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Explanation
                </label>
                <textarea
                  value={formData.bruteForce.explanation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bruteForce: {
                        ...formData.bruteForce,
                        explanation: e.target.value,
                      },
                    })
                  }
                  className="input"
                  rows={4}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Optimal Solution
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Java Code
                  </label>
                  <textarea
                    value={formData.optimal.code.java}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        optimal: {
                          ...formData.optimal,
                          code: {
                            ...formData.optimal.code,
                            java: e.target.value,
                          },
                        },
                      })
                    }
                    className="input"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Python Code
                  </label>
                  <textarea
                    value={formData.optimal.code.python}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        optimal: {
                          ...formData.optimal,
                          code: {
                            ...formData.optimal.code,
                            python: e.target.value,
                          },
                        },
                      })
                    }
                    className="input"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    C++ Code
                  </label>
                  <textarea
                    value={formData.optimal.code.cpp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        optimal: {
                          ...formData.optimal,
                          code: {
                            ...formData.optimal.code,
                            cpp: e.target.value,
                          },
                        },
                      })
                    }
                    className="input"
                    rows={4}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Time Complexity
                  </label>
                  <input
                    type="text"
                    value={formData.optimal.complexity.time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        optimal: {
                          ...formData.optimal,
                          complexity: {
                            ...formData.optimal.complexity,
                            time: e.target.value,
                          },
                        },
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Space Complexity
                  </label>
                  <input
                    type="text"
                    value={formData.optimal.complexity.space}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        optimal: {
                          ...formData.optimal,
                          complexity: {
                            ...formData.optimal.complexity,
                            space: e.target.value,
                          },
                        },
                      })
                    }
                    className="input"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Explanation
                </label>
                <textarea
                  value={formData.optimal.explanation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      optimal: {
                        ...formData.optimal,
                        explanation: e.target.value,
                      },
                    })
                  }
                  className="input"
                  rows={4}
                />
              </div>
            </div>
            <div>
              <button type="submit" className="btn-primary">
                {editingQuestion ? "Update Question" : "Add Question"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

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
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.category} value={cat.category}>
              {cat.category
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="input"
        >
          <option value="">All Difficulties</option>
          {difficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearchTerm("");
            setSelectedCategory("");
            setSelectedDifficulty("");
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
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Problem
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Difficulty
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Tags
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Actions
                  </th>
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
                        <div className="font-medium text-gray-900 dark:text-white">
                          {question.problem}
                        </div>
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
                        className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                          question.difficulty
                        )}`}
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
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{question.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(question._id)}
                          className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(question._id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
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
                <p className="text-gray-500 dark:text-gray-400">
                  No questions found.
                </p>
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
  );
};

export default AdminQuestions;
