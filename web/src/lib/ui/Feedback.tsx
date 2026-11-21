import { WarningCircleIcon } from "./icons";
import type { ReactNode } from "react";

type EmptyStateProps = { icon?: ReactNode; title: string; action?: ReactNode };

export function EmptyState({ icon, title, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
      {icon ? <span className="grid size-12 place-items-center rounded-full bg-surface-2 text-fg-2">{icon}</span> : null}
      <p className="max-w-[45ch] text-base text-fg">{title}</p>
      {action}
    </div>
  );
}

type ErrorStateProps = { title: string; fix: string; action?: ReactNode };

export function ErrorState({ title, fix, action }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-4 rounded-md bg-bad-soft p-4 text-bad-soft-ink">
      <WarningCircleIcon aria-hidden className="shrink-0" />
      <div className="min-w-0 flex-1 basis-56">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm">{fix}</p>
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className = "h-5 w-full" }: { className?: string }) {
  return <span aria-hidden className={`block animate-pulse rounded-md bg-surface-2 ${className}`} />;
}

export type Conexion = "conectado" | "reconectando";

export function EnVivo({ estado = "conectado" }: { estado?: Conexion }) {
  const conectado = estado === "conectado";
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm font-semibold text-fg-2">
      <span aria-hidden className={`size-2.5 rounded-full ${conectado ? "bg-ok" : "bg-warn"}`} />
      {conectado ? "En vivo" : "Reconectando"}
    </span>
  );
}
