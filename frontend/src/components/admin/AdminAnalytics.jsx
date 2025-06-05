"use client"

import { motion } from "framer-motion"
import { FiUsers, FiFileText, FiTrendingUp, FiActivity } from "react-icons/fi"
import { useQuery } from "react-query"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import LoadingSpinner from "../LoadingSpinner"

const AdminAnalytics = () => {
  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    "adminAnalytics",
    () => axios.get("/api/admin/analytics").then((res) => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  )

  if (analyticsLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const overview = analyticsData?.overview || {}
  const categoryStats = analyticsData?.categoryStats || []
  const topPerformers = analyticsData?.topPerformers || []
  const userRegistrations = analyticsData?.userRegistrations || []

  // Colors for charts
  const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

  const statCards = [
    {
      title: "Total Users",
      value: overview.totalUsers || 0,
      icon: FiUsers,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Active Users",
      value: overview.activeUsers || 0,
      icon: FiActivity,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Total Questions",
      value: overview.totalQuestions || 0,
      icon: FiFileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Engagement Rate",
      value: overview.totalUsers > 0 ? `${Math.round((overview.activeUsers / overview.totalUsers) * 100)}%` : "0%",
      icon: FiTrendingUp,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Popularity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Category Popularity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryStats.slice(0, 8)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ _id, percent }) => `${_id.replace("-", " ")} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="solvedCount"
                nameKey="_id"
              >
                {categoryStats.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name.replace("-", " ")]}
                labelFormatter={() => "Solved Count"}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* User Registrations */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            User Registrations (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userRegistrations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Performers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Email</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Problems Solved</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map((performer) => (
                <tr key={performer._id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{performer.name}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{performer.email}</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-600 dark:text-primary-400">
                    {performer.solvedCount}
                  </td>
                </tr>
              ))}
              {topPerformers.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-500 dark:text-gray-400">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

export default AdminAnalytics
