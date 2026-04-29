import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import logoNewTech from "../assets/logonewtech.png";
import { login } from "../services/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

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
    <>
      <Header />
      <main className="auth-page login-auth-page page-transition">
        <img className="login-page-logo" src={logoNewTech} alt="NewTech Cursos" />

        <form className="auth-card login-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Acesso</p>
          <h1>Entrar na NewTech</h1>
          <p className="auth-subtitle">Acesse sua conta para continuar seus cursos.</p>

          {error && <p className="error">{error}</p>}

          <label>
            E-mail
            <input
              name="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Senha
            <input
              name="password"
              type="password"
              placeholder="Digite sua senha"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <button className="btn btn-primary full">Entrar</button>

          <div className="login-help">
            <Link to="/recuperar-senha">Esqueci minha senha</Link>
            <Link to="/cadastro">Criar conta</Link>
          </div>

          <div className="demo-logins">
            <strong>Acessos de teste:</strong>
            <span>ADM: admin@newtech.com / admin123</span>
            <span>Aluno: aluno@newtech.com / aluno123</span>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
