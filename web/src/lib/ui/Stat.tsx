import type { ReactNode } from "react";

type StatSize = "hero" | "md" | "sm";

const NUMBERS: Record<StatSize, string> = { hero: "text-hero", md: "text-xl", sm: "text-lg" };

type StatProps = {
  label: string;
  value: ReactNode;
  unit?: string;
  fuente?: string;
  size?: StatSize;
  leading?: ReactNode;
};

export function Stat({ label, value, unit, fuente, size = "md", leading }: StatProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-2 text-sm font-semibold text-fg-2">
        {leading}
        {label}
      </p>
      <p className={`font-display font-bold text-fg tabular-nums ${NUMBERS[size]}`}>
        {value}
        {unit ? <span className="ml-2 font-sans text-base font-normal text-fg-2">{unit}</span> : null}
      </p>
      {fuente ? <p className="text-xs text-fg-2">Fuente: {fuente}</p> : null}
    </div>
  );
}
