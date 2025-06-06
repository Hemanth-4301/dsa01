"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.password
    );

    if (result.success) {
      navigate("/");
    }

    setLoading(false);
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;

    const levels = [
      { strength: 0, label: "", color: "" },
      { strength: 1, label: "Weak", color: "bg-red-500" },
      { strength: 2, label: "Fair", color: "bg-yellow-500" },
      { strength: 3, label: "Good", color: "bg-blue-500" },
      { strength: 4, label: "Strong", color: "bg-green-500" },
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        mass: 0.8,
      },
    },
  };

  return (
    <div className="min-h-screen  flex items-center justify-center relative overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm sm:max-w-md relative z-10 px-2 sm:px-0 py-6 sm:py-12"
      >
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-6 sm:p-8 relative overflow-hidden">
          {/* Card decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>

          <motion.div
            variants={itemVariants}
            className="text-center mb-6 sm:mb-8"
          >
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold mx-auto mb-4 sm:mb-6 shadow-lg relative"
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                delay: 0.5,
              }}
            >
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl sm:rounded-2xl"></div>
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-indigo-800 dark:from-white dark:via-purple-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2 sm:mb-3">
              Create Account
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg px-2">
              signup and start your journey with us!
            </p>
          </motion.div>

          <motion.form
            variants={containerVariants}
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-6"
          >
            <motion.div variants={itemVariants}>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3"
              >
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-slate-50/50 dark:bg-slate-700/50 border rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-200 backdrop-blur-sm text-base ${
                    errors.name
                      ? "border-red-500/50"
                      : "border-slate-200/50 dark:border-slate-600/50"
                  }`}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-indigo-500/0 to-blue-500/0 group-focus-within:from-purple-500/5 group-focus-within:via-indigo-500/5 group-focus-within:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  {errors.name}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-slate-50/50 dark:bg-slate-700/50 border rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-200 backdrop-blur-sm text-base ${
                    errors.email
                      ? "border-red-500/50"
                      : "border-slate-200/50 dark:border-slate-600/50"
                  }`}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  inputMode="email"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-indigo-500/0 to-blue-500/0 group-focus-within:from-purple-500/5 group-focus-within:via-indigo-500/5 group-focus-within:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 bg-slate-50/50 dark:bg-slate-700/50 border rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-200 backdrop-blur-sm text-base ${
                    errors.password
                      ? "border-red-500/50"
                      : "border-slate-200/50 dark:border-slate-600/50"
                  }`}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 p-2 -m-2 touch-manipulation"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 " />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 " />
                  )}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-indigo-500/0 to-blue-500/0 group-focus-within:from-purple-500/5 group-focus-within:via-indigo-500/5 group-focus-within:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
              </div>

              {/* Mobile-optimized Password Strength Indicator */}
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 sm:mt-3"
                >
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Password Strength
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        passwordStrength.strength >= 3
                          ? "text-green-600 dark:text-green-400"
                          : passwordStrength.strength >= 2
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 sm:h-2 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength.strength
                            ? passwordStrength.color
                            : "bg-slate-200 dark:bg-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 sm:pl-12 pr-12 sm:pr-16 py-3 sm:py-4 bg-slate-50/50 dark:bg-slate-700/50 border rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-200 backdrop-blur-sm text-base ${
                    errors.confirmPassword
                      ? "border-red-500/50"
                      : "border-slate-200/50 dark:border-slate-600/50"
                  }`}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />
                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  {formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <CheckCircle className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 flex  hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 p-2 -m-2 touch-manipulation"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 " />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 " />
                    )}
                  </button>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-indigo-500/0 to-blue-500/0 group-focus-within:from-purple-500/5 group-focus-within:via-indigo-500/5 group-focus-within:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  {errors.confirmPassword}
                </motion.p>
              )}
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden text-base sm:text-lg touch-manipulation min-h-[48px] sm:min-h-[56px]"
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <span>Create Account</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1.5,
                    }}
                  >
                    →
                  </motion.div>
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.div
            variants={itemVariants}
            className="mt-6 sm:mt-8 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/50 dark:border-slate-600/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 sm:px-4 bg-white/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 backdrop-blur-sm">
                  Already have an account?
                </span>
              </div>
            </div>
            <Link
              to="/login"
              className="mt-3 sm:mt-4 inline-flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors duration-200 group py-2 px-4 -mx-4 rounded-lg touch-manipulation"
            >
              <span>Sign in instead</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                className="group-hover:translate-x-1 transition-transform duration-200"
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
