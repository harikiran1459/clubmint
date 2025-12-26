export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 animate-pulse">
      <div className="h-4 w-1/3 bg-white/10 rounded mb-3" />
      <div className="h-8 w-1/2 bg-white/10 rounded" />
    </div>
  );
}
