import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Home as HomeIcon,
  IdCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User,
  UserCircle
} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { getFullCurrentUser, updateCurrentUser } from "../services/auth.js";
import { getStudentEnrollments } from "../services/storage.js";

const TABS = [
  { id: "dados", label: "Dados pessoais", icon: User },
  { id: "endereco", label: "Endereço", icon: MapPin },
  { id: "compras", label: "Compras e inscrições", icon: ShoppingBag },
  { id: "seguranca", label: "Segurança", icon: ShieldCheck }
];

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

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <Header />

      <main className="page page-transition">
        <div className="container">
          <div className="account-layout">
            <aside className="account-sidebar">
              <div className="account-profile-card">
                <div className="user-avatar account-avatar">{initials}</div>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <span className="account-profile-tag">
                  <UserCircle />
                  {user.role === "admin" ? "Administrador" : "Aluno"}
                </span>
              </div>

              <nav className="account-tabs">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={activeTab === tab.id ? "active" : ""}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <section className="account-card">
              {activeTab === "dados" && (
                <form onSubmit={handleSubmit} className="account-form">
                  <div className="account-card-head">
                    <h2>Dados pessoais</h2>
                    <p>Informações principais da sua conta na NewTech.</p>
                  </div>

                  <div className="form-row">
                    <label>
                      Nome completo
                      <div className="input-with-icon">
                        <User />
                        <input name="name" value={form.name} onChange={handleChange} />
                      </div>
                    </label>
                    <label>
                      E-mail
                      <div className="input-with-icon">
                        <Mail />
                        <input value={user.email} disabled />
                      </div>
                    </label>
                  </div>

                  <div className="form-row">
                    <label>
                      Telefone
                      <div className="input-with-icon">
                        <Phone />
                        <input name="phone" value={form.phone} onChange={handleChange} placeholder="(00) 00000-0000" />
                      </div>
                    </label>
                    <label>
                      CPF/Documento
                      <div className="input-with-icon">
                        <IdCard />
                        <input name="document" value={form.document} onChange={handleChange} placeholder="000.000.000-00" />
                      </div>
                    </label>
                  </div>

                  <label>
                    Data de nascimento
                    <div className="input-with-icon">
                      <Calendar />
                      <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} />
                    </div>
                  </label>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Salvar dados</button>
                  </div>
                </form>
              )}

              {activeTab === "endereco" && (
                <form onSubmit={handleSubmit} className="account-form">
                  <div className="account-card-head">
                    <h2>Endereço</h2>
                    <p>Dados de endereço usados para cadastro, emissão e contato.</p>
                  </div>

                  <div className="form-row">
                    <label>
                      CEP
                      <input name="address.cep" value={form.address.cep} onChange={handleChange} />
                    </label>
                    <label>
                      Rua
                      <div className="input-with-icon">
                        <HomeIcon />
                        <input name="address.street" value={form.address.street} onChange={handleChange} />
                      </div>
                    </label>
                  </div>

                  <div className="form-row three">
                    <label>
                      Número
                      <input name="address.number" value={form.address.number} onChange={handleChange} />
                    </label>
                    <label>
                      Complemento
                      <input name="address.complement" value={form.address.complement} onChange={handleChange} />
                    </label>
                    <label>
                      Bairro
                      <input name="address.district" value={form.address.district} onChange={handleChange} />
                    </label>
                  </div>

                  <div className="form-row">
                    <label>
                      Cidade
                      <input name="address.city" value={form.address.city} onChange={handleChange} />
                    </label>
                    <label>
                      Estado
                      <input name="address.state" maxLength={2} value={form.address.state} onChange={handleChange} />
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Salvar endereço</button>
                  </div>
                </form>
              )}

              {activeTab === "compras" && (
                <div>
                  <div className="account-card-head">
                    <h2>Compras e inscrições</h2>
                    <p>Histórico dos cursos em que você se inscreveu.</p>
                  </div>

                  {user.role === "admin" ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <ShoppingBag />
                      </div>
                      <h2>Área administrativa</h2>
                      <p>Administradores não possuem histórico de compras de aluno.</p>
                    </div>
                  ) : purchases.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <ShoppingBag />
                      </div>
                      <h2>Nenhuma compra ou inscrição</h2>
                      <p>Quando você se inscrever em um curso, ele aparecerá aqui.</p>
                    </div>
                  ) : (
                    <div className="purchase-list">
                      {purchases.map((item) => (
                        <article key={item.id} className="purchase-item">
                          <img src={item.course.image} alt={item.course.title} />
                          <div>
                            <h3>{item.course.title}</h3>
                            <div className="purchase-item-meta">
                              <span><strong>Pedido:</strong> {item.orderNumber}</span>
                              <span><strong>Data:</strong> {new Date(item.date).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                          <div className="purchase-status">
                            <CheckCircle2 />
                            {item.status}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "seguranca" && (
                <div>
                  <div className="account-card-head">
                    <h2>Segurança da conta</h2>
                    <p>Informações de acesso e proteção da sua conta NewTech.</p>
                  </div>

                  <div className="security-grid">
                    <div className="security-card">
                      <div className="security-card-icon"><Mail /></div>
                      <div className="security-card-text">
                        <strong>E-mail de acesso</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                    <div className="security-card">
                      <div className="security-card-icon"><UserCircle /></div>
                      <div className="security-card-text">
                        <strong>Tipo de perfil</strong>
                        <span>{user.role === "admin" ? "Administrador" : "Aluno"}</span>
                      </div>
                    </div>
                    <div className="security-card">
                      <div className="security-card-icon"><ShieldCheck /></div>
                      <div className="security-card-text">
                        <strong>Senha</strong>
                        <span>Alteração de senha simulada nesta versão do projeto.</span>
                      </div>
                    </div>
                    <div className="security-card">
                      <div className="security-card-icon"><CreditCard /></div>
                      <div className="security-card-text">
                        <strong>Dados de pagamento</strong>
                        <span>Nenhum cartão registrado na conta.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
