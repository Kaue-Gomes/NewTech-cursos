import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import CourseCard from "../components/CourseCard.jsx";
import logoHero from "../assets/logo-square.jpeg";
import { getCourses } from "../services/storage.js";

export default function Home() {
  const [search, setSearch] = useState("");
  const courses = getCourses();

  const filteredCourses = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) {
      return courses.slice(0, 6);
    }

    return courses
      .filter((course) =>
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        course.instructor.toLowerCase().includes(term)
      )
      .slice(0, 6);
  }, [courses, search]);

  return (
    <>
      <Header />

      <main className="page-transition">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">NewTech Cursos</p>
              <h1>Capacitação técnica para segurança, engenharia e normas regulamentadoras.</h1>
              <p className="hero-text">
                Aprenda com uma plataforma simples, moderna e focada em cursos profissionalizantes
                para quem deseja evoluir no mercado de trabalho.
              </p>

              <div className="hero-search">
                <input
                  type="text"
                  placeholder="Pesquisar curso..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Link to="/cursos" className="btn btn-primary">Ver todos</Link>
              </div>

              <div className="hero-actions">
                <Link to="/cursos" className="btn btn-primary">Ver cursos</Link>
                <Link to="/login" className="btn btn-outline">Acessar conta</Link>
              </div>
            </div>

            <div className="hero-logo-card">
              <img src={logoHero} alt="NewTech Cursos" />
            </div>
          </div>
        </section>

        <section className="section white">
          <div className="container split">
            <div>
              <p className="eyebrow">Sobre a plataforma</p>
              <h2>Do cadastro do curso até a inscrição do aluno.</h2>
            </div>
            <p>
              A NewTech permite que o aluno visualize cursos, consulte detalhes e realize sua
              inscrição diretamente na plataforma. O administrador gerencia a vitrine cadastrando,
              editando e removendo cursos pelo painel.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Cursos disponíveis</p>
                <h2>Escolha sua próxima capacitação</h2>
              </div>
              <Link to="/cursos" className="btn btn-outline">Ver todos</Link>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="empty-state">
                <h2>Nenhum curso encontrado.</h2>
                <p>Tente pesquisar por outro termo.</p>
              </div>
            ) : (
              <div className="courses-grid">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section white">
          <div className="container features-grid">
            <div className="feature-card">
              <span>🎓</span>
              <h3>Aprendizado objetivo</h3>
              <p>Informações claras sobre carga horária, aulas, nível e conteúdo do curso.</p>
            </div>
            <div className="feature-card">
              <span>✅</span>
              <h3>Inscrição simples</h3>
              <p>O aluno escolhe o curso e realiza a inscrição diretamente na plataforma.</p>
            </div>
            <div className="feature-card">
              <span>🛠️</span>
              <h3>Gestão administrativa</h3>
              <p>O administrador cadastra, edita e exclui cursos de forma prática.</p>
            </div>
          </div>
        </section>

        <section className="section cta">
          <div className="container cta-box">
            <h2>Comece sua capacitação com a NewTech.</h2>
            <p>Veja os cursos disponíveis e escolha o treinamento ideal para seu momento profissional.</p>
            <Link to="/cursos" className="btn btn-light">Explorar cursos</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
