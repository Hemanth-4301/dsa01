import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Questions from "./pages/Questions";
import QuestionDetail from "./pages/QuestionDetail";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import Footer from "./components/Footer";

function MainContent() {
  const location = useLocation();
  const isQuestionDetail = location.pathname.startsWith("/questions/");

  return (
    <main
      className={`container mx-auto py-8 ${isQuestionDetail ? "px-0" : "px-4"}`}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </main>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <MainContent />
      <Footer />
    </div>
  );
}

export default App;
