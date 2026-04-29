import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GraduationCap, LogIn, LogOut, Menu, X } from "lucide-react";
import { getCurrentUser, logout } from "../services/auth.js";
import UserInfo from "./UserInfo.jsx";

export default function Header() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="container header-content">
        <Link to="/" className="brand" aria-label="NewTech Cursos">
          <span className="brand-mark">
            <GraduationCap />
          </span>
          <span className="brand-text">
            NewTech
            <small>Cursos profissionalizantes</small>
          </span>
        </Link>

        <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/cursos">Cursos</NavLink>
          {user?.role === "student" && <NavLink to="/aluno">Área do aluno</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Painel ADM</NavLink>}
        </nav>

        <div className="header-actions">
          {!user ? (
            <Link to="/login" className="btn btn-primary">
              <LogIn />
              <span>Entrar</span>
            </Link>
          ) : (
            <>
              <UserInfo user={user} />
              <button onClick={handleLogout} className="btn btn-outline" title="Sair">
                <LogOut />
                <span>Sair</span>
              </button>
            </>
          )}

          <button
            className="menu-toggle"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
