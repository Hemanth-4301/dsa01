"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiUserX,
  FiUserCheck,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiStar,
  FiTrendingUp,
  FiCalendar,
  FiMail,
  FiShield,
  FiActivity,
  FiTarget,
  FiAward,
} from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingSpinner from "../LoadingSpinner";

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery(
    ["adminUsers", { search: searchTerm, page }],
    () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (searchTerm) params.append("search", searchTerm);

      return axios.get(`/api/admin/users?${params}`).then((res) => res.data);
    },
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Fetch user progress
  const { data: userProgressData, isLoading: progressLoading } = useQuery(
    ["adminUserProgress", selectedUser?._id],
    () =>
      axios
        .get(`/api/admin/users/${selectedUser._id}/progress`)
        .then((res) => res.data),
    {
      enabled: !!selectedUser,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Update user mutation
  const updateUserMutation = useMutation(
    ({ userId, updates }) => axios.patch(`/api/admin/users/${userId}`, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("adminUsers");
        toast.success("User updated successfully!");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.error?.message || "Failed to update user"
        );
      },
    }
  );

  const handleToggleUserStatus = (user) => {
    updateUserMutation.mutate({
      userId: user._id,
      updates: { isActive: !user.isActive },
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const toggleDetails = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6 p-4 sm:p-6"
    >
      {/* Enhanced Header */}
      <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
          👥 User Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Manage user accounts, permissions, and monitor user activity
        </p>
      </motion.div>

      {/* Enhanced Search */}
      <motion.div
        variants={itemVariants}
        className="flex items-center mb-4 sm:mb-6"
      >
        <div className="flex-1 relative group">
          <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 text-sm sm:text-base shadow-lg"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-indigo-500/0 group-focus-within:from-blue-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-indigo-500/5 transition-all duration-300 pointer-events-none"></div>
        </div>
      </motion.div>

      {/* Mobile back button for details view */}
      <AnimatePresence>
        {showDetails && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setShowDetails(false)}
            className="lg:hidden flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-4 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
          >
            <FiChevronLeft className="w-4 h-4" />
            <span className="font-medium">Back to list</span>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Enhanced Users List */}
        <motion.div
          variants={cardVariants}
          className={`${showDetails ? "hidden lg:block" : "block"} ${
            showDetails ? "lg:col-span-2" : "w-full"
          }`}
        >
          <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent flex items-center">
                <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-500" />
                Users ({usersData?.pagination?.total || 0})
              </h2>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-8 sm:py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <AnimatePresence>
                  {usersData?.users?.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className={`p-3 sm:p-4 border rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${
                        selectedUser?._id === user._id
                          ? "border-blue-500/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg"
                          : "border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/50"
                      }`}
                      onClick={() => toggleDetails(user)}
                    >
                      <div className="flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                          <div className="relative">
                            <img
                              src={
                                user.avatar ||
                                "/placeholder.svg?height=48&width=48"
                              }
                              alt={user.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-500/20 shadow-sm object-cover"
                            />
                            {user.isActive && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                                {user.name}
                              </h3>
                              {user.isAdmin && (
                                <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full font-medium shadow-sm">
                                  <FiShield className="w-3 h-3 mr-1" />
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <FiMail className="w-3 h-3 text-slate-400" />
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-normal">
                          <span
                            className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                              user.isActive
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                                : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-1 sm:mr-2 ${
                                user.isActive ? "bg-emerald-200" : "bg-red-200"
                              }`}
                            ></div>
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleUserStatus(user);
                            }}
                            className={`p-2 rounded-lg transition-all duration-200 shadow-sm ${
                              user.isActive
                                ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            }`}
                            disabled={updateUserMutation.isLoading}
                          >
                            {user.isActive ? (
                              <FiUserX className="w-4 h-4" />
                            ) : (
                              <FiUserCheck className="w-4 h-4" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <FiCalendar className="w-3 h-3" />
                          <span>Joined {formatDate(user.createdAt)}</span>
                        </div>
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium">
                          {user.authProvider}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {usersData?.users?.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 sm:py-12"
                  >
                    <div className="text-4xl sm:text-6xl mb-4">👥</div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                      No users found matching your search.
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Enhanced Pagination */}
            {usersData?.pagination && usersData.pagination.pages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center items-center space-x-2 sm:space-x-4 mt-6 sm:mt-8"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base shadow-sm"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </motion.button>

                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium text-sm sm:text-base shadow-sm">
                    {page}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                    of
                  </span>
                  <span className="px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm sm:text-base">
                    {usersData.pagination.pages}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(page + 1)}
                  disabled={page === usersData.pagination.pages}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base shadow-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <FiChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Enhanced User Details */}
        <motion.div
          variants={cardVariants}
          className={`${showDetails ? "block" : "hidden lg:block"} ${
            showDetails ? "w-full" : "lg:col-span-1"
          }`}
        >
          <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60 sticky top-4">
            <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6 text-center">
              👤 User Details
            </h2>

            <AnimatePresence mode="wait">
              {selectedUser ? (
                <motion.div
                  key={selectedUser._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Enhanced User Info */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <img
                        src={
                          selectedUser.avatar ||
                          "/placeholder.svg?height=80&width=80"
                        }
                        alt={selectedUser.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-3 sm:mb-4 border-4 border-blue-500/20 shadow-lg object-cover"
                      />
                      {selectedUser.isActive && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full border-3 border-white dark:border-slate-800 shadow-sm"></div>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {selectedUser.name}
                      {selectedUser.isAdmin && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full">
                          <FiShield className="w-3 h-3 mr-1" />
                          Admin
                        </span>
                      )}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2">
                      {selectedUser.email}
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      <FiCalendar className="w-3 h-3" />
                      <span>Joined {formatDate(selectedUser.createdAt)}</span>
                    </div>
                  </div>

                  {/* Enhanced Progress Stats */}
                  {progressLoading ? (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner />
                    </div>
                  ) : userProgressData ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base flex items-center">
                        <FiActivity className="w-4 h-4 mr-2 text-blue-500" />
                        Progress Stats
                      </h4>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 sm:p-4 text-center border border-emerald-200/50 dark:border-emerald-700/50"
                        >
                          <div className="flex items-center justify-center mb-2">
                            <FiTarget className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mr-1" />
                          </div>
                          <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            {userProgressData.stats?.totalSolved || 0}
                          </div>
                          <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                            Solved
                          </div>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 sm:p-4 text-center border border-amber-200/50 dark:border-amber-700/50"
                        >
                          <div className="flex items-center justify-center mb-2">
                            <FiStar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mr-1" />
                          </div>
                          <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            {userProgressData.stats?.totalStarred || 0}
                          </div>
                          <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                            Starred
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  ) : null}

                  {/* Enhanced Recent Activity */}
                  {userProgressData?.progress && (
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base flex items-center">
                        <FiTrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                        Recent Activity
                      </h4>
                      <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto custom-scrollbar">
                        {userProgressData.progress
                          .slice(0, 10)
                          .map((item, index) => (
                            <motion.div
                              key={item._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 rounded-lg border border-slate-200/50 dark:border-slate-600/50 hover:shadow-sm transition-all duration-200"
                            >
                              <div className="flex-1 min-w-0 pr-2">
                                <div className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                                  {item.questionId.problem}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {item.questionId.category.replace("-", " ")} •{" "}
                                  <span
                                    className={
                                      item.questionId.difficulty === "Easy"
                                        ? "text-emerald-600"
                                        : item.questionId.difficulty ===
                                          "Medium"
                                        ? "text-amber-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {item.questionId.difficulty}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                  item.status === "solved"
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                                    : "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                                }`}
                              >
                                {item.status === "solved" ? (
                                  <span className="flex items-center">
                                    <FiAward className="w-3 h-3 mr-1" />
                                    Solved
                                  </span>
                                ) : (
                                  item.status
                                )}
                              </span>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 sm:py-12"
                >
                  <div className="text-4xl sm:text-6xl mb-4">👤</div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                    Select a user to view their details and activity
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminUsers;
