import type { ReactNode } from "react";

type Variant = "info" | "warning" | "error" | "neutral";

const variantClass: Record<Variant, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-950",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

type AdminCalloutProps = {
  variant: Variant;
  title?: string;
  children: ReactNode;
};

/**
 * Caixa de aviso / estado vazio reutilizável no painel (Fase 6).
 */
export function AdminCallout({ variant, title, children }: AdminCalloutProps) {
  const role = variant === "error" ? "alert" : undefined;
  return (
    <div
      className={`rounded-lg border p-4 text-sm leading-relaxed ${variantClass[variant]}`}
      role={role}
    >
      {title ? (
        <p className="font-semibold">{title}</p>
      ) : null}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </div>
  );
}
