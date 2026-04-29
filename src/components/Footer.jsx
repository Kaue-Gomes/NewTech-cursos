import { Link } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  MessageCircle,
  MapPin
} from "lucide-react";

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.48H15.2c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.43-4.93 8.43-9.94Z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19 0h-14C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5ZM7.34 19H4.34V9h3v10ZM5.84 7.65a1.74 1.74 0 1 1 0-3.49 1.74 1.74 0 0 1 0 3.49ZM20 19h-3v-5.06c0-1.21-.02-2.77-1.69-2.77-1.69 0-1.95 1.32-1.95 2.68V19h-3V9h2.88v1.36h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6V19Z" />
    </svg>
  );
}

function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23.5 6.5a3 3 0 0 0-2.1-2.12C19.5 4 12 4 12 4s-7.5 0-9.4.38A3 3 0 0 0 .5 6.5C.12 8.4.12 12 .12 12s0 3.6.38 5.5a3 3 0 0 0 2.1 2.12C4.5 20 12 20 12 20s7.5 0 9.4-.38a3 3 0 0 0 2.1-2.12c.38-1.9.38-5.5.38-5.5s0-3.6-.38-5.5ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-top">
              <span className="brand-mark">
                <GraduationCap />
              </span>
              NewTech Cursos
            </div>
            <p>
              Capacitação técnica em segurança do trabalho, engenharia e normas
              regulamentadoras. Cursos profissionalizantes pensados para quem quer
              evoluir no mercado.
            </p>

            <div className="footer-social">
              <a href="#" aria-label="Facebook"><FacebookIcon /></a>
              <a href="#" aria-label="Instagram"><InstagramIcon /></a>
              <a href="#" aria-label="LinkedIn"><LinkedinIcon /></a>
              <a href="#" aria-label="YouTube"><YoutubeIcon /></a>
            </div>
          </div>

          <div>
            <h4>Plataforma</h4>
            <Link to="/">Home</Link>
            <Link to="/cursos">Cursos</Link>
            <Link to="/login">Entrar</Link>
            <Link to="/cadastro">Criar conta</Link>
          </div>

          <div>
            <h4>Áreas</h4>
            <Link to="/aluno">Área do aluno</Link>
            <Link to="/admin">Painel ADM</Link>
            <Link to="/minha-conta">Minha conta</Link>
            <Link to="/recuperar-senha">Recuperar senha</Link>
          </div>

          <div>
            <h4>Fale com a gente</h4>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <MessageCircle />
                <div>
                  <strong>WhatsApp</strong>
                  (85) 98587-4023
                </div>
              </div>
              <div className="footer-contact-item">
                <Mail />
                <div>
                  <strong>E-mail</strong>
                  contato@newtechcursos.com
                </div>
              </div>
              <div className="footer-contact-item">
                <MapPin />
                <div>
                  <strong>Atendimento</strong>
                  Online · Brasil
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 NewTech Cursos. Todos os direitos reservados.</span>
          <div className="footer-bottom-links">
            <a href="#">Termos de uso</a>
            <a href="#">Política de privacidade</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
