import { Link } from "react-router-dom";
import { Award, BookOpen, GraduationCap, Sparkles, TrendingUp } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import CourseCard from "../components/CourseCard.jsx";
import { getCurrentUser } from "../services/auth.js";
import { getStudentCourses } from "../services/storage.js";

export default function StudentArea() {
  const user = getCurrentUser();
  const myCourses = getStudentCourses(user.email);

  return (
    <>
      <Header />
      <main className="page page-transition">
        <div className="container">
          <div className="admin-dashboard-header">
            <div>
              <span className="eyebrow eyebrow-light">
                <Sparkles size={14} /> Área do aluno
              </span>
              <h1>Olá, {user.name?.split(" ")[0] || "aluno"}!</h1>
              <p>Aqui aparecem apenas os cursos em que você já se inscreveu na plataforma.</p>
            </div>

            <div className="admin-kpis">
              <div>
                <strong>{myCourses.length}</strong>
                <span>Cursos inscritos</span>
              </div>
              <div>
                <strong>{myCourses.length > 0 ? "Em curso" : "—"}</strong>
                <span>Status atual</span>
              </div>
            </div>
          </div>

          <div className="section-title-row">
            <div>
              <span className="eyebrow eyebrow-blue">
                <BookOpen size={14} /> Meus cursos
              </span>
              <h2>Continue sua capacitação</h2>
              <p>Acesse os cursos em que você já está inscrito.</p>
            </div>

            <Link to="/cursos" className="btn btn-outline">
              Explorar mais cursos
            </Link>
          </div>

          {myCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <GraduationCap />
              </div>
              <h2>Você ainda não tem cursos inscritos</h2>
              <p>
                Escolha um curso no catálogo e faça sua inscrição diretamente
                pela plataforma para começar agora mesmo.
              </p>
              <Link to="/cursos" className="btn btn-primary">
                Ver cursos disponíveis
              </Link>
            </div>
          ) : (
            <div className="courses-grid">
              {myCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
