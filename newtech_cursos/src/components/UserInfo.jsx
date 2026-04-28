import { Link } from "react-router-dom";

export default function UserInfo({ user }) {
  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "US";

  return (
    <Link to="/minha-conta" className="user-info" title="Ver informações da conta">
      <span className="user-avatar">{initials}</span>
      <span className="user-text">
        <strong>{user.name}</strong>
        <small>{user.role === "admin" ? "Administrador" : "Aluno"}</small>
      </span>
    </Link>
  );
}
