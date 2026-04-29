import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Edit3,
  GraduationCap,
  IdCard,
  Image,
  Layers,
  LayoutDashboard,
  Mail,
  MapPin,
  Phone,
  PlayCircle,
  PlusCircle,
  Search,
  SearchX,
  Settings,
  Sparkles,
  Trash2,
  Users,
  Wrench,
  X
} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { getStudents } from "../services/auth.js";
import {
  addCourse,
  deleteCourse,
  getCourses,
  getStudentEnrollments,
  updateCourse
} from "../services/storage.js";

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

const TABS = [
  { id: "cadastrar", label: "Cadastrar curso", icon: PlusCircle },
  { id: "gerenciar", label: "Gerenciar cursos", icon: Layers },
  { id: "alunos", label: "Alunos cadastrados", icon: Users }
];

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

  const totalEnrollments = useMemo(() => {
    return students.reduce(
      (acc, student) => acc + getStudentEnrollments(student.email).length,
      0
    );
  }, [students, courses]);

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
              <span className="eyebrow eyebrow-light">
                <LayoutDashboard size={14} /> Painel administrativo
              </span>
              <h1>Painel ADM NewTech</h1>
              <p>Gerencie cursos, edições e cadastros de alunos em um só lugar.</p>
            </div>

            <div className="admin-kpis">
              <div>
                <strong>{courses.length}</strong>
                <span><BookOpen size={12} /> Cursos</span>
              </div>
              <div>
                <strong>{students.length}</strong>
                <span><Users size={12} /> Alunos</span>
              </div>
              <div>
                <strong>{totalEnrollments}</strong>
                <span><Sparkles size={12} /> Inscrições</span>
              </div>
            </div>
          </div>

          <div className="admin-layout">
            <aside className="account-sidebar">
              <nav className="admin-tabs">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={activeTab === tab.id ? "active" : ""}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon />
                      {tab.id === "cadastrar" && editingId ? "Editar curso" : tab.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div>
              {activeTab === "cadastrar" && (
                <section className="admin-form-card separated">
                  <div className="account-card-head">
                    <h2>{editingId ? "Editar curso cadastrado" : "Cadastrar novo curso"}</h2>
                    <p>
                      Preencha as informações necessárias do curso. Ao salvar, ele aparece automaticamente na Home e no catálogo.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="admin-form">
                    <label>
                      Título do curso
                      <div className="input-with-icon">
                        <BookOpen />
                        <input name="title" value={form.title} onChange={handleChange} placeholder="Ex: NR10 Segurança em Instalações Elétricas" required />
                      </div>
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
                        <input name="level" value={form.level} onChange={handleChange} placeholder="Ex: Básico ao intermediário" required />
                      </label>

                      <label>
                        Instrutor
                        <input name="instructor" value={form.instructor} onChange={handleChange} placeholder="Nome do instrutor" required />
                      </label>
                    </div>

                    <label>
                      URL da imagem do curso
                      <div className="input-with-icon">
                        <Image />
                        <input name="image" value={form.image} onChange={handleChange} placeholder="Cole uma URL de imagem (opcional)" />
                      </div>
                    </label>

                    <label>
                      Descrição
                      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Resumo do curso, público-alvo e objetivos." required />
                    </label>

                    <label>
                      Conteúdo programático
                      <textarea name="content" value={form.content} onChange={handleChange} placeholder="Tópicos, módulos, conteúdo abordado." required />
                    </label>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        {editingId ? <Wrench /> : <PlusCircle />}
                        {editingId ? "Salvar edição" : "Cadastrar curso"}
                      </button>

                      {editingId && (
                        <button type="button" className="btn btn-outline" onClick={cancelEdit}>
                          <X />
                          Cancelar edição
                        </button>
                      )}
                    </div>
                  </form>
                </section>
              )}

              {activeTab === "gerenciar" && (
                <section className="admin-section-card">
                  <div className="account-card-head">
                    <h2>Cursos cadastrados</h2>
                    <p>Total: {courses.length} curso{courses.length !== 1 ? "s" : ""} na plataforma.</p>
                  </div>

                  <div className="search-box">
                    <Search />
                    <input
                      type="text"
                      placeholder="Pesquisar curso por título, instrutor ou nível..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>

                  <div className="admin-course-table">
                    {filteredCourses.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <SearchX />
                        </div>
                        <h2>Nenhum curso encontrado</h2>
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
                            <button className="btn btn-outline sm" onClick={() => handleEdit(course)}>
                              <Edit3 />
                              Editar
                            </button>
                            <button className="btn btn-danger sm" onClick={() => handleDelete(course.id)}>
                              <Trash2 />
                              Excluir
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              )}

              {activeTab === "alunos" && (
                <section className="admin-section-card">
                  <div className="account-card-head">
                    <h2>Alunos cadastrados</h2>
                    <p>Visualize os dados dos alunos e suas inscrições nos cursos.</p>
                  </div>

                  <div className="search-box">
                    <Search />
                    <input
                      type="text"
                      placeholder="Pesquisar aluno por nome, e-mail ou telefone..."
                      value={studentSearch}
                      onChange={(event) => setStudentSearch(event.target.value)}
                    />
                  </div>

                  {filteredStudents.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <SearchX />
                      </div>
                      <h2>Nenhum aluno encontrado</h2>
                      <p>Tente pesquisar por outro termo.</p>
                    </div>
                  ) : (
                    <div className="students-grid">
                      {filteredStudents.map((student) => {
                        const enrollments = getStudentEnrollments(student.email);
                        const initials = student.name
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")
                          .toUpperCase();

                        return (
                          <article className="student-card" key={student.id}>
                            <div className="student-card-header">
                              <div className="student-avatar">{initials}</div>
                              <div>
                                <h3>{student.name}</h3>
                                <p>{student.email}</p>
                              </div>
                            </div>

                            <div className="student-info-list">
                              <span>
                                <Phone />
                                <span><strong>Telefone:</strong> {student.phone || "Não informado"}</span>
                              </span>
                              <span>
                                <IdCard />
                                <span><strong>Documento:</strong> {student.document || "Não informado"}</span>
                              </span>
                              <span>
                                <MapPin />
                                <span>
                                  <strong>Cidade:</strong> {student.address?.city || "Não informada"}
                                  {student.address?.state ? ` - ${student.address.state}` : ""}
                                </span>
                              </span>
                              <span>
                                <PlayCircle />
                                <span><strong>Cursos inscritos:</strong> {enrollments.length}</span>
                              </span>
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
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
