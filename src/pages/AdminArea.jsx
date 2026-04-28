import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { getStudents } from "../services/auth.js";
import { getStudentEnrollments, addCourse, deleteCourse, getCourses, updateCourse } from "../services/storage.js";

const initialForm = {
  title: "",
  workload: "",
  lessons: "",
  level: "",
  instructor: "",
  image: "",
  description: "",
  content: ""
};

export default function AdminArea() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [activeTab, setActiveTab] = useState("cadastrar");

  useEffect(() => {
    setCourses(getCourses());
    setStudents(getStudents());
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

  const filteredStudents = useMemo(() => {
    const term = studentSearch.toLowerCase().trim();
    if (!term) return students;

    return students.filter((student) =>
      student.name.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term) ||
      (student.phone || "").toLowerCase().includes(term)
    );
  }, [students, studentSearch]);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const imageValue =
      form.image ||
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80";

    const courseData = { ...form, image: imageValue };

    if (editingId) {
      const updated = updateCourse(editingId, courseData);
      setCourses(updated);
      setEditingId(null);
      alert("Curso editado com sucesso!");
      setActiveTab("gerenciar");
    } else {
      addCourse(courseData);
      setCourses(getCourses());
      alert("Curso cadastrado com sucesso!");
    }

    setForm(initialForm);
  }

  function handleEdit(course) {
    setEditingId(course.id);
    setForm({
      title: course.title,
      workload: course.workload,
      lessons: course.lessons,
      level: course.level,
      instructor: course.instructor,
      image: course.image,
      description: course.description,
      content: course.content
    });
    setActiveTab("cadastrar");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id) {
    const confirmDelete = confirm("Deseja realmente excluir este curso?");
    if (!confirmDelete) return;

    const updated = deleteCourse(id);
    setCourses(updated);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm);
  }

  return (
    <>
      <Header />
      <main className="page page-transition">
        <div className="container">
          <div className="admin-dashboard-header">
            <div>
              <p className="eyebrow">Área administrativa</p>
              <h1>Painel ADM NewTech</h1>
              <p>Gerencie cursos, edições e cadastros de alunos em um só lugar.</p>
            </div>

            <div className="admin-kpis">
              <div><strong>{courses.length}</strong><span>Cursos</span></div>
              <div><strong>{students.length}</strong><span>Alunos</span></div>
            </div>
          </div>

          <div className="admin-tabs">
            <button className={activeTab === "cadastrar" ? "active" : ""} onClick={() => setActiveTab("cadastrar")}>
              {editingId ? "Editar curso" : "Cadastrar curso"}
            </button>
            <button className={activeTab === "gerenciar" ? "active" : ""} onClick={() => setActiveTab("gerenciar")}>
              Gerenciar cursos
            </button>
            <button className={activeTab === "alunos" ? "active" : ""} onClick={() => setActiveTab("alunos")}>
              Alunos cadastrados
            </button>
          </div>

          {activeTab === "cadastrar" && (
            <section className="admin-form-card separated">
              <h2>{editingId ? "Editar curso cadastrado" : "Cadastrar novo curso"}</h2>
              <p>
                Preencha as informações necessárias do curso. Ao salvar, ele aparece automaticamente na Home e no catálogo.
              </p>

              <form onSubmit={handleSubmit} className="admin-form">
                <label>
                  Título do curso
                  <input name="title" value={form.title} onChange={handleChange} required />
                </label>

                <div className="form-row">
                  <label>
                    Carga horária
                    <input name="workload" value={form.workload} onChange={handleChange} placeholder="Ex: 40h" required />
                  </label>

                  <label>
                    Quantidade de aulas
                    <input name="lessons" value={form.lessons} onChange={handleChange} placeholder="Ex: 18 aulas" required />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Nível
                    <input name="level" value={form.level} onChange={handleChange} placeholder="Ex: Básico" required />
                  </label>

                  <label>
                    Instrutor
                    <input name="instructor" value={form.instructor} onChange={handleChange} required />
                  </label>
                </div>

                <label>
                  URL da imagem do curso
                  <input name="image" value={form.image} onChange={handleChange} placeholder="Cole uma URL de imagem" />
                </label>

                <label>
                  Descrição
                  <textarea name="description" value={form.description} onChange={handleChange} required />
                </label>

                <label>
                  Conteúdo programático
                  <textarea name="content" value={form.content} onChange={handleChange} required />
                </label>

                <div className="form-actions">
                  <button className="btn btn-primary">
                    {editingId ? "Salvar edição" : "Cadastrar curso"}
                  </button>

                  {editingId && (
                    <button type="button" className="btn btn-outline" onClick={cancelEdit}>
                      Cancelar edição
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}

          {activeTab === "gerenciar" && (
            <section className="admin-section-card">
              <div className="section-title-row">
                <div>
                  <h2>Cursos cadastrados</h2>
                  <p>Total: {courses.length}</p>
                </div>
              </div>

              <div className="search-box admin-search">
                <input
                  type="text"
                  placeholder="Pesquisar curso cadastrado..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="admin-course-table">
                {filteredCourses.length === 0 ? (
                  <div className="empty-state">
                    <h2>Nenhum curso encontrado.</h2>
                    <p>Tente pesquisar por outro termo.</p>
                  </div>
                ) : (
                  filteredCourses.map((course) => (
                    <article className="admin-course-row" key={course.id}>
                      <img src={course.image} alt={course.title} />
                      <div className="admin-course-info">
                        <h3>{course.title}</h3>
                        <p>{course.workload} • {course.lessons} • {course.level}</p>
                        <span>{course.instructor}</span>
                      </div>
                      <div className="admin-buttons">
                        <button className="btn btn-outline" onClick={() => handleEdit(course)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(course.id)}>Excluir</button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === "alunos" && (
            <section className="admin-section-card">
              <div className="section-title-row">
                <div>
                  <h2>Alunos cadastrados</h2>
                  <p>Visualize os dados dos alunos e suas inscrições.</p>
                </div>
              </div>

              <div className="search-box admin-search">
                <input
                  type="text"
                  placeholder="Pesquisar aluno por nome, e-mail ou telefone..."
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                />
              </div>

              <div className="students-grid">
                {filteredStudents.map((student) => {
                  const enrollments = getStudentEnrollments(student.email);

                  return (
                    <article className="student-card" key={student.id}>
                      <div className="student-card-header">
                        <div className="student-avatar">
                          {student.name
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <h3>{student.name}</h3>
                          <p>{student.email}</p>
                        </div>
                      </div>

                      <div className="student-info-list">
                        <span><strong>Telefone:</strong> {student.phone || "Não informado"}</span>
                        <span><strong>Documento:</strong> {student.document || "Não informado"}</span>
                        <span><strong>Cidade:</strong> {student.address?.city || "Não informada"} - {student.address?.state || ""}</span>
                        <span><strong>Cursos inscritos:</strong> {enrollments.length}</span>
                      </div>

                      {enrollments.length > 0 && (
                        <div className="student-courses">
                          {enrollments.map((item) => (
                            <small key={item.id}>{item.course.title}</small>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
