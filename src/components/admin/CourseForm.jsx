import { slugify } from "../../utils/slugify.js";
import MediaUploadField from "./MediaUploadField.jsx";

const LEVEL_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Arquivado" },
];

export default function CourseForm({ form, setForm, courseId }) {
  function updateField(name, value) {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "title" && !current.slugTouched) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  return (
    <div className="admin-form-grid">
      <label>
        Nome do curso
        <input value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
      </label>

      <label>
        Slug
        <input
          value={form.slug}
          onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value, slugTouched: true }))}
          required
        />
      </label>

      <label>
        Categoria
        <input value={form.category} onChange={(e) => updateField("category", e.target.value)} placeholder="NR10, NR35..." />
      </label>

      <label>
        Professor
        <input value={form.instructor} onChange={(e) => updateField("instructor", e.target.value)} />
      </label>

      <label>
        Carga horária
        <input value={form.workload} onChange={(e) => updateField("workload", e.target.value)} placeholder="40h" />
      </label>

      <label>
        Nível
        <select value={form.levelEnum} onChange={(e) => updateField("levelEnum", e.target.value)}>
          {LEVEL_OPTIONS.map((option) => (
            <option key={option.value || "empty"} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label>
        Preço (R$)
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => updateField("price", e.target.value)}
        />
      </label>

      <label>
        Status
        <select value={form.status} onChange={(e) => updateField("status", e.target.value)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="admin-form-span-2">
        Descrição curta
        <textarea rows={2} value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} />
      </label>

      <label className="admin-form-span-2">
        Descrição completa
        <textarea rows={4} value={form.fullDescription} onChange={(e) => updateField("fullDescription", e.target.value)} />
      </label>

      <label className="admin-form-span-2">
        Conteúdo programático
        <textarea rows={4} value={form.content} onChange={(e) => updateField("content", e.target.value)} />
      </label>

      <div className="admin-form-span-2">
        <MediaUploadField
          label="Capa do curso"
          value={form.coverUrl}
          sourceType={form.coverType}
          folder={courseId ? `courses/${courseId}/cover` : "courses/new/cover"}
          onChange={({ type, url }) => setForm((c) => ({ ...c, coverType: type, coverUrl: url, image: url }))}
        />
      </div>

      <div className="admin-form-span-2">
        <MediaUploadField
          label="Banner do curso"
          value={form.bannerUrl}
          sourceType={form.bannerType}
          folder={courseId ? `courses/${courseId}/banner` : "courses/new/banner"}
          onChange={({ type, url }) => setForm((c) => ({ ...c, bannerType: type, bannerUrl: url }))}
        />
      </div>
    </div>
  );
}
