import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { ArrowLeft, Library, Search, SearchX } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import CourseCard from "../components/CourseCard.jsx";
import { getCourses } from "../services/storage.js";

export default function Courses() {
  const [search, setSearch] = useState("");
  const courses = getCourses();

  const filteredCourses = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) {
      return courses;
    }

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
          <Link to="/" className="back-link">
            <ArrowLeft />
            Voltar para Home
          </Link>

          <div className="page-header">
            <span className="eyebrow eyebrow-blue">
              <Library size={14} /> Catálogo
            </span>
            <h1>Cursos NewTech</h1>
            <p>
              Escolha um curso, veja os detalhes e faça sua inscrição diretamente
              na plataforma. Conteúdo profissionalizante feito para sua evolução.
            </p>
          </div>

          <div className="search-box">
            <Search />
            <input
              type="text"
              placeholder="Pesquisar por curso, instrutor ou nível..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {filteredCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <SearchX />
              </div>
              <h2>Nenhum curso encontrado</h2>
              <p>Tente pesquisar por outro termo, NR ou área.</p>
              <button className="btn btn-outline" onClick={() => setSearch("")}>
                Limpar pesquisa
              </button>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course) => (
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
