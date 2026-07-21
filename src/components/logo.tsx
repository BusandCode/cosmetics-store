export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="white" stroke="black" strokeWidth="1.5" />
        <path d="M12 1a11 11 0 0 1 0 22z" fill="black" />
      </svg>
      <span className="text-xl font-extrabold tracking-tight">MONO</span>
    </div>
  );
}