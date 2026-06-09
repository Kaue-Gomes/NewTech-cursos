import { Link } from "react-router-dom";
import { Check, Circle } from "lucide-react";

export default function LessonSidebar({ courseSlug, tree = [], currentLessonSlug, progressMap = {} }) {
  const modules = tree.reduce((acc, row) => {
    const existing = acc.find((item) => item.moduleId === row.module_id);
    const lesson = row.lesson_id
      ? {
        id: row.lesson_id,
        title: row.lesson_title,
        slug: row.lesson_slug,
        completed: progressMap[row.lesson_id],
      }
      : null;

    if (existing) {
      if (lesson) existing.lessons.push(lesson);
      return acc;
    }

    acc.push({
      moduleId: row.module_id,
      title: row.module_title,
      lessons: lesson ? [lesson] : [],
    });
    return acc;
  }, []);

  return (
    <aside className="lesson-sidebar">
      <h3>Conteúdo do curso</h3>
      {modules.map((module) => (
        <div className="lesson-sidebar-module" key={module.moduleId}>
          <div className="lesson-sidebar-module__title">{module.title}</div>
          <ul>
            {module.lessons.map((lesson) => (
              <li key={lesson.id} className={lesson.slug === currentLessonSlug ? "active" : ""}>
                <Link to={`/curso/${courseSlug}/aula/${lesson.slug}`}>
                  <span className="lesson-sidebar-icon">
                    {lesson.completed ? <Check size={12} /> : <Circle size={10} />}
                  </span>
                  {lesson.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
