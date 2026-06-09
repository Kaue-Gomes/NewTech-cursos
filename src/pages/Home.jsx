import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ShieldCheck, HardHat, Zap } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import CourseCard from "../components/course/CourseCard.jsx";
import BrandRail from "../components/ui/BrandRail.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { SkeletonList } from "../components/ui/Skeleton.jsx";
import { getCourses } from "../services/storage.js";
import { getPlatformStats } from "../services/platform.js";
import heroIllustration from "../assets/logo-horizontal.png";
import emptyCourses from "../assets/logoempe.png";

export default function Home() {
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCourses(), getPlatformStats()])
      .then(([coursesData, statsData]) => {
        setCourses(coursesData);
        setStats(statsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return courses.slice(0, 6);
    return courses.filter((course) =>
      course.title.toLowerCase().includes(term) ||
      course.description.toLowerCase().includes(term)
    ).slice(0, 6);
  }, [courses, search]);

  return (
    <>
      <Header />
      <main className="page-transition">
        <section className="hero-v2 technical-grid-bg">
          <div className="container hero-v2-grid">
            <div>
              <span className="eyebrow eyebrow-brand">Plataforma NewTech</span>
              <BrandRail full>
                <h1>Capacitação técnica e certificação NR para profissionais da indústria</h1>
              </BrandRail>
              <p className="hero-v2-lead">
                Cursos para técnicos, eletricistas, engenheiros e equipes que precisam
                cumprir normas regulamentadoras com rastreabilidade e credibilidade.
              </p>
              <div className="hero-v2-actions">
                <Link to="/cursos" className="btn btn-primary btn-lg">
                  Ver cursos NR
                  <ArrowRight size={18} />
                </Link>
                <Link to="/cadastro" className="btn btn-secondary btn-lg">
                  Sou empresa / aluno
                </Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <strong>{stats?.activeCourses ?? "—"}</strong>
                  <span>Cursos ativos</span>
                </div>
                <div className="hero-stat">
                  <strong>{stats?.totalStudents ?? "—"}</strong>
                  <span>Alunos cadastrados</span>
                </div>
                <div className="hero-stat">
                  <strong>{stats?.totalEnrollments ?? "—"}</strong>
                  <span>Inscrições realizadas</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <img src={heroIllustration} alt="" />
            </div>
          </div>
        </section>

        <section className="page">
          <div className="container">
            <div className="section-header">
              <BrandRail>
                <div>
                  <span className="eyebrow">Catálogo técnico</span>
                  <h2>Cursos em destaque</h2>
                </div>
              </BrandRail>
              <div className="search-field" style={{ maxWidth: 320 }}>
                <input
                  type="search"
                  placeholder="Filtrar por NR, área ou instrutor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Filtrar cursos"
                />
              </div>
            </div>

            {loading ? <SkeletonList count={3} /> : null}
            {!loading && filteredCourses.length === 0 ? (
              <EmptyState
                illustration={<img src={emptyCourses} alt="" />}
                title="Nenhum curso encontrado"
                description="Ajuste os filtros ou explore o catálogo completo de capacitação NR."
                actionLabel="Ver todos os cursos"
                actionTo="/cursos"
              />
            ) : null}
            {!loading && filteredCourses.length > 0 ? (
              <div className="courses-grid">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} status="available" />
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="page" style={{ paddingTop: 0 }}>
          <div className="container feature-grid kpi-grid">
            <div className="kpi-tile kpi-tile--feature"><ShieldCheck size={20} /><strong>NR10 / NR35</strong><span>Segurança do trabalho</span></div>
            <div className="kpi-tile kpi-tile--feature"><Zap size={20} /><strong>Eletricidade</strong><span>Instalações e riscos</span></div>
            <div className="kpi-tile kpi-tile--feature"><HardHat size={20} /><strong>Altura</strong><span>Capacitação essencial</span></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
