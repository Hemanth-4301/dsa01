"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import LoadingSpinner from "./LoadingSpinner"

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/admin/login" />
  }

  return children
}

export default AdminRoute
