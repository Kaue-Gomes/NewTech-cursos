import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  return (
    <article className="course-card">
      <img className="course-image" src={course.image} alt={course.title} />
      <div className="course-body">
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-meta">
          <span>{course.workload}</span>
          <span>{course.lessons}</span>
        </div>
        <Link to={`/curso/${course.id}`} className="btn btn-primary full">
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
