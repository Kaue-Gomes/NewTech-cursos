import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Award,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  User,
  UserPlus,
  Zap
} from "lucide-react";
import { registerStudent } from "../services/auth.js";

export default function Register() {
  const navigate = useNavigate();
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
    state: ""
  });

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = registerStudent(form);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    alert("Cadastro realizado com sucesso!");
    navigate("/login");
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
            <Sparkles size={14} /> Crie sua conta
          </span>
          <h2>Comece sua jornada profissional hoje.</h2>
          <p>
            Cadastre-se gratuitamente e tenha acesso a cursos profissionalizantes
            em segurança, engenharia e normas regulamentadoras.
          </p>

          <div className="auth-aside-features">
            <div className="auth-aside-feature">
              <span className="auth-aside-feature-icon"><ShieldCheck /></span>
              <div className="auth-aside-feature-text">
                <strong>Cadastro seguro</strong>
                <small>Seus dados protegidos com privacidade.</small>
              </div>
            </div>
            <div className="auth-aside-feature">
              <span className="auth-aside-feature-icon"><Award /></span>
              <div className="auth-aside-feature-text">
                <strong>Certificado oficial</strong>
                <small>Reconhecimento ao concluir os cursos.</small>
              </div>
            </div>
            <div className="auth-aside-feature">
              <span className="auth-aside-feature-icon"><Zap /></span>
              <div className="auth-aside-feature-text">
                <strong>Acesso instantâneo</strong>
                <small>Comece a aprender agora mesmo.</small>
              </div>
            </div>
          </div>
        </div>

        <p className="auth-aside-footer">© 2026 NewTech Cursos. Plataforma de capacitação.</p>
      </aside>

      <section className="auth-main">
        <form className="auth-card large" onSubmit={handleSubmit}>
          <span className="eyebrow eyebrow-blue">
            <UserPlus size={14} /> Cadastro
          </span>
          <h1>Criar conta de aluno</h1>
          <p className="auth-subtitle">Preencha seus dados para começar.</p>

          {error && (
            <div className="error">
              <TriangleAlert />
              <span>{error}</span>
            </div>
          )}

          <div className="divider">Dados pessoais</div>

          <label>
            Nome completo
            <div className="input-with-icon">
              <User />
              <input name="name" placeholder="Seu nome completo" value={form.name} onChange={handleChange} required />
            </div>
          </label>

          <label>
            E-mail
            <div className="input-with-icon">
              <Mail />
              <input name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} required />
            </div>
          </label>

          <label>
            Senha
            <div className="input-with-icon">
              <Lock />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Crie uma senha segura"
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

          <div className="form-row">
            <label>
              Telefone
              <div className="input-with-icon">
                <Phone />
                <input name="phone" placeholder="(00) 00000-0000" value={form.phone} onChange={handleChange} />
              </div>
            </label>
            <label>
              CPF/Documento
              <input name="document" placeholder="000.000.000-00" value={form.document} onChange={handleChange} />
            </label>
          </div>

          <div className="divider">Endereço</div>

          <div className="form-row">
            <label>
              CEP
              <input name="cep" placeholder="00000-000" value={form.cep} onChange={handleChange} />
            </label>
            <label>
              Rua
              <div className="input-with-icon">
                <MapPin />
                <input name="street" placeholder="Nome da rua" value={form.street} onChange={handleChange} />
              </div>
            </label>
          </div>

          <div className="form-row">
            <label>
              Número
              <input name="number" value={form.number} onChange={handleChange} />
            </label>
            <label>
              Bairro
              <input name="district" value={form.district} onChange={handleChange} />
            </label>
          </div>

          <div className="form-row">
            <label>
              Cidade
              <input name="city" value={form.city} onChange={handleChange} />
            </label>
            <label>
              Estado
              <input name="state" maxLength={2} placeholder="SP" value={form.state} onChange={handleChange} />
            </label>
          </div>

          <button type="submit" className="btn btn-primary full big">
            Criar minha conta
          </button>

          <Link to="/login" className="center-link">Já tenho uma conta · Entrar</Link>
        </form>
      </section>
    </main>
  );
}
