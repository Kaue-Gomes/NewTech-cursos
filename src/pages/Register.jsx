import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, MapPin, Phone, TriangleAlert, User, UserPlus } from "lucide-react";
import BrandRail from "../components/ui/BrandRail.jsx";
import { registerStudent } from "../services/auth.js";
import { useToast } from "../context/ToastContext.jsx";
import authIllustration from "../assets/logo-horizontal-subtitle.png";
import logoHorizontal from "../assets/logo-horizontal.png";

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    document: "",
    cep: "",
    street: "",
    number: "",
    district: "",
    city: "",
    state: "",
  });

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const result = await registerStudent(form);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      showToast("Cadastro realizado com sucesso.", "success");
      navigate("/login");
    } catch (submitError) {
      setError(submitError.message || "Não foi possível concluir o cadastro.");
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
          <h2>Cadastro institucional para alunos e empresas.</h2>
          <p>Crie sua conta e inscreva-se nos cursos NR com acompanhamento de progresso.</p>
        </div>
      </aside>

      <section className="auth-main">
        <form className="auth-card brand-rail brand-rail--full" onSubmit={handleSubmit}>
          <span className="eyebrow eyebrow-brand">Cadastro</span>
          <BrandRail><h1>Criar conta</h1></BrandRail>
          <p className="auth-subtitle">Preencha seus dados para acessar a plataforma.</p>

          {error ? (
            <div className="error" role="alert">
              <TriangleAlert size={16} />
              <span>{error}</span>
            </div>
          ) : null}

          <label>
            Nome completo
            <div className="input-with-icon">
              <User size={16} />
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
          </label>

          <div className="form-row">
            <label>
              E-mail
              <div className="input-with-icon">
                <Mail size={16} />
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
            </label>
            <label>
              Telefone
              <div className="input-with-icon">
                <Phone size={16} />
                <input name="phone" value={form.phone} onChange={handleChange} />
              </div>
            </label>
          </div>

          <label>
            Senha
            <div className="input-with-icon">
              <Lock size={16} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <div className="form-row">
            <label>
              CEP
              <input name="cep" value={form.cep} onChange={handleChange} />
            </label>
            <label>
              Cidade
              <div className="input-with-icon">
                <MapPin size={16} />
                <input name="city" value={form.city} onChange={handleChange} />
              </div>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg">
            <UserPlus size={16} />
            Cadastrar
          </button>

          <p className="center-link">
            Já possui conta? <Link to="/login">Entrar</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
