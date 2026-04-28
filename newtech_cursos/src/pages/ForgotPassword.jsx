import { Link } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <>
      <Header />
      <main className="auth-page page-transition">
        <form className="auth-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Recuperação</p>
          <h1>Recuperar senha</h1>

          {sent && <p className="success">Instruções de recuperação simuladas com sucesso.</p>}

          <label>
            E-mail
            <input type="email" placeholder="Digite seu e-mail" required />
          </label>

          <button className="btn btn-primary full">Enviar recuperação</button>
          <Link to="/login" className="center-link">Voltar para login</Link>
        </form>
      </main>
      <Footer />
    </>
  );
}
