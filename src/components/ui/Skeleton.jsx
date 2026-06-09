export default function Skeleton({ className = "skeleton-card" }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="courses-grid">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  );
}
