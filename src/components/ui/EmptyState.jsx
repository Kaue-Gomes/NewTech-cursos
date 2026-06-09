import { Link } from "react-router-dom";
import Button from "./Button.jsx";

export default function EmptyState({ illustration, title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty-state-v2">
      {illustration}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="btn btn-primary">
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
