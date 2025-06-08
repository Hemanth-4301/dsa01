"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Configure axios defaults
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post("/api/auth/refresh", {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem("accessToken", accessToken);

          return axios(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await axios.get("/api/auth/user");
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user);

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
      });

      const { userId } = response.data;

      toast.success("Registration successful! Please verify your email.");
      return { success: true, userId };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyOTP = async (userId, otp) => {
    try {
      const response = await axios.post("/api/auth/verify-otp", {
        userId,
        otp,
      });

      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user);

      toast.success("Email verified successfully!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "OTP verification failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resendOTP = async (userId) => {
    try {
      await axios.post("/api/auth/resend-otp", { userId });
      toast.success("New OTP sent successfully!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to resend OTP";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      await axios.post("/api/auth/forgot-password", { email });
      toast.success("Password reset OTP sent to your email!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to send reset OTP";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyResetOTP = async (email, otp) => {
    try {
      await axios.post("/api/auth/verify-reset-otp", { email, otp });
      toast.success("OTP verified successfully!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "OTP verification failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resendResetOTP = async (email) => {
    try {
      await axios.post("/api/auth/resend-reset-otp", { email });
      toast.success("New OTP sent successfully!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to resend OTP";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      await axios.post("/api/auth/reset-password", { email, otp, newPassword });
      toast.success(
        "Password reset successfully! Please login with your new password."
      );
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to reset password";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const deleteUnverifiedUser = async (userId) => {
    try {
      await axios.post("/api/auth/delete-unverified", { userId });
      toast.info("Unverified account deleted due to OTP expiration.");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        "Failed to delete unverified account";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await axios.post("/api/admin/login", {
        email,
        password,
      });

      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user);

      toast.success("Admin login successful!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Admin login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      toast.success("Logged out successfully!");
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyOTP,
    resendOTP,
    requestPasswordReset,
    verifyResetOTP,
    resendResetOTP,
    resetPassword,
    deleteUnverifiedUser,
    adminLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
