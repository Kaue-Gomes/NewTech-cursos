import { Link } from "react-router-dom";
import { ArrowRight, Clock, PlayCircle, Sparkles } from "lucide-react";

export default function CourseCard({ course }) {
  return (
    <article className="course-card">
      <div className="course-card-image-wrap">
        <img className="course-image" src={course.image} alt={course.title} loading="lazy" />
        <span className="course-card-tag">
          <Sparkles />
          {course.level || "Capacitação"}
        </span>
      </div>

      <div className="course-body">
        <h3>{course.title}</h3>
        <p>{course.description}</p>

        <div className="course-meta">
          <span><Clock /> {course.workload}</span>
          <span><PlayCircle /> {course.lessons}</span>
        </div>

        <Link to={`/curso/${course.id}`} className="btn btn-primary full">
          Ver detalhes
          <ArrowRight />
        </Link>
      </div>
    </article>
  );
}
