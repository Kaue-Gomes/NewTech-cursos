import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import Breadcrumb from "../../components/layout/Breadcrumb.jsx";
import BrandRail from "../../components/ui/BrandRail.jsx";
import CourseForm from "../../components/admin/CourseForm.jsx";
import ModuleManager from "../../components/admin/ModuleManager.jsx";
import { getCourseAdmin } from "../../services/content.js";
import { addCourse, updateCourse } from "../../services/storage.js";
import { useToast } from "../../context/ToastContext.jsx";

const TABS = [
  { id: "info", label: "Informações" },
  { id: "content", label: "Módulos e aulas" },
];

const emptyForm = {
  title: "",
  slug: "",
  slugTouched: false,
  category: "",
  instructor: "",
  workload: "",
  levelEnum: "",
  price: "",
  status: "draft",
  shortDescription: "",
  fullDescription: "",
  content: "",
  coverType: "url",
  coverUrl: "",
  bannerType: "url",
  bannerUrl: "",
  image: "",
};

function mapCourseToForm(course) {
  if (!course) return emptyForm;
  return {
    title: course.title || "",
    slug: course.slug || "",
    slugTouched: true,
    category: course.category || "",
    instructor: course.instructor || "",
    workload: course.workload || "",
    levelEnum: course.levelEnum || "",
    price: course.price ?? "",
    status: course.status || "draft",
    shortDescription: course.shortDescription || course.description || "",
    fullDescription: course.fullDescription || "",
    content: course.content || "",
    coverType: course.coverType || "url",
    coverUrl: course.coverUrl || course.image || "",
    bannerType: course.bannerType || "url",
    bannerUrl: course.bannerUrl || "",
    image: course.coverUrl || course.image || "",
  };
}

export default function CourseEditor() {
  const { id } = useParams();
  const isNew = id === "novo";
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState(emptyForm);
  const [courseId, setCourseId] = useState(isNew ? null : Number(id));
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    getCourseAdmin(id)
      .then((course) => setForm(mapCourseToForm(course)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleSave(event) {
    event.preventDefault();

    if (form.status === "published" && !form.coverUrl) {
      showToast("Publicação exige capa do curso.", "error");
      return;
    }

    const payload = {
      title: form.title,
      slug: form.slug,
      category: form.category,
      instructor: form.instructor,
      workload: form.workload,
      levelEnum: form.levelEnum || null,
      price: form.price ? Number(form.price) : null,
      status: form.status,
      shortDescription: form.shortDescription,
      description: form.shortDescription,
      fullDescription: form.fullDescription,
      content: form.content,
      coverType: form.coverType,
      coverUrl: form.coverUrl,
      bannerType: form.bannerType,
      bannerUrl: form.bannerUrl,
      image: form.coverUrl,
    };

    try {
      if (isNew || !courseId) {
        const created = await addCourse(payload);
        setCourseId(created.id);
        showToast("Curso criado.", "success");
        navigate(`/admin/curso/${created.id}`, { replace: true });
      } else {
        await updateCourse(courseId, payload);
        showToast("Curso atualizado.", "success");
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="page"><div className="container"><p>Carregando...</p></div></main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="page page-transition">
        <div className="container">
          <Breadcrumb items={[
            { label: "Admin", to: "/admin" },
            { label: isNew ? "Novo curso" : form.title || "Editar curso" },
          ]} />

          <BrandRail><h1>{isNew ? "Novo curso" : `Editar: ${form.title}`}</h1></BrandRail>

          <div className="admin-editor-tabs">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={tab === item.id ? "active" : ""}
                onClick={() => setTab(item.id)}
                disabled={item.id === "content" && !courseId}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "info" ? (
            <form className="admin-editor-panel admin-form" onSubmit={handleSave}>
              <CourseForm form={form} setForm={setForm} courseId={courseId} />
              <div className="admin-editor-actions">
                <Link to="/admin" className="btn btn-secondary">Voltar</Link>
                <button type="submit" className="btn btn-primary">
                  {isNew ? "Criar curso" : "Salvar informações"}
                </button>
              </div>
            </form>
          ) : null}

          {tab === "content" && courseId ? (
            <div className="admin-editor-panel">
              <ModuleManager courseId={courseId} />
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
