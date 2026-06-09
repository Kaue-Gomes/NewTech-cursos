import { Link } from "react-router-dom";
import { Check, Circle } from "lucide-react";

export default function CourseTimeline({
  modules = [],
  courseSlug,
  lessonTree = [],
  lessonProgress = {},
}) {
  if (!modules.length) {
    return <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>Módulos em breve.</p>;
  }

  const lessonsByModule = lessonTree.reduce((acc, row) => {
    if (!row.lesson_id) return acc;
    if (!acc[row.module_id]) acc[row.module_id] = [];
    acc[row.module_id].push(row);
    return acc;
  }, {});

  return (
    <div className="timeline">
      {modules.map((module) => {
        const status = module.status || "pending";
        const markerClass =
          status === "completed"
            ? "timeline-marker timeline-marker--done"
            : status === "current"
              ? "timeline-marker timeline-marker--current"
              : "timeline-marker";

        return (
          <div className="timeline-item" key={module.id}>
            <div className={markerClass} aria-hidden>
              {status === "completed" ? <Check size={14} /> : status === "current" ? "→" : <Circle size={10} />}
            </div>
            <div>
              <div className="timeline-item__title">{module.title}</div>
              {module.durationMinutes ? (
                <div className="timeline-item__meta">{module.durationMinutes} min</div>
              ) : null}
              {courseSlug && lessonsByModule[module.id]?.length ? (
                <ul className="timeline-lessons">
                  {lessonsByModule[module.id].map((lesson) => (
                    <li key={lesson.lesson_id}>
                      <Link to={`/curso/${courseSlug}/aula/${lesson.lesson_slug}`}>
                        {lessonProgress[lesson.lesson_id] ? <Check size={12} /> : <Circle size={10} />}
                        {lesson.lesson_title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
