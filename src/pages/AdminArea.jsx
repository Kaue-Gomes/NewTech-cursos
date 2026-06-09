import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Edit3,
  IdCard,
  Image,
  Layers,
  MapPin,
  Phone,
  PlayCircle,
  PlusCircle,
  Search,
  Trash2,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Breadcrumb from "../components/layout/Breadcrumb.jsx";
import BrandRail from "../components/ui/BrandRail.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import KpiTile from "../components/dashboard/KpiTile.jsx";
import { getStudents } from "../services/auth.js";
import { bulkCompleteEnrollments } from "../services/platform.js";
import {
  addCourse,
  deleteCourse,
  getCourses,
  getStudentEnrollments,
  updateCourse,
} from "../services/storage.js";
import { useToast } from "../context/ToastContext.jsx";

const initialForm = {
  title: "",
  workload: "",
  lessons: "",
  level: "",
  instructor: "",
  image: "",
  description: "",
  content: "",
};

const TABS = [
  { id: "cadastrar", label: "Cadastrar curso", icon: PlusCircle },
  { id: "gerenciar", label: "Gerenciar cursos", icon: Layers },
  { id: "inscricoes", label: "Inscrições", icon: ClipboardList },
  { id: "alunos", label: "Alunos", icon: Users },
];

const STORAGE_KEYS = {
  tab: "newtech_admin_tab",
  courseSearch: "newtech_admin_course_search",
  studentSearch: "newtech_admin_student_search",
  enrollmentSearch: "newtech_admin_enrollment_search",
};

