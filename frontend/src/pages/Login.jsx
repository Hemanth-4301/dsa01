"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetData, setResetData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetStep, setResetStep] = useState("email"); // email, otp, newPassword
  const [otpTimer, setOtpTimer] = useState(120); // 2 minutes in seconds
  const {
    login,
    requestPasswordReset,
    verifyResetOTP,
    resetPassword,
    resendResetOTP,
  } = useAuth();
  const navigate = useNavigate();

  // OTP timer effect
  useEffect(() => {
    let timer;
    if (resetStep === "otp" && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setError("OTP expired. Please request a new one.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resetStep, otpTimer]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleResetChange = (e) => {
    setResetData({
      ...resetData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate("/");
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (resetStep === "email") {
        const result = await requestPasswordReset(resetData.email);
        if (result.success) {
          setResetStep("otp");
          setOtpTimer(120);
        } else {
          setError(result.error || "Failed to send OTP");
        }
      } else if (resetStep === "otp") {
        const result = await verifyResetOTP(resetData.email, resetData.otp);
        if (result.success) {
          setResetStep("newPassword");
        } else {
          setError(result.error || "Invalid or expired OTP");
        }
      } else if (resetStep === "newPassword") {
        if (resetData.newPassword !== resetData.confirmPassword) {
          setError("Passwords do not match");
        } else {
          const result = await resetPassword(
            resetData.email,
            resetData.otp,
            resetData.newPassword
          );
          if (result.success) {
            setShowResetModal(false);
            setResetData({
              email: "",
              otp: "",
              newPassword: "",
              confirmPassword: "",
            });
            setResetStep("email");
            setOtpTimer(120);
          } else {
            setError(result.error || "Failed to reset password");
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await resendResetOTP(resetData.email);
      if (result.success) {
        setOtpTimer(120);
      } else {
        setError(result.error || "Failed to resend OTP");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm sm:max-w-md relative z-10 px-2 sm:px-0 py-6 sm:py-12"
      >
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

          <motion.div
            variants={itemVariants}
            className="text-center mb-6 sm:mb-8"
          >
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold mx-auto mb-4 sm:mb-6 shadow-lg relative"
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
            >
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl sm:rounded-2xl"></div>
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2 sm:mb-3">
              Welcome Back
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg px-2">
              Sign in to continue your DSA journey
            </p>
          </motion.div>

          {error && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 text-red-700 dark:text-red-400 flex items-start shadow-sm"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}

          <motion.form
            variants={containerVariants}
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-6"
          >
            <motion.div variants={itemVariants}>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm text-base"
                  placeholder="Enter your email"
                  autoComplete="email"
                  inputMode="email"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-indigo-500/0 group-focus-within:from-blue-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-indigo-500/5 transition-all duration-300 pointer-events-none"></div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm text-base"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 p-2 -m-2 touch-manipulation"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-indigo-500/0 group-focus-within:from-blue-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-indigo-500/5 transition-all duration-300 pointer-events-none"></div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="text-right">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold transition-colors duration-200"
              >
                Forgot Password?
              </button>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden text-base sm:text-lg touch-manipulation min-h-[48px] sm:min-h-[56px]"
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <span>Sign In</span>
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
                  New to our platform?
                </span>
              </div>
            </div>
            <Link
              to="/register"
              className="mt-3 sm:mt-4 inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors duration-200 group py-2 px-4 -mx-4 rounded-lg touch-manipulation"
            >
              <span>Create an account</span>
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

        {/* Reset Password Modal */}
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md relative"
            >
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetData({
                    email: "",
                    otp: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setResetStep("email");
                  setError("");
                  setOtpTimer(120);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                Reset Password
              </h2>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 text-red-700 dark:text-red-400 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4">
                {resetStep === "email" && (
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 w-4 h-4" />
                      <input
                        type="email"
                        id="reset-email"
                        name="email"
                        value={resetData.email}
                        onChange={handleResetChange}
                        className="w-full pl-10 pr-3 py-3 bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                )}

                {resetStep === "otp" && (
                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                    >
                      OTP (Expires in {Math.floor(otpTimer / 60)}:
                      {(otpTimer % 60).toString().padStart(2, "0")})
                    </label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={resetData.otp}
                      onChange={handleResetChange}
                      className="w-full px-3 py-3 bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                      placeholder="Enter OTP"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading || otpTimer === 0}
                      className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </div>
                )}

                {resetStep === "newPassword" && (
                  <>
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                      >
                        New Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 w-4 h-4" />
                        <input
                          type={showPassword ? "text" : "password"}
                          id="newPassword"
                          name="newPassword"
                          value={resetData.newPassword}
                          onChange={handleResetChange}
                          className="w-full pl-10 pr-3 py-3 bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                          placeholder="Enter new password"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 w-4 h-4" />
                        <input
                          type={showPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={resetData.confirmPassword}
                          onChange={handleResetChange}
                          className="w-full pl-10 pr-3 py-3 bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : resetStep === "email" ? (
                    "Send OTP"
                  ) : resetStep === "otp" ? (
                    "Verify OTP"
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
