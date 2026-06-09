import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  getModules,
  addModule,
  updateModule,
  deleteModule,
  getLessons,
  addLesson,
  updateLesson,
  deleteLesson,
} from "../../services/content.js";
import MaterialUploadList from "./MaterialUploadList.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function ModuleManager({ courseId }) {
  const { showToast } = useToast();
  const [modules, setModules] = useState([]);
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [openModule, setOpenModule] = useState(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  async function loadModules() {
    const data = await getModules(courseId);
    setModules(data);
  }

  async function loadLessons(moduleId) {
    const data = await getLessons(moduleId);
    setLessonsByModule((current) => ({ ...current, [moduleId]: data }));
  }

  useEffect(() => {
    loadModules().catch(console.error);
  }, [courseId]);

  async function handleAddModule() {
    if (!newModuleTitle.trim()) return;
    await addModule(courseId, { title: newModuleTitle.trim() });
    setNewModuleTitle("");
    await loadModules();
    showToast("Módulo adicionado.", "success");
  }

  async function handleDeleteModule(id) {
    if (!window.confirm("Excluir módulo e aulas?")) return;
    await deleteModule(id);
    await loadModules();
    showToast("Módulo removido.", "success");
  }

  async function toggleModule(moduleId) {
    const next = openModule === moduleId ? null : moduleId;
    setOpenModule(next);
    if (next && !lessonsByModule[moduleId]) {
      await loadLessons(moduleId);
    }
  }

  async function handleAddLesson(moduleId) {
    const title = window.prompt("Título da aula");
    if (!title?.trim()) return;
    await addLesson(moduleId, { title: title.trim() });
    await loadLessons(moduleId);
    showToast("Aula adicionada.", "success");
  }

  async function handleLessonField(moduleId, lesson, field, value) {
    await updateLesson(lesson.id, { [field]: value });
    await loadLessons(moduleId);
  }

  async function handleDeleteLesson(moduleId, lessonId) {
    if (!window.confirm("Excluir aula?")) return;
    await deleteLesson(lessonId);
    await loadLessons(moduleId);
  }

  return (
    <div className="module-manager">
      <div className="module-manager-add">
        <input
          placeholder="Novo módulo"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
        />
        <button type="button" className="btn btn-primary btn-sm" onClick={handleAddModule}>
          <Plus size={14} /> Adicionar módulo
        </button>
      </div>

      {modules.map((module) => (
        <div className="module-card" key={module.id}>
          <div className="module-card-header">
            <button type="button" className="module-toggle" onClick={() => toggleModule(module.id)}>
              {openModule === module.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <input
              defaultValue={module.title}
              onBlur={(e) => updateModule(module.id, { title: e.target.value }).then(loadModules)}
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDeleteModule(module.id)}>
              <Trash2 size={14} />
            </button>
          </div>

          {openModule === module.id ? (
            <div className="module-card-body">
              <textarea
                defaultValue={module.description || ""}
                placeholder="Descrição do módulo"
                rows={2}
                onBlur={(e) => updateModule(module.id, { description: e.target.value }).then(loadModules)}
              />

              <div className="lesson-list">
                {(lessonsByModule[module.id] ?? []).map((lesson) => (
                  <div className="lesson-editor" key={lesson.id}>
                    <input
                      defaultValue={lesson.title}
                      onBlur={(e) => handleLessonField(module.id, lesson, "title", e.target.value)}
                    />
                    <input
                      defaultValue={lesson.slug}
                      placeholder="slug-da-aula"
                      onBlur={(e) => handleLessonField(module.id, lesson, "slug", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      defaultValue={lesson.durationMinutes || 0}
                      placeholder="Duração (min)"
                      onBlur={(e) => handleLessonField(module.id, lesson, "durationMinutes", Number(e.target.value))}
                    />
                    <input
                      defaultValue={lesson.videoUrl || ""}
                      placeholder="URL do vídeo (YouTube, Vimeo ou upload path)"
                      onBlur={(e) => handleLessonField(module.id, lesson, "videoUrl", e.target.value)}
                    />
                    <textarea
                      defaultValue={lesson.description || ""}
                      placeholder="Descrição da aula"
                      rows={2}
                      onBlur={(e) => handleLessonField(module.id, lesson, "description", e.target.value)}
                    />
                    <MaterialUploadList lessonId={lesson.id} />
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDeleteLesson(module.id, lesson.id)}>
                      Excluir aula
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleAddLesson(module.id)}>
                <Plus size={14} /> Nova aula
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
