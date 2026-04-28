import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { registerStudent } from "../services/auth.js";

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
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
    <>
      <Header />
      <main className="auth-page page-transition">
        <form className="auth-card register-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Cadastro</p>
          <h1>Criar conta de aluno</h1>

          {error && <p className="error">{error}</p>}

          <label>Nome completo<input name="name" value={form.name} onChange={handleChange} required /></label>
          <label>E-mail<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
          <label>Senha<input name="password" type="password" value={form.password} onChange={handleChange} required /></label>

          <div className="form-row">
            <label>Telefone<input name="phone" value={form.phone} onChange={handleChange} /></label>
            <label>CPF/documento<input name="document" value={form.document} onChange={handleChange} /></label>
          </div>

          <div className="form-row">
            <label>CEP<input name="cep" value={form.cep} onChange={handleChange} /></label>
            <label>Rua<input name="street" value={form.street} onChange={handleChange} /></label>
          </div>

          <div className="form-row">
            <label>Número<input name="number" value={form.number} onChange={handleChange} /></label>
            <label>Bairro<input name="district" value={form.district} onChange={handleChange} /></label>
          </div>

          <div className="form-row">
            <label>Cidade<input name="city" value={form.city} onChange={handleChange} /></label>
            <label>Estado<input name="state" value={form.state} onChange={handleChange} /></label>
          </div>

          <button className="btn btn-primary full">Cadastrar</button>
          <Link to="/login" className="center-link">Já tenho conta</Link>
        </form>
      </main>
      <Footer />
    </>
  );
}
