import { Link } from "react-router-dom";
import { useState } from "react";
import {
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Mail,
  ShieldCheck,
  Sparkles,
  Award,
  Zap
} from "lucide-react";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="auth-page page-transition">
      <aside className="auth-aside">
        <Link to="/" className="auth-aside-brand">
          <span className="brand-mark">
            <GraduationCap />
          </span>
          NewTech Cursos
        </Link>

        <div className="auth-aside-content">
          <span className="eyebrow eyebrow-light">
            <Sparkles size={14} /> Recuperar acesso
          </span>
          <h2>Esqueceu a senha? Sem problemas.</h2>
          <p>
            Informe o e-mail cadastrado e nós enviaremos as instruções para você
            recuperar o acesso à plataforma com segurança.
          </p>

          <div className="auth-aside-features">
            <div className="auth-aside-feature">
              <span className="auth-aside-feature-icon"><ShieldCheck /></span>
              <div className="auth-aside-feature-text">
                <strong>Recuperação segura</strong>
                <small>Processo protegido em todas as etapas.</small>
              </div>
            </div>
            <div className="auth-aside-feature">
              <span className="auth-aside-feature-icon"><Award /></span>
              <div className="auth-aside-feature-text">
                <strong>Mantenha sua jornada</strong>
                <small>Continue de onde parou nos cursos.</small>
              </div>
            </div>
            <div className="auth-aside-feature">
              <span className="auth-aside-feature-icon"><Zap /></span>
              <div className="auth-aside-feature-text">
                <strong>Rápido e simples</strong>
                <small>Em poucos passos você está de volta.</small>
              </div>
            </div>
          </div>
        </div>

        <p className="auth-aside-footer">© 2026 NewTech Cursos. Plataforma de capacitação.</p>
      </aside>

      <section className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="eyebrow eyebrow-blue">
            <KeyRound size={14} /> Recuperação
          </span>
          <h1>Recuperar senha</h1>
          <p className="auth-subtitle">
            Informe seu e-mail e enviaremos as instruções de recuperação.
          </p>

          {sent && (
            <div className="success">
              <CheckCircle2 />
              <span>Instruções de recuperação enviadas com sucesso (simulação).</span>
            </div>
          )}

          <label>
            E-mail
            <div className="input-with-icon">
              <Mail />
              <input type="email" placeholder="seu@email.com" required />
            </div>
          </label>

          <button type="submit" className="btn btn-primary full big">
            Enviar instruções
          </button>

          <Link to="/login" className="center-link">← Voltar para login</Link>
        </form>
      </section>
    </main>
  );
}
