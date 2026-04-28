import { useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { getFullCurrentUser, updateCurrentUser } from "../services/auth.js";
import { getStudentEnrollments } from "../services/storage.js";

export default function Account() {
  const [user, setUser] = useState(getFullCurrentUser());
  const [activeTab, setActiveTab] = useState("dados");
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    document: user?.document || "",
    birthdate: user?.birthdate || "",
    address: {
      cep: user?.address?.cep || "",
      street: user?.address?.street || "",
      number: user?.address?.number || "",
      complement: user?.address?.complement || "",
      district: user?.address?.district || "",
      city: user?.address?.city || "",
      state: user?.address?.state || ""
    }
  });

  const purchases = user?.role === "student" ? getStudentEnrollments(user.email) : [];

  function handleChange(event) {
    const { name, value } = event.target;

    if (name.startsWith("address.")) {
      const field = name.replace("address.", "");
      setForm({
        ...form,
        address: {
          ...form.address,
          [field]: value
        }
      });
      return;
    }

    setForm({ ...form, [name]: value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const updated = updateCurrentUser(form);
    setUser(updated);
    alert("Dados atualizados com sucesso!");
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />

      <main className="page page-transition">
        <div className="container">
          <div className="account-hero">
            <div className="account-avatar">
              {user.name
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p className="eyebrow">Minha conta</p>
              <h1>{user.name}</h1>
              <p>{user.email} • {user.role === "admin" ? "Administrador" : "Aluno"}</p>
            </div>
          </div>

          <div className="account-tabs">
            <button className={activeTab === "dados" ? "active" : ""} onClick={() => setActiveTab("dados")}>
              Dados pessoais
            </button>
            <button className={activeTab === "endereco" ? "active" : ""} onClick={() => setActiveTab("endereco")}>
              Endereço
            </button>
            <button className={activeTab === "compras" ? "active" : ""} onClick={() => setActiveTab("compras")}>
              Compras e inscrições
            </button>
            <button className={activeTab === "seguranca" ? "active" : ""} onClick={() => setActiveTab("seguranca")}>
              Segurança
            </button>
          </div>

          <section className="account-card">
            {activeTab === "dados" && (
              <form onSubmit={handleSubmit} className="account-form">
                <h2>Dados pessoais</h2>
                <p>Informações principais da conta do usuário.</p>

                <div className="form-row">
                  <label>
                    Nome completo
                    <input name="name" value={form.name} onChange={handleChange} />
                  </label>
                  <label>
                    E-mail
                    <input value={user.email} disabled />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Telefone
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="(00) 00000-0000" />
                  </label>
                  <label>
                    CPF/documento
                    <input name="document" value={form.document} onChange={handleChange} placeholder="000.000.000-00" />
                  </label>
                </div>

                <label>
                  Data de nascimento
                  <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} />
                </label>

                <button className="btn btn-primary">Salvar dados</button>
              </form>
            )}

            {activeTab === "endereco" && (
              <form onSubmit={handleSubmit} className="account-form">
                <h2>Endereço</h2>
                <p>Dados de endereço usados para cadastro, emissão e contato.</p>

                <div className="form-row">
                  <label>
                    CEP
                    <input name="address.cep" value={form.address.cep} onChange={handleChange} />
                  </label>
                  <label>
                    Rua
                    <input name="address.street" value={form.address.street} onChange={handleChange} />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Número
                    <input name="address.number" value={form.address.number} onChange={handleChange} />
                  </label>
                  <label>
                    Complemento
                    <input name="address.complement" value={form.address.complement} onChange={handleChange} />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Bairro
                    <input name="address.district" value={form.address.district} onChange={handleChange} />
                  </label>
                  <label>
                    Cidade
                    <input name="address.city" value={form.address.city} onChange={handleChange} />
                  </label>
                </div>

                <label>
                  Estado
                  <input name="address.state" value={form.address.state} onChange={handleChange} />
                </label>

                <button className="btn btn-primary">Salvar endereço</button>
              </form>
            )}

            {activeTab === "compras" && (
              <div>
                <h2>Compras e inscrições</h2>
                <p className="muted">Histórico dos cursos inscritos pelo aluno.</p>

                {user.role === "admin" ? (
                  <div className="empty-state">
                    <h2>Área administrativa</h2>
                    <p>Administradores não possuem histórico de compras de aluno.</p>
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="empty-state">
                    <h2>Nenhuma compra ou inscrição encontrada.</h2>
                    <p>Quando você se inscrever em um curso, ele aparecerá aqui.</p>
                  </div>
                ) : (
                  <div className="purchase-list">
                    {purchases.map((item) => (
                      <article key={item.id} className="purchase-item">
                        <img src={item.course.image} alt={item.course.title} />
                        <div>
                          <h3>{item.course.title}</h3>
                          <p>Pedido: {item.orderNumber}</p>
                          <p>Status: {item.status} • Pagamento: {item.paymentStatus}</p>
                          <p>Data: {new Date(item.date).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "seguranca" && (
              <div className="security-grid">
                <div>
                  <h2>Segurança da conta</h2>
                  <p className="muted">Área destinada a informações de acesso e proteção da conta.</p>
                </div>

                <div className="security-card">
                  <strong>E-mail de acesso</strong>
                  <span>{user.email}</span>
                </div>

                <div className="security-card">
                  <strong>Tipo de perfil</strong>
                  <span>{user.role === "admin" ? "Administrador" : "Aluno"}</span>
                </div>

                <div className="security-card">
                  <strong>Senha</strong>
                  <span>Alteração de senha simulada nesta versão do projeto.</span>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
