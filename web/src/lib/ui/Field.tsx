import { LockIcon } from "./icons";
import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

const CONTROL =
  "w-full rounded-md border border-line bg-surface px-4 text-base text-fg placeholder:text-fg-2 disabled:bg-surface-2 disabled:text-fg-2 aria-[invalid=true]:border-bad";

type FieldText = { label: string; hint?: string; error?: string };

function Note({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  const note = error ?? hint;
  if (!note) return null;
  return (
    <p id={id} className={`text-sm ${error ? "text-bad-soft-ink" : "text-fg-2"}`}>
      {note}
    </p>
  );
}

export function TextField({ label, hint, error, className = "", ...rest }: FieldText & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const note = error ?? hint;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-fg">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? `${id}-nota` : undefined}
        className={`${CONTROL} h-12 ${className}`}
        {...rest}
      />
      <Note id={`${id}-nota`} hint={hint} error={error} />
    </div>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  className = "",
  ...rest
}: FieldText & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const note = error ?? hint;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-fg">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? `${id}-nota` : undefined}
        className={`${CONTROL} min-h-24 py-3 ${className}`}
        {...rest}
      />
      <Note id={`${id}-nota`} hint={hint} error={error} />
    </div>
  );
}

type ProtectedBlockProps = { title: string; note?: string; footer?: ReactNode; children: ReactNode };

export function ProtectedBlock({ title, note, footer, children }: ProtectedBlockProps) {
  return (
    <div className="rounded-md bg-surface-2 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-fg">
        <LockIcon aria-hidden />
        {title}
      </p>
      {note ? <p className="mt-1 text-sm text-fg-2">{note}</p> : null}
      <div className="mt-3 text-sm text-fg">{children}</div>
      {footer ? <p className="mt-3 text-xs text-fg-2">{footer}</p> : null}
    </div>
  );
}
