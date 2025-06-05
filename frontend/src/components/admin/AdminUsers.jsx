"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiUserX,
  FiUserCheck,
  FiChevronLeft,
  FiChevronRight,
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
    return new Date(dateString).toLocaleDateString();
  };

  const toggleDetails = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Mobile back button for details view */}
      {showDetails && (
        <button
          onClick={() => setShowDetails(false)}
          className="lg:hidden flex items-center text-primary-600 dark:text-primary-400 mb-4"
        >
          <FiChevronLeft className="mr-1" /> Back to users list
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List - Hidden on mobile when details are shown */}
        <div
          className={`lg:col-span-2 ${
            showDetails ? "hidden lg:block" : "block"
          }`}
        >
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Users ({usersData?.pagination?.total || 0})
            </h2>

            {usersLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-4">
                {usersData?.users?.map((user) => (
                  <motion.div
                    key={user._id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                      selectedUser?._id === user._id
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => toggleDetails(user)}
                  >
                    <div className="flex items-center justify-between flex-col sm:flex-row gap-2">
                      <div className="flex items-center space-x-4">
                        <img
                          src={
                            user.avatar || "/placeholder.svg?height=40&width=40"
                          }
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                            {user.isAdmin && (
                              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs rounded">
                                Admin
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleUserStatus(user);
                          }}
                          className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          disabled={updateUserMutation.isLoading}
                        >
                          {user.isActive ? (
                            <FiUserX className="w-4 h-4" />
                          ) : (
                            <FiUserCheck className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Joined: {formatDate(user.createdAt)} • {user.authProvider}
                    </div>
                  </motion.div>
                ))}

                {usersData?.users?.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No users found.
                  </p>
                )}
              </div>
            )}

            {/* Pagination */}
            {usersData?.pagination && usersData.pagination.pages > 1 && (
              <div className="flex justify-center space-x-2 mt-6 flex-wrap">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 text-sm sm:px-4 sm:py-2 sm:text-base"
                >
                  <FiChevronLeft className="inline mr-1" /> Previous
                </button>
                <span className="flex items-center px-2 py-1 sm:px-4 sm:py-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  Page {page} of {usersData.pagination.pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === usersData.pagination.pages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 text-sm sm:px-4 sm:py-2 sm:text-base"
                >
                  Next <FiChevronRight className="inline ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Details - Full width on mobile when shown */}
        <div className={`${showDetails ? "block" : "hidden lg:block"}`}>
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              User Details
            </h2>

            {selectedUser ? (
              <div className="space-y-6">
                {/* User Info */}
                <div className="text-center">
                  <img
                    src={
                      selectedUser.avatar ||
                      "/placeholder.svg?height=80&width=80"
                    }
                    alt={selectedUser.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                </div>

                {/* Progress Stats */}
                {progressLoading ? (
                  <LoadingSpinner />
                ) : userProgressData ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Progress Stats
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          {userProgressData.stats?.totalSolved || 0}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Solved
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {userProgressData.stats?.totalStarred || 0}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Starred
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {userProgressData.stats?.totalAttempted || 0}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Attempted
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Recent Activity */}
                {userProgressData?.progress && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Recent Activity
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {userProgressData.progress.slice(0, 10).map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                        >
                          <div className="truncate">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.questionId.problem}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.questionId.category} •{" "}
                              {item.questionId.difficulty}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                              item.status === "solved"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Select a user to view details
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
