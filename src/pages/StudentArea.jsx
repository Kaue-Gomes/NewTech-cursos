import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Award, BookOpen } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Breadcrumb from "../components/layout/Breadcrumb.jsx";
import BrandRail from "../components/ui/BrandRail.jsx";
import KpiTile from "../components/dashboard/KpiTile.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { SkeletonList } from "../components/ui/Skeleton.jsx";
import { getCurrentUser } from "../services/auth.js";
import { getStudentDashboard } from "../services/platform.js";
import emptyEnrollments from "../assets/logoempe.png";
import emptyCertificates from "../assets/logoempe.png";

export default function StudentArea() {
  const user = getCurrentUser();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    getStudentDashboard(user.email)
      .then(setDashboard)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.email]);

  const firstName = user?.name?.split(" ")[0] || "aluno";

  return (
    <>
      <Header />
      <main className="page page-transition technical-grid-bg">
        <div className="container">
          <Breadcrumb items={[
            { label: "Início", to: "/" },
            { label: "Meu painel" },
          ]} />

          <div className="dashboard-hero brand-rail brand-rail--full">
            <span className="eyebrow eyebrow-brand">Área do aluno</span>
            <BrandRail>
              <h1>Olá, {firstName}</h1>
            </BrandRail>
            <p style={{ color: "var(--color-text-soft)", marginTop: "var(--space-2)" }}>
              Centro operacional da sua capacitação técnica e certificações NR.
            </p>
          </div>

          {loading ? (
            <SkeletonList count={2} />
          ) : (
            <>
              <div className="kpi-grid" style={{ marginBottom: "var(--space-8)" }}>
                <KpiTile label="Horas estudadas" value={`${dashboard?.studiedHours ?? 0}h`} />
                <KpiTile label="Certificados emitidos" value={dashboard?.certificatesCount ?? 0} />
                <KpiTile label="Cursos concluídos" value={dashboard?.completedCourses ?? 0} />
                <KpiTile label="Próximos vencimentos" value={dashboard?.expiringSoon ?? 0} />
              </div>

              <section style={{ marginBottom: "var(--space-8)" }}>
                <div className="section-header">
                  <BrandRail>
                    <div>
                      <span className="eyebrow">Prioridade</span>
                      <h2>Continuar estudando</h2>
                    </div>
                  </BrandRail>
                </div>

                {dashboard?.continueCourse ? (
                  <div className="continue-card">
                    <div>
                      <h3>{dashboard.continueCourse.title}</h3>
                      <p style={{ color: "var(--color-text-soft)", margin: "var(--space-2) 0" }}>
                        {dashboard.continueCourse.description}
                      </p>
                      <ProgressBar value={dashboard.continueCourse.percent} />
                    </div>
                    <Link to={`/curso/${dashboard.continueCourse.id}`} className="btn btn-primary">
                      Continuar
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <EmptyState
                    illustration={<img src={emptyEnrollments} alt="" />}
                    title="Nenhum curso em andamento"
                    description="Inscreva-se em um curso NR para acompanhar módulos e progresso."
                    actionLabel="Explorar cursos"
                    actionTo="/cursos"
                  />
                )}
              </section>

              <section style={{ marginBottom: "var(--space-8)" }}>
                <div className="section-header">
                  <BrandRail>
                    <div>
                      <span className="eyebrow">Certificação</span>
                      <h2>Certificados disponíveis</h2>
                    </div>
                  </BrandRail>
                </div>

                {(dashboard?.certificates ?? []).length === 0 ? (
                  <EmptyState
                    illustration={<img src={emptyCertificates} alt="" />}
                    title="Nenhum certificado emitido"
                    description="Conclua um curso inscrito para receber seu certificado com código de validação."
                  />
                ) : (
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Curso</th>
                          <th>Código</th>
                          <th>Emitido em</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.certificates.map((cert) => (
                          <tr key={cert.id}>
                            <td>{cert.course_title}</td>
                            <td><code>{cert.code}</code></td>
                            <td>{new Date(cert.issued_at).toLocaleDateString("pt-BR")}</td>
                            <td>
                              <Link to={`/aluno/certificado/${cert.code}`} className="btn btn-secondary btn-sm">
                                <Award size={14} />
                                Ver
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section>
                <div className="section-header">
                  <BrandRail>
                    <div>
                      <span className="eyebrow">Histórico</span>
                      <h2>Inscrições</h2>
                    </div>
                  </BrandRail>
                  <Link to="/cursos" className="btn btn-secondary btn-sm">
                    <BookOpen size={14} />
                    Novo curso
                  </Link>
                </div>

                {(dashboard?.enrollments ?? []).length === 0 ? (
                  <EmptyState
                    illustration={<img src={emptyEnrollments} alt="" />}
                    title="Sem inscrições"
                    description="Suas inscrições aparecerão aqui após matrícula em um curso."
                    actionLabel="Ver catálogo"
                    actionTo="/cursos"
                  />
                ) : (
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Curso</th>
                          <th>Pedido</th>
                          <th>Data</th>
                          <th>Status</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.enrollments.map((item) => (
                          <tr key={item.id}>
                            <td>{item.course?.title || item.courseTitle}</td>
                            <td>{item.orderNumber || item.order_number}</td>
                            <td>{new Date(item.date || item.created_at).toLocaleDateString("pt-BR")}</td>
                            <td>{item.status}</td>
                            <td>
                              <Link
                                to={`/curso/${item.course?.id || item.course_id}`}
                                className="btn btn-ghost btn-sm"
                              >
                                Abrir
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
