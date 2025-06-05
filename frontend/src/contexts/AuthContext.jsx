"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000"

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
          const response = await axios.post("/api/auth/refresh", {
            refreshToken,
          })

          const { accessToken } = response.data
          localStorage.setItem("accessToken", accessToken)

          return axios(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken")
      if (token) {
        try {
          const response = await axios.get("/api/auth/user")
          setUser(response.data.user)
        } catch (error) {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      })

      const { user, accessToken, refreshToken } = response.data

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      setUser(user)

      toast.success("Login successful!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error?.message || "Login failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
      })

      const { user, accessToken, refreshToken } = response.data

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      setUser(user)

      toast.success("Registration successful!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error?.message || "Registration failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const adminLogin = async (email, password) => {
    try {
      const response = await axios.post("/api/admin/login", {
        email,
        password,
      })

      const { user, accessToken, refreshToken } = response.data

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      setUser(user)

      toast.success("Admin login successful!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error?.message || "Admin login failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      setUser(null)
      toast.success("Logged out successfully!")
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    adminLogin,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
