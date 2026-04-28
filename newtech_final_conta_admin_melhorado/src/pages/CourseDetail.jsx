import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { getCourseById, enrollStudent } from "../services/storage.js";
import { getCurrentUser } from "../services/auth.js";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = getCourseById(id);
  const user = getCurrentUser();

  if (!course) {
    return (
      <>
        <Header />
        <main className="page page-transition">
          <div className="container">
            <h1>Curso não encontrado</h1>
            <Link to="/cursos" className="btn btn-primary">Voltar para cursos</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  function handleEnroll() {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "student") {
      alert("Apenas alunos podem se inscrever em cursos.");
      return;
    }

    enrollStudent(user.email, course.id);
    alert("Inscrição realizada com sucesso!");
    navigate("/aluno");
  }

  return (
    <>
      <Header />
      <main className="page page-transition">
        <div className="container detail-grid">
          <img className="detail-image" src={course.image} alt={course.title} />

          <div className="detail-content">
            <Link to="/cursos" className="back-link">← Voltar para cursos</Link>
            <p className="eyebrow">Detalhes do curso</p>
            <h1>{course.title}</h1>
            <p>{course.description}</p>

            <div className="info-grid">
              <div><strong>Carga horária</strong><span>{course.workload}</span></div>
              <div><strong>Aulas</strong><span>{course.lessons}</span></div>
              <div><strong>Nível</strong><span>{course.level}</span></div>
              <div><strong>Instrutor</strong><span>{course.instructor}</span></div>
            </div>

            <div className="content-box">
              <h3>Conteúdo do curso</h3>
              <p>{course.content}</p>
            </div>

            <button onClick={handleEnroll} className="btn btn-primary big">
              Inscrever-se no curso
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
