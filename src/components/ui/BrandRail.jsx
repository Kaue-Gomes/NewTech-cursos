export default function BrandRail({ children, className = "", full = false }) {
  return (
    <div className={`brand-rail ${full ? "brand-rail--full" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
}
