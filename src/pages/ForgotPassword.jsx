import { Link } from "react-router-dom";
import { useState } from "react";
import { CheckCircle2, KeyRound, Mail } from "lucide-react";
import BrandRail from "../components/ui/BrandRail.jsx";
import authIllustration from "../assets/logo-horizontal-subtitle.png";
import logoHorizontal from "../assets/logo-horizontal.png";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="auth-page page-transition technical-grid-bg">
      <aside className="auth-aside">
        <Link to="/" className="auth-aside-brand">
          <img src={logoHorizontal} alt="NewTech Cursos" className="auth-aside-logo" />
        </Link>

        <div className="auth-aside-content">
          <img src={authIllustration} alt="" style={{ maxWidth: 280, marginBottom: "var(--space-6)" }} />
          <h2>Recuperação de acesso</h2>
          <p>
            Informe o e-mail cadastrado para receber instruções de redefinição de senha.
          </p>
        </div>

        <p className="auth-aside-footer">© 2026 NewTech Cursos</p>
      </aside>

      <section className="auth-main">
        <form className="auth-card brand-rail brand-rail--full" onSubmit={handleSubmit}>
          <span className="eyebrow eyebrow-brand">Recuperação</span>
          <BrandRail><h1>Recuperar senha</h1></BrandRail>
          <p className="auth-subtitle">
            Informe seu e-mail e enviaremos as instruções de recuperação.
          </p>

          {sent ? (
            <div className="success" role="status">
              <CheckCircle2 size={16} />
              <span>Instruções de recuperação enviadas com sucesso (simulação).</span>
            </div>
          ) : null}

          <label>
            E-mail
            <div className="input-with-icon">
              <Mail size={16} />
              <input type="email" placeholder="seu@email.com" required autoComplete="email" />
            </div>
          </label>

          <button type="submit" className="btn btn-primary btn-full btn-lg">
            <KeyRound size={16} />
            Enviar instruções
          </button>

          <Link to="/login" className="center-link">← Voltar para login</Link>
        </form>
      </section>
    </main>
  );
}
