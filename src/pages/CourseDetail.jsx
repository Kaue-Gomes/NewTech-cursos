import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  PlayCircle,
  Sparkles,
  User,
  Zap
} from "lucide-react";
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
            <div className="empty-state">
              <div className="empty-state-icon">
                <BookOpen />
              </div>
              <h2>Curso não encontrado</h2>
              <p>O curso que você está procurando não existe ou foi removido.</p>
              <Link to="/cursos" className="btn btn-primary">
                Voltar para cursos
              </Link>
            </div>
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
        <div className="container">
          <Link to="/cursos" className="back-link">
            <ArrowLeft />
            Voltar para cursos
          </Link>

          <div className="detail-grid">
            <div className="detail-image-wrap">
              <img className="detail-image" src={course.image} alt={course.title} />
            </div>

            <div>
              <div className="detail-content">
                <span className="eyebrow eyebrow-blue">
                  <Sparkles size={14} /> Detalhes do curso
                </span>
                <h1>{course.title}</h1>
                <p>{course.description}</p>

                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-item-icon"><Clock /></span>
                    <div className="info-item-text">
                      <small>Carga horária</small>
                      <strong>{course.workload}</strong>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-item-icon"><PlayCircle /></span>
                    <div className="info-item-text">
                      <small>Aulas</small>
                      <strong>{course.lessons}</strong>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-item-icon"><GraduationCap /></span>
                    <div className="info-item-text">
                      <small>Nível</small>
                      <strong>{course.level}</strong>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-item-icon"><User /></span>
                    <div className="info-item-text">
                      <small>Instrutor</small>
                      <strong>{course.instructor}</strong>
                    </div>
                  </div>
                </div>

                <div className="content-box">
                  <h3>
                    <BookOpen />
                    Conteúdo programático
                  </h3>
                  <p>{course.content}</p>
                </div>
              </div>

              <div className="enroll-card">
                <ul className="enroll-card-features">
                  <li><CheckCircle2 /> Acesso imediato após inscrição</li>
                  <li><Award /> Certificado oficial NewTech</li>
                  <li><Zap /> Conteúdo prático e direto</li>
                </ul>
                <button onClick={handleEnroll} className="btn btn-orange big full">
                  Inscrever-se agora
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