export default function AdminArea() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollmentsByEmail, setEnrollmentsByEmail] = useState({});
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState(() => localStorage.getItem(STORAGE_KEYS.courseSearch) || "");
  const [studentSearch, setStudentSearch] = useState(() => localStorage.getItem(STORAGE_KEYS.studentSearch) || "");
  const [enrollmentSearch, setEnrollmentSearch] = useState(() => localStorage.getItem(STORAGE_KEYS.enrollmentSearch) || "");
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem(STORAGE_KEYS.tab) || "cadastrar");
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);

  async function loadAdminData() {
    const [coursesData, studentsData] = await Promise.all([getCourses(), getStudents()]);
    setCourses(coursesData);
    setStudents(studentsData);

    const enrollmentEntries = await Promise.all(
      studentsData.map(async (student) => [student.email, await getStudentEnrollments(student.email)])
    );
    setEnrollmentsByEmail(Object.fromEntries(enrollmentEntries));
  }

  useEffect(() => {
    loadAdminData().catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.tab, activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.courseSearch, search);
  }, [search]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.studentSearch, studentSearch);
  }, [studentSearch]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.enrollmentSearch, enrollmentSearch);
  }, [enrollmentSearch]);

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

  const allEnrollments = useMemo(() => {
    return Object.entries(enrollmentsByEmail).flatMap(([email, items]) =>
      items.map((item) => ({
        ...item,
        studentEmail: email,
        studentName: students.find((s) => s.email === email)?.name || email,
      }))
    );
  }, [enrollmentsByEmail, students]);

  const filteredEnrollments = useMemo(() => {
    const term = enrollmentSearch.toLowerCase().trim();
    if (!term) return allEnrollments;
    return allEnrollments.filter((item) =>
      item.studentName.toLowerCase().includes(term) ||
      item.studentEmail.toLowerCase().includes(term) ||
      item.course?.title?.toLowerCase().includes(term) ||
      item.status.toLowerCase().includes(term)
    );
  }, [allEnrollments, enrollmentSearch]);

  const totalEnrollments = allEnrollments.length;
  const activeTabLabel = TABS.find((tab) => tab.id === activeTab)?.label || "Admin";

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const imageValue =
      form.image ||
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80";
    const courseData = { ...form, image: imageValue };

    try {
      if (editingId) {
        await updateCourse(editingId, courseData);
        setEditingId(null);
        showToast("Curso editado com sucesso.", "success");
        setActiveTab("gerenciar");
      } else {
        await addCourse(courseData);
        showToast("Curso cadastrado com sucesso.", "success");
      }
      await loadAdminData();
      setForm(initialForm);
    } catch (error) {
      showToast(error.message || "Não foi possível salvar o curso.", "error");
    }
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
      content: course.content,
    });
    setActiveTab("cadastrar");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja realmente excluir este curso?")) return;
    try {
      await deleteCourse(id);
      await loadAdminData();
      showToast("Curso excluído.", "success");
    } catch (error) {
      showToast(error.message || "Não foi possível excluir o curso.", "error");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm);
  }

  function toggleEnrollmentSelection(id) {
    setSelectedEnrollments((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  async function handleBulkComplete() {
    if (!selectedEnrollments.length) return;
    try {
      await bulkCompleteEnrollments(selectedEnrollments);
      setSelectedEnrollments([]);
      await loadAdminData();
      showToast("Inscrições concluídas e certificados emitidos.", "success");
    } catch (error) {
      showToast(error.message || "Falha ao concluir inscrições.", "error");
    }
  }

  function exportEnrollmentsCsv() {
    const rows = [
      ["Aluno", "E-mail", "Curso", "Status", "Pedido", "Data"],
      ...filteredEnrollments.map((item) => [
        item.studentName,
        item.studentEmail,
        item.course?.title || "",
        item.status,
        item.orderNumber || "",
        new Date(item.date).toLocaleDateString("pt-BR"),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inscricoes-newtech.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Exportação CSV iniciada.", "success");
  }

  return (
    <>
      <Header />
      <main className="page page-transition">
        <div className="container">
          <Breadcrumb items={[
            { label: "Admin", to: "/admin" },
            { label: activeTabLabel },
          ]} />

          <div className="dashboard-hero brand-rail brand-rail--full">
            <span className="eyebrow eyebrow-brand">Administração</span>
            <BrandRail><h1>Painel operacional NewTech</h1></BrandRail>
            <p style={{ color: "var(--color-text-soft)", marginTop: "var(--space-2)" }}>
              Gestão de cursos, inscrições e alunos com filtros persistentes.
            </p>
          </div>

          <div className="kpi-grid" style={{ marginBottom: "var(--space-6)" }}>
            <KpiTile label="Cursos" value={courses.length} />
            <KpiTile label="Alunos" value={students.length} />
            <KpiTile label="Inscrições" value={totalEnrollments} />
          </div>

          <div className="dashboard-layout">
            <aside className="admin-sidebar">
              <nav>
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      className={activeTab === tab.id ? "active" : ""}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon size={16} />
                      {tab.id === "cadastrar" && editingId ? "Editar curso" : tab.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div>
              {activeTab === "cadastrar" && (
                <section className="ui-card" style={{ padding: "var(--space-6)" }}>
                  <h2>{editingId ? "Editar curso" : "Cadastrar novo curso"}</h2>
                  <form onSubmit={handleSubmit} className="admin-form" style={{ marginTop: "var(--space-4)" }}>
                    <label>
                      Título
                      <input name="title" value={form.title} onChange={handleChange} required />
                    </label>
                    <div className="form-row">
                      <label>Carga horária<input name="workload" value={form.workload} onChange={handleChange} required /></label>
                      <label>Aulas<input name="lessons" value={form.lessons} onChange={handleChange} required /></label>
                    </div>
                    <div className="form-row">
                      <label>Nível<input name="level" value={form.level} onChange={handleChange} required /></label>
                      <label>Instrutor<input name="instructor" value={form.instructor} onChange={handleChange} required /></label>
                    </div>
                    <label>
                      URL da imagem
                      <div className="input-with-icon"><Image size={16} /><input name="image" value={form.image} onChange={handleChange} /></div>
                    </label>
                    <label>Descrição<textarea name="description" value={form.description} onChange={handleChange} required /></label>
                    <label>Conteúdo<textarea name="content" value={form.content} onChange={handleChange} required /></label>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        {editingId ? <Wrench size={16} /> : <PlusCircle size={16} />}
                        {editingId ? "Salvar edição" : "Cadastrar curso"}
                      </button>
                      {editingId ? (
                        <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                          <X size={16} /> Cancelar
                        </button>
                      ) : null}
                    </div>
                  </form>
                </section>
              )}

              {activeTab === "gerenciar" && (
                <section className="ui-card" style={{ padding: "var(--space-6)" }}>
                  <div className="section-header">
                    <h2>Cursos cadastrados</h2>
                    <div className="search-field admin-search">
                      <Search size={16} aria-hidden="true" />
                      <input
                        type="search"
                        placeholder="Buscar por título, instrutor ou nível..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Buscar cursos"
                      />
                    </div>
                  </div>
                  {filteredCourses.length === 0 ? (
                    <EmptyState title="Nenhum curso encontrado" description="Ajuste a busca ou cadastre um novo curso." />
                  ) : (
                    <div className="data-table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Curso</th>
                            <th>Carga</th>
                            <th>Instrutor</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCourses.map((course) => (
                            <tr key={course.id}>
                              <td>{course.title}</td>
                              <td>{course.workload}</td>
                              <td>{course.instructor}</td>
                              <td>
                                <div className="admin-table-actions">
                                  <Link to={`/admin/curso/${course.id}`} className="btn btn-primary btn-sm">
                                    <Layers size={14} /> Editar conteúdo
                                  </Link>
                                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleEdit(course)}>
                                    <Edit3 size={14} /> Editar
                                  </button>
                                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(course.id)}>
                                    <Trash2 size={14} /> Excluir
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {activeTab === "inscricoes" && (
                <section className="ui-card" style={{ padding: "var(--space-6)" }}>
                  <div className="section-header">
                    <h2>Inscrições</h2>
                    <div className="search-field admin-search">
                      <Search size={16} aria-hidden="true" />
                      <input
                        type="search"
                        placeholder="Buscar inscrição..."
                        value={enrollmentSearch}
                        onChange={(e) => setEnrollmentSearch(e.target.value)}
                        aria-label="Buscar inscrições"
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleBulkComplete} disabled={!selectedEnrollments.length}>
                      Concluir selecionadas ({selectedEnrollments.length})
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={exportEnrollmentsCsv}>
                      Exportar CSV
                    </button>
                  </div>
                  {filteredEnrollments.length === 0 ? (
                    <EmptyState title="Nenhuma inscrição" description="Inscrições de alunos aparecerão aqui." />
                  ) : (
                    <div className="data-table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th><span className="sr-only">Selecionar</span></th>
                            <th>Aluno</th>
                            <th>Curso</th>
                            <th>Status</th>
                            <th>Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEnrollments.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedEnrollments.includes(item.id)}
                                  onChange={() => toggleEnrollmentSelection(item.id)}
                                  aria-label={`Selecionar inscrição ${item.id}`}
                                />
                              </td>
                              <td>{item.studentName}</td>
                              <td>{item.course?.title}</td>
                              <td>{item.status}</td>
                              <td>{new Date(item.date).toLocaleDateString("pt-BR")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {activeTab === "alunos" && (
                <section className="ui-card" style={{ padding: "var(--space-6)" }}>
                  <div className="section-header">
                    <h2>Alunos cadastrados</h2>
                    <div className="search-field admin-search">
                      <Search size={16} aria-hidden="true" />
                      <input
                        type="search"
                        placeholder="Buscar aluno..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        aria-label="Buscar alunos"
                      />
                    </div>
                  </div>
                  {filteredStudents.length === 0 ? (
                    <EmptyState title="Nenhum aluno encontrado" description="Tente outro termo de busca." />
                  ) : (
                    <div className="courses-grid">
                      {filteredStudents.map((student) => {
                        const enrollments = enrollmentsByEmail[student.email] || [];
                        const initials = student.name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
                        return (
                          <article key={student.id} className="ui-card" style={{ padding: "var(--space-4)" }}>
                            <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                              <div className="user-avatar">{initials}</div>
                              <div>
                                <h3>{student.name}</h3>
                                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>{student.email}</p>
                              </div>
                            </div>
                            <div style={{ marginTop: "var(--space-3)", fontSize: "var(--text-sm)", display: "grid", gap: "var(--space-2)" }}>
                              <span><Phone size={14} /> {student.phone || "—"}</span>
                              <span><IdCard size={14} /> {student.document || "—"}</span>
                              <span><MapPin size={14} /> {student.address?.city || "—"}</span>
                              <span><PlayCircle size={14} /> {enrollments.length} inscrições</span>
                            </div>
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
