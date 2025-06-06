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
import About from "./components/About";

function PublicRoutes() {
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
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </main>
  );
}

function App() {
  const { loading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <Routes>
        {/* Public routes that load immediately */}
        <Route path="/*" element={<PublicRoutes />} />

        {/* Protected routes that show loading when checking auth */}
        <Route
          path="/profile"
          element={
            loading ? (
              <div className="container mx-auto py-8 px-4 min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            )
          }
        />

        <Route
          path="/admin/*"
          element={
            loading ? (
              <div className="container mx-auto py-8 px-4 min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            )
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
