import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Breadcrumb from "../components/layout/Breadcrumb.jsx";
import BrandRail from "../components/ui/BrandRail.jsx";
import { getCertificateByCode } from "../services/platform.js";
import certificateSeal from "../assets/logoempe.png";

export default function CertificatePage() {
  const { code } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCertificateByCode(code)
      .then((data) => {
        if (!data) setError("Certificado não encontrado.");
        else setCertificate(data);
      })
      .catch(() => setError("Não foi possível validar o certificado."))
      .finally(() => setLoading(false));
  }, [code]);

  const validationUrl = certificate?.qrPayload || `${window.location.origin}/aluno/certificado/${code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(validationUrl)}`;

  return (
    <>
      <Header />
      <main className="page page-transition">
        <div className="container certificate-page">
          <Breadcrumb items={[
            { label: "Início", to: "/" },
            { label: "Meu painel", to: "/aluno" },
            { label: "Certificado" },
          ]} />

          <Link to="/aluno" className="back-link">
            <ArrowLeft size={16} />
            Voltar ao painel
          </Link>

          {loading ? <p>Validando certificado...</p> : null}
          {error ? <p role="alert">{error}</p> : null}

          {certificate ? (
            <article className="certificate-card">
              <img src={certificateSeal} alt="" className="certificate-seal" />
              <span className="eyebrow eyebrow-brand">Certificado NewTech</span>
              <BrandRail>
                <h1 style={{ fontSize: "var(--text-2xl)", marginTop: "var(--space-4)" }}>
                  {certificate.courseTitle}
                </h1>
              </BrandRail>
              <p style={{ margin: "var(--space-4) 0", color: "var(--color-text-soft)" }}>
                Certificamos que <strong>{certificate.studentName}</strong> concluiu o curso
                com carga horária registrada na plataforma NewTech Cursos.
              </p>
              <p className="certificate-code">{certificate.code}</p>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                Emitido em {new Date(certificate.issuedAt).toLocaleDateString("pt-BR")}
              </p>
              <img
                src={qrUrl}
                alt="QR Code de validação"
                className="certificate-qr"
                loading="lazy"
              />
              <p style={{ marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                <ShieldCheck size={14} style={{ verticalAlign: "middle" }} /> Valide este certificado pelo código ou QR.
              </p>
            </article>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
