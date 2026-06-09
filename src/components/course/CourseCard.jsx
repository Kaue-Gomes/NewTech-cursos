import { Link } from "react-router-dom";
import { ArrowRight, Clock, PlayCircle } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";

export default function CourseCard({ course, status = "available", progress = 0, certificateCode }) {
  const nrTag = course.title?.includes("NR") ? course.title.match(/NR\d+/)?.[0] : "Capacitação";

  return (
    <article className="ui-card course-card-v2">
      <div className="ui-card__context">
        <Badge variant="nr">{nrTag}</Badge>
        {course.workload ? <Badge variant="progress">{course.workload}</Badge> : null}
        {status === "completed" ? <Badge variant="success">Concluído</Badge> : null}
        {status === "in_progress" ? <Badge variant="progress">Em andamento</Badge> : null}
      </div>

      <img className="course-card-v2__image" src={course.image} alt={course.title} loading="lazy" />

      <div className="ui-card__body">
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-card-v2__meta">
          <span><Clock size={14} /> {course.workload || "—"}</span>
          <span><PlayCircle size={14} /> {course.lessons || "—"}</span>
        </div>
        {status === "in_progress" ? <ProgressBar value={progress} label="Progresso" /> : null}
      </div>

      <div className="ui-card__action">
        {status === "completed" && certificateCode ? (
          <Link to={`/aluno/certificado/${certificateCode}`} className="btn btn-secondary btn-full">
            Ver certificado
            <ArrowRight size={16} />
          </Link>
        ) : status === "in_progress" ? (
          <Link to={`/curso/${course.slug || course.id}`} className="btn btn-primary btn-full">
            Continuar
            <ArrowRight size={16} />
          </Link>
        ) : (
          <Link to={`/curso/${course.slug || course.id}`} className="btn btn-primary btn-full">
            Ver curso
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </article>
  );
}
