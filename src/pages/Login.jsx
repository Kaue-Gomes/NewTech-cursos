import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Award,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
  Zap
} from "lucide-react";
import { login } from "../services/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const user = login(form.email, form.password);

    if (!user) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    navigate(user.role === "admin" ? "/admin" : "/aluno");
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
            <Sparkles size={14} /> Bem-vindo de volta
          </span>
          <h2>Continue sua capacitação profissional.</h2>
          <p>
            Acesse a plataforma para gerenciar suas inscrições, ver seus cursos
            e dar o próximo passo na sua carreira em segurança e engenharia.
          </p>

          <div className="auth-aside-features">
            <div className="auth-aside-feature">
              <span className="auth-aside-feature-icon"><ShieldCheck /></span>
              <div className="auth-aside-feature-text">
                <strong>Segurança em primeiro lugar</strong>
                <small>Seus dados protegidos em todas as etapas.</small>
              </div>
            </div>
            <div className="auth-aside-feature">
              <span className="auth-aside-feature-icon"><Award /></span>
              <div className="auth-aside-feature-text">
                <strong>Certificação reconhecida</strong>
                <small>Cursos profissionalizantes pela NewTech.</small>
              </div>
            </div>
            <div className="auth-aside-feature">
              <span className="auth-aside-feature-icon"><Zap /></span>
              <div className="auth-aside-feature-text">
                <strong>Acesso imediato</strong>
                <small>Inscreva-se e comece em poucos minutos.</small>
              </div>
            </div>
          </div>
        </div>

        <p className="auth-aside-footer">© 2026 NewTech Cursos. Plataforma de capacitação.</p>
      </aside>

      <section className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="eyebrow eyebrow-blue">
            <Lock size={14} /> Acesso
          </span>
          <h1>Entrar na plataforma</h1>
          <p className="auth-subtitle">Acesse sua conta para continuar.</p>

          {error && (
            <div className="error">
              <TriangleAlert />
              <span>{error}</span>
            </div>
          )}

          <label>
            E-mail
            <div className="input-with-icon">
              <Mail />
              <input
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <label>
            Senha
            <div className="input-with-icon">
              <Lock />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>

          <button type="submit" className="btn btn-primary full big">
            Entrar
          </button>

          <div className="login-help">
            <Link to="/recuperar-senha">Esqueci minha senha</Link>
            <Link to="/cadastro">Criar conta</Link>
          </div>

          <div className="divider">Acessos de teste</div>

          <div className="demo-logins">
            <strong>
              <Users /> Use estas credenciais para explorar:
            </strong>
            <span>ADM: admin@newtech.com / admin123</span>
            <span>Aluno: aluno@newtech.com / aluno123</span>
          </div>
        </form>
      </section>
    </main>
  );
}
