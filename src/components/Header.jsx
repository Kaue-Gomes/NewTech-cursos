import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { getCurrentUser, logout } from "../services/auth.js";
import UserInfo from "./UserInfo.jsx";
import GlobalSearchField from "./layout/GlobalSearch.jsx";
import NotificationBell from "./layout/NotificationBell.jsx";
import logoHorizontal from "../assets/logoempe.png";

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
          <img src={logoHorizontal} alt="NewTech Cursos" className="brand-logo" />
        </Link>

        <nav className={`main-nav ${menuOpen ? "open" : ""}`} aria-label="Principal">
          <NavLink to="/" end>Início</NavLink>
          <NavLink to="/cursos">Cursos NR</NavLink>
          {user?.role === "student" ? <NavLink to="/aluno">Meu painel</NavLink> : null}
          {user?.role === "admin" ? <NavLink to="/admin">Administração</NavLink> : null}
        </nav>

        <div className="header-actions">
          {user ? <GlobalSearchField /> : null}
          {user ? <NotificationBell /> : null}
          {!user ? (
            <Link to="/login" className="btn btn-primary btn-sm">
              <LogIn size={16} />
              <span>Entrar</span>
            </Link>
          ) : (
            <>
              <UserInfo user={user} />
              <button type="button" onClick={handleLogout} className="btn btn-secondary btn-sm" title="Sair">
                <LogOut size={16} />
                <span>Sair</span>
              </button>
            </>
          )}
          <button
            type="button"
            className="menu-toggle"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
