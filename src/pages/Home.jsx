import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  GraduationCap,
  Cog,
  Sparkles,
  CheckCircle2,
  Award,
  Star,
  Zap,
  ClipboardCheck,
  Trophy,
  HardHat,
  BookOpen
} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import CourseCard from "../components/CourseCard.jsx";
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
              <span className="eyebrow">
                <Sparkles size={14} /> Plataforma NewTech
              </span>

              <h1>
                Capacitação técnica em <span className="accent">segurança</span>, engenharia e NRs.
              </h1>

              <p className="hero-text">
                Aprenda com uma plataforma moderna, simples e focada em cursos profissionalizantes
                para quem quer evoluir no mercado de trabalho com certificação reconhecida.
              </p>

              <div className="hero-search">
                <div className="hero-search-input">
                  <Search />
                  <input
                    type="text"
                    placeholder="Pesquisar por curso, NR ou área..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <Link to="/cursos" className="btn btn-orange">
                  Buscar
                </Link>
              </div>

              <div className="hero-actions">
                <Link to="/cursos" className="btn btn-primary big">
                  Ver cursos disponíveis
                  <ArrowRight />
                </Link>
                <Link to="/login" className="btn btn-outline big">
                  Acessar minha conta
                </Link>
              </div>

              <div className="hero-trust">
                <div className="hero-avatars">
                  <span>JS</span>
                  <span>MR</span>
                  <span>AL</span>
                  <span>+</span>
                </div>
                <div className="hero-trust-text">
                  <span className="hero-trust-stars">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                  </span>
                  <strong>4.9 de avaliação média</strong>
                  Mais de 500+ alunos certificados pela NewTech
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card">
                <div className="hero-card-header">
                  <span className="hero-card-icon">
                    <BookOpen />
                  </span>
                  <div>
                    <h3>Seu progresso</h3>
                    <p>Capacitação em andamento</p>
                  </div>
                </div>

                <div className="hero-progress-list">
                  <div className="hero-progress-item">
                    <div className="hero-progress-item-top">
                      <span>NR10 Segurança Elétrica</span>
                      <span>78%</span>
                    </div>
                    <div className="hero-progress-bar" style={{ "--w": "78%" }} />
                  </div>

                  <div className="hero-progress-item">
                    <div className="hero-progress-item-top">
                      <span>NR35 Trabalho em Altura</span>
                      <span>52%</span>
                    </div>
                    <div className="hero-progress-bar orange" style={{ "--w": "52%" }} />
                  </div>

                  <div className="hero-progress-item">
                    <div className="hero-progress-item-top">
                      <span>Leitura de Projetos</span>
                      <span>34%</span>
                    </div>
                    <div className="hero-progress-bar" style={{ "--w": "34%" }} />
                  </div>
                </div>
              </div>

              <span className="floating-chip f-1">
                <Trophy /> Certificado oficial
              </span>
              <span className="floating-chip f-2">
                <Zap /> Acesso imediato
              </span>
            </div>
          </div>
        </section>

        <section className="section white">
          <div className="container">
            <div className="section-header">
              <span className="eyebrow eyebrow-blue">
                <Sparkles size={14} /> Por que NewTech?
              </span>
              <h2>Aprendizado prático, certificação reconhecida.</h2>
              <p>
                Tudo o que você precisa para se capacitar em uma única plataforma —
                do conteúdo objetivo à inscrição direta.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <GraduationCap />
                </div>
                <h3>Aprendizado objetivo</h3>
                <p>Carga horária definida, aulas claras, conteúdo focado e nível indicado para cada curso.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <ClipboardCheck />
                </div>
                <h3>Inscrição simples</h3>
                <p>O aluno escolhe o curso e realiza a inscrição diretamente na plataforma em poucos cliques.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Cog />
                </div>
                <h3>Gestão administrativa</h3>
                <p>O administrador cadastra, edita e gerencia cursos e alunos em um painel intuitivo.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-title-row">
              <div>
                <span className="eyebrow eyebrow-blue">
                  <HardHat size={14} /> Cursos disponíveis
                </span>
                <h2>Escolha sua próxima capacitação</h2>
                <p>Trilhas profissionalizantes em engenharia, segurança e normas regulamentadoras.</p>
              </div>
              <Link to="/cursos" className="btn btn-outline">
                Ver todos
                <ArrowRight />
              </Link>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Search />
                </div>
                <h2>Nenhum curso encontrado</h2>
                <p>Tente pesquisar por outro termo, NR ou área.</p>
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

        <section className="section dark">
          <div className="container">
            <div className="section-header">
              <span className="eyebrow eyebrow-light">
                <Award size={14} /> Resultados que falam
              </span>
              <h2>A plataforma certa para sua evolução profissional.</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <strong>500+</strong>
                <span>Alunos certificados</span>
              </div>
              <div className="stat-card">
                <strong>20+</strong>
                <span>Cursos profissionalizantes</span>
              </div>
              <div className="stat-card">
                <strong>4.9</strong>
                <span>Nota média de avaliações</span>
              </div>
              <div className="stat-card">
                <strong>100%</strong>
                <span>Online e na sua rotina</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cta-banner">
              <span className="eyebrow eyebrow-light" style={{ marginInline: "auto" }}>
                <ShieldCheck size={14} /> Comece agora
              </span>
              <h2>Capacite-se com a NewTech.</h2>
              <p>
                Veja os cursos disponíveis e escolha o treinamento ideal para o
                seu próximo passo profissional. Inscrição rápida, conteúdo certo.
              </p>
              <div className="cta-banner-actions">
                <Link to="/cursos" className="btn btn-orange big">
                  Explorar cursos
                  <ArrowRight />
                </Link>
                <Link to="/cadastro" className="btn btn-light big">
                  Criar conta gratuita
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
