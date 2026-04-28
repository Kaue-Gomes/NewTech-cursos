import { Link } from "react-router-dom";
import logo from "../assets/logo-horizontal-subtitle.jpeg";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src={logo} alt="NewTech Cursos" />
          <p>
            Cursos profissionalizantes voltados para engenharia, segurança do trabalho
            e normas regulamentadoras.
          </p>
        </div>

        <div>
          <h4>Navegação</h4>
          <Link to="/">Home</Link>
          <Link to="/cursos">Cursos</Link>
          <Link to="/login">Entrar</Link>
        </div>

        <div>
          <h4>Áreas</h4>
          <Link to="/aluno">Área do aluno</Link>
          <Link to="/admin">Área ADM</Link>
          <Link to="/cadastro">Cadastro</Link>
        </div>

        <div>
          <h4>Contato</h4>
          <p>WhatsApp: (85) 98587-4023</p>
          <p>Email: contato@newtechcursos.com</p>
          <p>Atendimento online</p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 NewTech Cursos. Todos os direitos reservados.</span>
        <span>Engenharia & Normas Regulamentadoras</span>
      </div>
    </footer>
  );
}
