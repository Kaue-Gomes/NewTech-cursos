import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import Courses from "../pages/Courses.jsx";
import CourseDetail from "../pages/CourseDetail.jsx";
import StudentArea from "../pages/StudentArea.jsx";
import AdminArea from "../pages/AdminArea.jsx";
import Account from "../pages/Account.jsx";
import { getCurrentUser } from "../services/auth.js";
import ScrollToTop from "../components/ScrollToTop.jsx";

function ProtectedRoute({ children, role }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/aluno"} replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cursos" element={<Courses />} />
        <Route path="/curso/:id" element={<CourseDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />

        <Route
          path="/aluno"
          element={
            <ProtectedRoute role="student">
              <StudentArea />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminArea />
            </ProtectedRoute>
          }
        />


        <Route
          path="/minha-conta"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
