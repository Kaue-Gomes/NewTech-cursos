import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, TriangleAlert, Users } from "lucide-react";
import BrandRail from "../components/ui/BrandRail.jsx";
import { login } from "../services/auth.js";
import authIllustration from "../assets/logo-horizontal-subtitle.png";
import logoHorizontal from "../assets/logo-horizontal.png";

const showDemoLogins = import.meta.env.VITE_SHOW_DEMO_LOGINS === "true";
const demoAdminEmail = import.meta.env.VITE_DEMO_ADMIN_EMAIL || "";
const demoAdminPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "";
const demoStudentEmail = import.meta.env.VITE_DEMO_STUDENT_EMAIL || "";
const demoStudentPassword = import.meta.env.VITE_DEMO_STUDENT_PASSWORD || "";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const user = await login(form.email, form.password);
      if (!user) {
        setError("E-mail ou senha inválidos.");
        return;
      }
      navigate(user.role === "admin" ? "/admin" : "/aluno");
    } catch (submitError) {
      setError(submitError.message || "Não foi possível entrar. Tente novamente.");
    }
  }

  return (
    <main className="auth-page page-transition technical-grid-bg">
      <aside className="auth-aside">
        <Link to="/" className="auth-aside-brand">
          <img src={logoHorizontal} alt="NewTech Cursos" className="auth-aside-logo" />
        </Link>
        <div className="auth-aside-content">
          <img src={authIllustration} alt="" style={{ maxWidth: 280, marginBottom: "var(--space-6)" }} />
          <h2>Capacitação técnica com rastreabilidade.</h2>
          <p>
            Acesse módulos, acompanhe progresso e emita certificados NR pela plataforma
            corporativa NewTech.
          </p>
        </div>
        <p className="auth-aside-footer">© 2026 NewTech Cursos</p>
      </aside>

      <section className="auth-main">
        <form className="auth-card brand-rail brand-rail--full" onSubmit={handleSubmit}>
          <span className="eyebrow eyebrow-brand">Acesso</span>
          <BrandRail><h1>Entrar na plataforma</h1></BrandRail>
          <p className="auth-subtitle">Use suas credenciais para continuar.</p>

          {error ? (
            <div className="error" role="alert">
              <TriangleAlert size={16} />
              <span>{error}</span>
            </div>
          ) : null}

          <label>
            E-mail
            <div className="input-with-icon">
              <Mail size={16} />
              <input
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </label>

          <label>
            Senha
            <div className="input-with-icon">
              <Lock size={16} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button type="submit" className="btn btn-primary btn-full btn-lg">
            Entrar
          </button>

          <div className="login-help">
            <Link to="/recuperar-senha">Esqueci minha senha</Link>
            <Link to="/cadastro">Criar conta</Link>
          </div>

          {showDemoLogins && demoAdminEmail ? (
            <>
              <div className="divider">Acessos de teste</div>
              <div className="demo-logins">
                <strong><Users size={14} /> Credenciais demo</strong>
                <span>ADM: {demoAdminEmail} / {demoAdminPassword}</span>
                <span>Aluno: {demoStudentEmail} / {demoStudentPassword}</span>
              </div>
            </>
          ) : null}
        </form>
      </section>
    </main>
  );
}
