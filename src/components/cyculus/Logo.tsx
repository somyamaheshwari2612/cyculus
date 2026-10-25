
export function CycleMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <path d="M26 11.5A11 11 0 1 0 27 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="27.2" cy="14.6" r="1.8" fill="currentColor" className="text-rose-deep" />
      <path d="M16 10c-2.2 2.4-2.2 9.6 0 12 2.2-2.4 2.2-9.6 0-12Z" fill="currentColor" opacity=".35" />
    </svg>
  );
}

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-2 text-primary">
      <CycleMark className={size === "lg" ? "h-10 w-10" : "h-7 w-7"} />
      <span className={`font-display text-foreground ${size === "lg" ? "text-5xl" : "text-2xl"}`}>Cyculus</span>
    </span>
  );
}
