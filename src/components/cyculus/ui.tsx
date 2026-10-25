import { type ReactNode } from "react";
import sprig from "@/assets/sprig.png";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-4xl leading-tight text-foreground md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card-soft p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="font-display text-2xl text-foreground">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-lavender/40 px-6 py-8">
      <img
        src={sprig}
        alt=""
        aria-hidden
        width={768}
        height={1024}
        loading="lazy"
        className="pointer-events-none absolute -right-4 -bottom-6 h-36 w-auto opacity-60"
      />
      <div className="relative max-w-md">
        <h3 className="font-display text-xl text-foreground">{title}</h3>
        <div className="mt-1 text-sm text-muted-foreground">{children}</div>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}

export function ErrorNote({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-xl border border-destructive/30 bg-rose-soft p-4 text-sm text-foreground">
      {error instanceof Error ? error.message : "Something went wrong."}
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-3 font-semibold text-primary underline-offset-2 hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-muted/60 p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 font-display text-3xl text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const flowTone: Record<string, string> = {
  spotting: "bg-rose-soft text-rose-deep border border-rose/30",
  light: "bg-rose/60 text-rose-deep",
  medium: "bg-rose text-plum",
  heavy: "bg-rose-deep text-primary-foreground",
};
