export default function ProgressBar({ value = 0, label = "Progresso" }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="progress-bar__label">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>
      <div className="progress-bar" role="progressbar" aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar__fill" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
