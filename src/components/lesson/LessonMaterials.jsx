export default function LessonMaterials({ materials = [] }) {
  if (!materials.length) {
    return <p className="lesson-materials-empty">Nenhum material disponível para esta aula.</p>;
  }

  return (
    <div className="lesson-materials">
      <h3>Materiais</h3>
      <ul>
        {materials.map((item) => (
          <li key={item.id}>
            <a href={item.downloadUrl || item.fileUrl} target="_blank" rel="noreferrer">
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
