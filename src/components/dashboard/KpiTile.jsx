export default function KpiTile({ value, label }) {
  return (
    <div className="kpi-tile">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
