import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth.js";
import ScrollToTop from "../components/ScrollToTop.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";

const Home = lazy(() => import("../pages/Home.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const Register = lazy(() => import("../pages/Register.jsx"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword.jsx"));
const Courses = lazy(() => import("../pages/Courses.jsx"));
const CourseDetail = lazy(() => import("../pages/CourseDetail.jsx"));
const StudentArea = lazy(() => import("../pages/StudentArea.jsx"));
const CertificatePage = lazy(() => import("../pages/CertificatePage.jsx"));
const AdminArea = lazy(() => import("../pages/AdminArea.jsx"));
const CourseEditor = lazy(() => import("../pages/admin/CourseEditor.jsx"));
const Account = lazy(() => import("../pages/Account.jsx"));
const LessonPage = lazy(() => import("../pages/LessonPage.jsx"));

function PageFallback() {
  return (
    <div className="container page" style={{ paddingTop: "var(--space-16)" }}>
      <Skeleton className="skeleton-card" />
    </div>
  );
}

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
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cursos" element={<Courses />} />
          <Route path="/curso/:id" element={<CourseDetail />} />
          <Route path="/curso/:courseSlug/aula/:lessonSlug" element={<LessonPage />} />
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
            path="/aluno/certificado/:code"
            element={
              <ProtectedRoute role="student">
                <CertificatePage />
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
            path="/admin/curso/:id"
            element={
              <ProtectedRoute role="admin">
                <CourseEditor />
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
      </Suspense>
    </BrowserRouter>
  );
}
