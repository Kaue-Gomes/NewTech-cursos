import { useEffect, useMemo, useState } from "react";
import { Library } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Breadcrumb from "../components/layout/Breadcrumb.jsx";
import BrandRail from "../components/ui/BrandRail.jsx";
import CourseCard from "../components/course/CourseCard.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { SkeletonList } from "../components/ui/Skeleton.jsx";
import { getCourses } from "../services/storage.js";
import emptyCourses from "../assets/logoempe.png";

export default function Courses() {
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return courses;
    return courses.filter((course) =>
      course.title.toLowerCase().includes(term) ||
      course.description.toLowerCase().includes(term) ||
      course.instructor.toLowerCase().includes(term) ||
      course.level.toLowerCase().includes(term)
    );
  }, [courses, search]);

  return (
    <>
      <Header />
      <main className="page page-transition">
        <div className="container">
          <Breadcrumb items={[
            { label: "Início", to: "/" },
            { label: "Cursos NR" },
          ]} />

          <div className="section-header">
            <BrandRail>
              <div>
                <span className="eyebrow eyebrow-brand"><Library size={14} /> Catálogo</span>
                <h1>Cursos NewTech</h1>
                <p style={{ color: "var(--color-text-soft)", marginTop: "var(--space-2)" }}>
                  Capacitação técnica com certificação e módulos rastreáveis.
                </p>
              </div>
            </BrandRail>
            <div className="search-field" style={{ maxWidth: 360 }}>
              <input
                type="search"
                placeholder="Pesquisar por curso, instrutor ou nível..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Pesquisar cursos"
              />
            </div>
          </div>

          {loading ? <SkeletonList count={6} /> : null}
          {!loading && filteredCourses.length === 0 ? (
            <EmptyState
              illustration={<img src={emptyCourses} alt="" />}
              title="Nenhum curso encontrado"
              description="Tente pesquisar por outro termo, NR ou área."
              actionLabel="Limpar pesquisa"
              onAction={() => setSearch("")}
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
      </main>
      <Footer />
    </>
  );
}
