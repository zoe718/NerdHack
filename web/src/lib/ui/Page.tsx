import { CheckIcon } from "./icons";
import type { ReactNode } from "react";

import { DemoBadge } from "./Chip";

type PageHeaderProps = {
  title: string;
  lead?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  demo?: boolean;
};

export function PageHeader({ title, lead, meta, actions, demo = false }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0 flex-1 basis-80">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-xl font-bold text-fg">{title}</h1>
          {demo ? <DemoBadge /> : null}
        </div>
        {lead ? <p className="mt-1 max-w-[65ch] text-base text-fg-2">{lead}</p> : null}
        {meta ? <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-fg-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}

export function MetaItem({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      {icon}
      {children}
    </span>
  );
}

export type Recipe = "dashboard" | "detail" | "flow" | "list";

type PageLayoutProps = {
  recipe: Recipe;
  header: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function PageLayout({ recipe, header, aside, footer, children }: PageLayoutProps) {
  const width = recipe === "flow" ? "max-w-[720px]" : "max-w-[1200px]";
  return (
    <div data-recipe={recipe} className={`mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 ${width}`}>
      {header}
      {aside ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex min-w-0 flex-col gap-6">{children}</div>
          <aside className="flex min-w-0 flex-col gap-6">{aside}</aside>
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-6">{children}</div>
      )}
      {footer ? (
        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-surface px-4 py-3 sm:-mx-6 sm:px-6">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

type SectionHeaderProps = { title: string; description?: ReactNode; action?: ReactNode };

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-lg font-bold text-fg">{title}</h2>
        {description ? <p className="mt-1 text-sm text-fg-2">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol aria-label="Pasos" className="flex flex-wrap gap-x-6 gap-y-2">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const marker = done ? "bg-ok-soft text-ok-soft-ink" : active ? "bg-accent text-accent-ink" : "bg-surface-2 text-fg-2";
        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className={`flex items-center gap-2 text-sm font-semibold ${active ? "text-fg" : "text-fg-2"}`}
          >
            <span className={`grid size-7 place-items-center rounded-full tabular-nums ${marker}`}>
              {done ? <CheckIcon size={16} aria-hidden /> : i + 1}
            </span>
            {step}
          </li>
        );
      })}
    </ol>
  );
}
