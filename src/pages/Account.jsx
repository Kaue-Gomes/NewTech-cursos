import { useEffect, useState } from "react";
import {
  Calendar,
  CreditCard,
  Home as HomeIcon,
  IdCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User,
  UserCircle,
} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Breadcrumb from "../components/layout/Breadcrumb.jsx";
import BrandRail from "../components/ui/BrandRail.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { getFullCurrentUser, updateCurrentUser } from "../services/auth.js";
import { getStudentEnrollments } from "../services/storage.js";
import { useToast } from "../context/ToastContext.jsx";
import emptyEnrollments from "../assets/logoempe.png";

const TABS = [
  { id: "dados", label: "Dados pessoais", icon: User },
  { id: "endereco", label: "Endereço", icon: MapPin },
  { id: "compras", label: "Compras e inscrições", icon: ShoppingBag },
  { id: "seguranca", label: "Segurança", icon: ShieldCheck },
];

export default function Account() {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [activeTab, setActiveTab] = useState("dados");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    document: "",
    birthdate: "",
    address: {
      cep: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
    },
  });

  useEffect(() => {
    async function loadAccount() {
      const profile = await getFullCurrentUser();
      setUser(profile);
      if (!profile) return;

      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
        document: profile.document || "",
        birthdate: profile.birthdate || "",
        address: {
          cep: profile.address?.cep || "",
          street: profile.address?.street || "",
          number: profile.address?.number || "",
          complement: profile.address?.complement || "",
          district: profile.address?.district || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
        },
      });

      if (profile.role === "student") {
        const enrollments = await getStudentEnrollments(profile.email);
        setPurchases(enrollments);
      }
    }
    loadAccount().catch(console.error);
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    if (name.startsWith("address.")) {
      const field = name.replace("address.", "");
      setForm({ ...form, address: { ...form.address, [field]: value } });
      return;
    }
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const updated = await updateCurrentUser(form);
      setUser(updated);
      showToast("Dados atualizados com sucesso.", "success");
    } catch (error) {
      showToast(error.message || "Não foi possível atualizar os dados.", "error");
    }
  }

  if (!user) return null;

  const initials = user.name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const activeTabLabel = TABS.find((tab) => tab.id === activeTab)?.label || "Conta";

  return (
    <>
      <Header />
      <main className="page page-transition">
        <div className="container">
          <Breadcrumb items={[
            { label: "Início", to: "/" },
            { label: "Minha conta" },
            { label: activeTabLabel },
          ]} />

          <div className="dashboard-hero brand-rail brand-rail--full" style={{ marginBottom: "var(--space-6)" }}>
            <BrandRail><h1>Minha conta</h1></BrandRail>
            <p style={{ color: "var(--color-text-soft)" }}>Gerencie perfil, endereço e histórico de inscrições.</p>
          </div>

          <div className="dashboard-layout">
            <aside className="admin-sidebar">
              <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--color-border)" }}>
                <div className="user-avatar" style={{ marginBottom: "var(--space-3)" }}>{initials}</div>
                <strong>{user.name}</strong>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>{user.email}</p>
              </div>
              <nav>
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      className={activeTab === tab.id ? "active" : ""}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <section className="ui-card" style={{ padding: "var(--space-6)" }}>
              {activeTab === "dados" && (
                <form onSubmit={handleSubmit}>
                  <h2>Dados pessoais</h2>
                  <div className="form-row" style={{ marginTop: "var(--space-4)" }}>
                    <label>
                      Nome
                      <div className="input-with-icon"><User size={16} /><input name="name" value={form.name} onChange={handleChange} /></div>
                    </label>
                    <label>
                      E-mail
                      <div className="input-with-icon"><Mail size={16} /><input value={user.email} disabled /></div>
                    </label>
                  </div>
                  <div className="form-row">
                    <label>Telefone<div className="input-with-icon"><Phone size={16} /><input name="phone" value={form.phone} onChange={handleChange} /></div></label>
                    <label>Documento<div className="input-with-icon"><IdCard size={16} /><input name="document" value={form.document} onChange={handleChange} /></div></label>
                  </div>
                  <label>Data de nascimento<div className="input-with-icon"><Calendar size={16} /><input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} /></div></label>
                  <div className="form-actions"><button type="submit" className="btn btn-primary">Salvar dados</button></div>
                </form>
              )}

              {activeTab === "endereco" && (
                <form onSubmit={handleSubmit}>
                  <h2>Endereço</h2>
                  <div className="form-row" style={{ marginTop: "var(--space-4)" }}>
                    <label>CEP<input name="address.cep" value={form.address.cep} onChange={handleChange} /></label>
                    <label>Rua<div className="input-with-icon"><HomeIcon size={16} /><input name="address.street" value={form.address.street} onChange={handleChange} /></div></label>
                  </div>
                  <div className="form-row three">
                    <label>Número<input name="address.number" value={form.address.number} onChange={handleChange} /></label>
                    <label>Complemento<input name="address.complement" value={form.address.complement} onChange={handleChange} /></label>
                    <label>Bairro<input name="address.district" value={form.address.district} onChange={handleChange} /></label>
                  </div>
                  <div className="form-row">
                    <label>Cidade<input name="address.city" value={form.address.city} onChange={handleChange} /></label>
                    <label>UF<input name="address.state" maxLength={2} value={form.address.state} onChange={handleChange} /></label>
                  </div>
                  <div className="form-actions"><button type="submit" className="btn btn-primary">Salvar endereço</button></div>
                </form>
              )}

              {activeTab === "compras" && (
                <div>
                  <h2>Compras e inscrições</h2>
                  {user.role === "admin" ? (
                    <EmptyState title="Perfil administrativo" description="Administradores não possuem histórico de compras de aluno." />
                  ) : purchases.length === 0 ? (
                    <EmptyState
                      illustration={<img src={emptyEnrollments} alt="" />}
                      title="Nenhuma inscrição"
                      description="Quando você se inscrever em um curso, ele aparecerá aqui."
                      actionLabel="Ver cursos"
                      actionTo="/cursos"
                    />
                  ) : (
                    <div className="data-table-wrap" style={{ marginTop: "var(--space-4)" }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Curso</th>
                            <th>Pedido</th>
                            <th>Data</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchases.map((item) => (
                            <tr key={item.id}>
                              <td>{item.course.title}</td>
                              <td>{item.orderNumber}</td>
                              <td>{new Date(item.date).toLocaleDateString("pt-BR")}</td>
                              <td>{item.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "seguranca" && (
                <div>
                  <h2>Segurança da conta</h2>
                  <div className="kpi-grid" style={{ marginTop: "var(--space-4)" }}>
                    <div className="kpi-tile"><Mail size={16} /><strong>{user.email}</strong><span>E-mail de acesso</span></div>
                    <div className="kpi-tile"><UserCircle size={16} /><strong>{user.role === "admin" ? "Administrador" : "Aluno"}</strong><span>Tipo de perfil</span></div>
                    <div className="kpi-tile"><ShieldCheck size={16} /><strong>Protegida</strong><span>Sessão via API segura</span></div>
                    <div className="kpi-tile"><CreditCard size={16} /><strong>—</strong><span>Sem cartão registrado</span></div>
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
