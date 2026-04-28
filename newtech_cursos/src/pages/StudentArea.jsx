import { Link } from "react-router-dom";
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
          <div className="page-header">
            <p className="eyebrow">Área do aluno</p>
            <h1>Meus cursos</h1>
            <p>Aqui aparecem apenas os cursos em que você já se inscreveu.</p>
          </div>

          {myCourses.length === 0 ? (
            <div className="empty-state">
              <h2>Você ainda não possui cursos inscritos.</h2>
              <p>Escolha um curso no catálogo e faça sua inscrição pelo WhatsApp.</p>
              <Link to="/cursos" className="btn btn-primary">Ver cursos disponíveis</Link>
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
