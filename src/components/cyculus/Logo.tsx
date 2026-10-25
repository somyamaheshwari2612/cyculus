
export function CycleMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <img
      src="/favicon.ico"
      alt="Cyculus"
      className={`${className} object-contain rounded-full shadow-xs shrink-0`}
      onError={(e) => {
        e.currentTarget.src = "/apple-touch-icon.png";
      }}
    />
  );
}

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-primary">
      <img
        src="/favicon.ico"
        alt="Cyculus Logo"
        className={`${size === "lg" ? "h-10 w-10" : "h-7 w-7"} object-contain rounded-full shadow-xs shrink-0`}
        onError={(e) => {
          e.currentTarget.src = "/apple-touch-icon.png";
        }}
      />
      <span className={`font-display text-foreground font-medium tracking-tight ${size === "lg" ? "text-4xl" : "text-2xl"}`}>
        Cyculus
      </span>
    </span>
  );
}
