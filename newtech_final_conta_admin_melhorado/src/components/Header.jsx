import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo-horizontal.jpeg";
import { getCurrentUser, logout } from "../services/auth.js";
import UserInfo from "./UserInfo.jsx";

export default function Header() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="site-header">
      <div className="container header-content">
        <Link to="/" className="brand">
          <img src={logo} alt="NewTech Cursos" />
        </Link>

        <nav className="main-nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/cursos">Cursos</NavLink>
          {user?.role === "student" && <NavLink to="/aluno">Área do aluno</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Área ADM</NavLink>}
        </nav>

        <div className="header-actions">
          {!user ? (
            <Link to="/login" className="btn btn-primary">Entrar</Link>
          ) : (
            <>
              <UserInfo user={user} />
              <button onClick={handleLogout} className="btn btn-outline">Sair</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
