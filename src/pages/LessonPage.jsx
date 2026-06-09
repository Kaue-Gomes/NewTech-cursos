import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Breadcrumb from "../components/layout/Breadcrumb.jsx";
import VideoPlayer from "../components/lesson/VideoPlayer.jsx";
import LessonSidebar from "../components/lesson/LessonSidebar.jsx";
import LessonMaterials from "../components/lesson/LessonMaterials.jsx";
import LessonCommentsPlaceholder from "../components/lesson/LessonCommentsPlaceholder.jsx";
import Button from "../components/ui/Button.jsx";
import { getCurrentUser } from "../services/auth.js";
import { getCourseLessonsTree, getLessonBySlug, getLessonMaterials } from "../services/content.js";
import { completeLesson, getLessonProgress } from "../services/platform.js";
import { useToast } from "../context/ToastContext.jsx";

export default function LessonPage() {
  const { courseSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { showToast } = useToast();
  const [lesson, setLesson] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [tree, setTree] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    async function load() {
      try {
        const lessonData = await getLessonBySlug(courseSlug, lessonSlug);
        if (!lessonData) {
          setLesson(null);
          return;
        }

        const [materialsData, treeData] = await Promise.all([
          getLessonMaterials(lessonData.id),
          getCourseLessonsTree(lessonData.courseId),
        ]);

        let progress = {};
        if (user.email) {
          const rows = await getLessonProgress(user.email, lessonData.courseId);
          progress = Object.fromEntries(rows.map((row) => [row.lessonId, row.completed]));
        }

        setLesson(lessonData);
        setMaterials(materialsData);
        setTree(treeData);
        setProgressMap(progress);
      } catch (error) {
        showToast(error.message, "error");
      } finally {
        setLoading(false);
      }
    }

    load().catch(console.error);
  }, [courseSlug, lessonSlug, user, navigate, showToast]);

  const isCompleted = useMemo(
    () => (lesson ? Boolean(progressMap[lesson.id]) : false),
    [lesson, progressMap],
  );

  async function handleComplete() {
    if (!user?.email || !lesson) return;
    await completeLesson(user.email, lesson.id);
    setProgressMap((current) => ({ ...current, [lesson.id]: true }));
    showToast("Aula concluída.", "success");
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="page"><div className="container"><p>Carregando aula...</p></div></main>
        <Footer />
      </>
    );
  }

  if (!lesson) {
    return (
      <>
        <Header />
        <main className="page"><div className="container"><p>Aula não encontrada.</p></div></main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="page page-transition lesson-page">
        <div className="container">
          <Breadcrumb items={[
            { label: "Cursos", to: "/cursos" },
            { label: lesson.courseTitle, to: `/curso/${lesson.courseSlug}` },
            { label: lesson.title },
          ]} />

          <div className="lesson-page-grid">
            <div className="lesson-page-main">
              <VideoPlayer url={lesson.videoUrl} provider={lesson.videoProvider} />
              <div className="lesson-page-header">
                <div>
                  <span className="eyebrow">{lesson.moduleTitle}</span>
                  <h1>{lesson.title}</h1>
                </div>
                {!isCompleted ? (
                  <Button variant="primary" onClick={handleComplete}>
                    <CheckCircle2 size={16} /> Marcar como concluída
                  </Button>
                ) : (
                  <span className="lesson-completed-badge">Aula concluída</span>
                )}
              </div>
            </div>

            <LessonSidebar
              courseSlug={courseSlug}
              tree={tree}
              currentLessonSlug={lessonSlug}
              progressMap={progressMap}
            />
          </div>

          <section className="lesson-description">
            <h2>Descrição</h2>
            <p>{lesson.description || "Sem descrição para esta aula."}</p>
          </section>

          <LessonMaterials materials={materials} />
          <LessonCommentsPlaceholder />

          <div className="lesson-navigation">
            {lesson.navigation?.prev ? (
              <Link to={`/curso/${courseSlug}/aula/${lesson.navigation.prev.slug}`} className="btn btn-secondary">
                <ArrowLeft size={16} /> {lesson.navigation.prev.title}
              </Link>
            ) : <span />}
            {lesson.navigation?.next ? (
              <Link to={`/curso/${courseSlug}/aula/${lesson.navigation.next.slug}`} className="btn btn-primary">
                {lesson.navigation.next.title} <ArrowRight size={16} />
              </Link>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
