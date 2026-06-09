import { useState } from "react";
import { Upload, Link2 } from "lucide-react";
import { uploadFile, validateExternalUrl } from "../../services/content.js";
import { useToast } from "../../context/ToastContext.jsx";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function MediaUploadField({
  label,
  value,
  sourceType = "url",
  onChange,
  bucket = "course-images",
  folder = "courses",
  accept = "image/jpeg,image/png,image/webp",
}) {
  const { showToast } = useToast();
  const [mode, setMode] = useState(sourceType || "url");
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      showToast("Formato inválido. Use JPG, PNG ou WebP.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Arquivo excede 5 MB.", "error");
      return;
    }

    setUploading(true);
    try {
      const path = await uploadFile({ bucket, file, folder });
      onChange({ type: "upload", url: path });
      showToast("Upload concluído.", "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleUrlBlur(url) {
    if (!url || mode !== "url") return;
    try {
      const result = await validateExternalUrl(url);
      if (!result.accessible) {
        showToast("URL informada pode estar inacessível.", "error");
      }
    } catch {
      // optional validation
    }
    onChange({ type: "url", url });
  }

  const previewUrl = value?.startsWith("http") ? value : null;

  return (
    <div className="media-upload-field">
      <label>{label}</label>
      <div className="media-upload-tabs">
        <button type="button" className={mode === "upload" ? "active" : ""} onClick={() => setMode("upload")}>
          <Upload size={14} /> Upload
        </button>
        <button type="button" className={mode === "url" ? "active" : ""} onClick={() => setMode("url")}>
          <Link2 size={14} /> URL
        </button>
      </div>

      {mode === "upload" ? (
        <div className="media-upload-drop">
          <input type="file" accept={accept} onChange={handleFileChange} disabled={uploading} />
          <span>{uploading ? "Enviando..." : "Selecionar arquivo"}</span>
        </div>
      ) : (
        <input
          type="url"
          defaultValue={previewUrl || ""}
          placeholder="https://site.com/imagem.jpg"
          onBlur={(e) => handleUrlBlur(e.target.value)}
        />
      )}

      {value ? (
        <div className="media-upload-preview">
          {previewUrl ? <img src={previewUrl} alt="" /> : <code>{value}</code>}
        </div>
      ) : null}
    </div>
  );
}
