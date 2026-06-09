export default function Badge({ children, variant = "nr", className = "" }) {
  return <span className={`badge badge-${variant} ${className}`.trim()}>{children}</span>;
}
