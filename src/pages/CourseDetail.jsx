import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Award, Clock, PlayCircle, User } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Breadcrumb from "../components/layout/Breadcrumb.jsx";
import BrandRail from "../components/ui/BrandRail.jsx";
import Button from "../components/ui/Button.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import CourseTimeline from "../components/course/CourseTimeline.jsx";
import {
  getCourseById,
  getCourseBySlug,
  enrollStudent,
  getStudentEnrollments,
} from "../services/storage.js";
import { getCurrentUser } from "../services/auth.js";
import { getCourseProgress, getLessonProgress } from "../services/platform.js";
import { getCourseLessonsTree } from "../services/content.js";
import { useToast } from "../context/ToastContext.jsx";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { showToast } = useToast();
  const [course, setCourse] = useState(null);
  const [progressData, setProgressData] = useState({ modules: [], percent: 0 });
  const [lessonTree, setLessonTree] = useState([]);
  const [lessonProgress, setLessonProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  const isNumericId = /^\d+$/.test(String(id));

  useEffect(() => {
    async function load() {
      const courseData = isNumericId
        ? await getCourseById(id)
        : await getCourseBySlug(id);

      setCourse(courseData);

      if (courseData) {
        const tree = await getCourseLessonsTree(courseData.id);
        setLessonTree(tree);
      }

      if (user?.email && courseData) {
        const [progress, enrollments, lessonRows] = await Promise.all([
          getCourseProgress(user.email, courseData.id),
          getStudentEnrollments(user.email),
          getLessonProgress(user.email, courseData.id),
        ]);
        setProgressData(progress);
        setLessonProgress(Object.fromEntries(lessonRows.map((row) => [row.lessonId, row.completed])));
        setEnrolled(enrollments.some((item) => item.course?.id === courseData.id || item.course_id === courseData.id));
      }
      setLoading(false);
    }
    load().catch(console.error);
  }, [id, user?.email, isNumericId]);

  const continueLesson = useMemo(() => {
    for (const row of lessonTree) {
      if (!row.lesson_id) continue;
      if (!lessonProgress[row.lesson_id]) {
        return {
          slug: row.lesson_slug,
          title: row.lesson_title,
        };
      }
    }
    const first = lessonTree.find((row) => row.lesson_id);
    return first
      ? { slug: first.lesson_slug, title: first.lesson_title }
      : null;
  }, [lessonTree, lessonProgress]);

  async function handleEnroll() {
    if (!user) return navigate("/login");
    if (user.role !== "student") return showToast("Apenas alunos podem se inscrever.", "error");
    try {
      await enrollStudent(user.email, course.id);
      setEnrolled(true);
      const progress = await getCourseProgress(user.email, course.id);
      setProgressData(progress);
      showToast("Inscrição realizada com sucesso.", "success");
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

  if (!course) {
    return (
      <>
        <Header />
        <main className="page"><div className="container"><p>Curso não encontrado.</p></div></main>
        <Footer />
      </>
    );
  }

  const coursePath = course.slug || course.id;
  const coverImage = course.coverUrl || course.image;

  return (
    <>
      <Header />
      {enrolled ? (
        <div className="progress-strip">
          <div className="container">
            <ProgressBar value={progressData.percent} label={`Progresso — ${course.title}`} />
          </div>
        </div>
      ) : null}
      <main className="page page-transition">
        <div className="container">
          <Breadcrumb items={[
            { label: "Início", to: "/" },
            { label: "Cursos", to: "/cursos" },
            { label: course.title },
          ]} />

          <div className="course-detail-grid">
            <div className="course-detail-main">
              <img src={coverImage} alt={course.title} />
              <BrandRail><h1>{course.title}</h1></BrandRail>
              <p style={{ color: "var(--color-text-soft)", margin: "var(--space-4) 0 var(--space-6)" }}>
                {course.shortDescription || course.description}
              </p>
              <h2 style={{ marginBottom: "var(--space-3)" }}>Conteúdo programático</h2>
              <p style={{ color: "var(--color-text-soft)" }}>{course.fullDescription || course.content}</p>
            </div>

            <aside className="course-detail-sidebar brand-rail brand-rail--full">
              <span className="eyebrow eyebrow-accent">Informações</span>
              <div className="meta-list">
                <span><Clock size={16} /> {course.workload}</span>
                <span><PlayCircle size={16} /> {course.lessons}</span>
                <span><User size={16} /> {course.instructor}</span>
                <span><Award size={16} /> {course.level}</span>
              </div>

              {!enrolled ? (
                <Button variant="accent" full onClick={handleEnroll}>
                  Inscrever-se agora
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <>
                  {continueLesson ? (
                    <Link to={`/curso/${coursePath}/aula/${continueLesson.slug}`} className="btn btn-accent btn-lg" style={{ width: "100%", marginBottom: "var(--space-4)" }}>
                      Continuar: {continueLesson.title}
                      <ArrowRight size={16} />
                    </Link>
                  ) : null}
                  <h3 style={{ marginBottom: "var(--space-3)" }}>Módulos</h3>
                  <CourseTimeline
                    modules={progressData.modules}
                    courseSlug={coursePath}
                    lessonTree={lessonTree}
                    lessonProgress={lessonProgress}
                  />
                </>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
