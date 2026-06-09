import { useEffect, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { getLessonMaterials, addLessonMaterial, deleteLessonMaterial, uploadFile } from "../../services/content.js";
import { useToast } from "../../context/ToastContext.jsx";

const MATERIAL_ACCEPT = ".pdf,.zip,.docx,.xlsx,.pptx";

export default function MaterialUploadList({ lessonId }) {
  const { showToast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [uploading, setUploading] = useState(false);

  async function loadMaterials() {
    const data = await getLessonMaterials(lessonId);
    setMaterials(data);
  }

  useEffect(() => {
    loadMaterials().catch(console.error);
  }, [lessonId]);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = await uploadFile({
        bucket: "lesson-materials",
        file,
        folder: `lessons/${lessonId}`,
      });
      await addLessonMaterial(lessonId, {
        name: file.name,
        fileUrl: path,
        fileType: file.type,
        fileSizeBytes: file.size,
      });
      await loadMaterials();
      showToast("Material adicionado.", "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    await deleteLessonMaterial(id);
    await loadMaterials();
  }

  return (
    <div className="material-upload-list">
      <div className="material-upload-list__header">
        <strong>Materiais</strong>
        <label className="btn btn-secondary btn-sm">
          <Upload size={14} />
          {uploading ? "Enviando..." : "Upload"}
          <input type="file" accept={MATERIAL_ACCEPT} hidden onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      <ul>
        {materials.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDelete(item.id)}>
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
