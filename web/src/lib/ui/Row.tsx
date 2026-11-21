import type { ReactNode } from "react";

type RowProps = {
  leading?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
};

export function Row({ leading, title, meta, trailing, children }: RowProps) {
  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {leading ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-surface-2 text-fg-2">{leading}</span>
        ) : null}
        <div className="min-w-0 flex-1 basis-48">
          <p className="text-base font-semibold text-fg">{title}</p>
          {meta ? <p className="text-sm text-fg-2">{meta}</p> : null}
        </div>
        {trailing ? <div className="flex flex-wrap items-center gap-x-4 gap-y-2">{trailing}</div> : null}
      </div>
      {children ? <div className="mt-3 sm:pl-14">{children}</div> : null}
    </li>
  );
}

export function RowList({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ul aria-label={label} className="divide-y divide-line">
      {children}
    </ul>
  );
}
