"use client";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUsers, FiFileText } from "react-icons/fi";
import AdminUsers from "../components/admin/AdminUsers";
import AdminQuestions from "../components/admin/AdminQuestions";
import AdminAnalytics from "../components/admin/AdminAnalytics";

const AdminDashboard = () => {
  const location = useLocation();

  const navigation = [
    { name: "Users", href: "/admin/users", icon: FiUsers },
    { name: "Questions", href: "/admin/questions", icon: FiFileText },
    { name: "Analytics", href: "/admin/analytics", icon: FiFileText },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center space-x-2 flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              isActive(item.href)
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Routes>
          <Route path="/" element={<AdminAnalytics />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/questions" element={<AdminQuestions />} />
          <Route path="/analytics" element={<AdminAnalytics />} />
        </Routes>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
