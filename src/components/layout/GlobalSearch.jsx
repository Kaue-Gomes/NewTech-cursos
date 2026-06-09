import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { getCurrentUser } from "../../services/auth.js";
import { globalSearch } from "../../services/platform.js";
import { useDebounce } from "../../hooks/useDebounce.js";

export default function GlobalSearchField() {
  const user = getCurrentUser();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState({ courses: [], enrollments: [], certificates: [] });
  const debounced = useDebounce(query, 300);
  const ref = useRef(null);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults({ courses: [], enrollments: [], certificates: [] });
      return;
    }
    globalSearch(debounced, user?.email)
      .then(setResults)
      .catch(console.error);
  }, [debounced, user?.email]);

  useEffect(() => {
    function onClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const hasResults =
    results.courses.length || results.enrollments.length || results.certificates.length;

  return (
    <div className="global-search" ref={ref}>
      <Search aria-hidden />
      <input
        type="search"
        placeholder="Buscar cursos, inscrições..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        aria-label="Busca global"
      />
      {open && query && hasResults ? (
        <div className="search-panel">
          {results.courses.length ? (
            <section>
              <h4>Cursos</h4>
              {results.courses.map((course) => (
                <Link key={course.id} to={`/curso/${course.id}`} onClick={() => setOpen(false)}>
                  {course.title}
                </Link>
              ))}
            </section>
          ) : null}
          {results.enrollments.length ? (
            <section>
              <h4>Inscrições</h4>
              {results.enrollments.map((item) => (
                <Link key={item.id} to="/aluno" onClick={() => setOpen(false)}>
                  {item.course?.title || item.course_title}
                </Link>
              ))}
            </section>
          ) : null}
          {results.certificates.length ? (
            <section>
              <h4>Certificados</h4>
              {results.certificates.map((cert) => (
                <Link key={cert.id} to={`/aluno/certificado/${cert.code}`} onClick={() => setOpen(false)}>
                  {cert.course_title} — {cert.code}
                </Link>
              ))}
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
