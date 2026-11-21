import type { ReactNode } from "react";

import { ORDEN_SEMAFORO, SEMAFORO, type ColorSemaforo } from "./dominio";

type LampSize = "sm" | "md" | "lg";

const LAMPS: Record<ColorSemaforo, string> = { verde: "bg-ok", ambar: "bg-warn", rojo: "bg-bad" };
const LAMP_SIZES: Record<LampSize, string> = { sm: "size-3", md: "size-4", lg: "size-6" };

export function Lamp({ color, size = "md" }: { color: ColorSemaforo; size?: LampSize }) {
  return <span aria-hidden className={`inline-block shrink-0 rounded-full ${LAMP_SIZES[size]} ${LAMPS[color]}`} />;
}

type SemaforoProps = { color: ColorSemaforo; size?: "sm" | "md"; children?: ReactNode };

export function Semaforo({ color, size = "md", children }: SemaforoProps) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold text-fg ${size === "sm" ? "text-sm" : "text-base"}`}>
      <Lamp color={color} size={size} />
      {children ?? SEMAFORO[color].etiqueta}
    </span>
  );
}

export function Legend({ title = "Cómo leer el semáforo" }: { title?: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-fg">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {ORDEN_SEMAFORO.map((color) => (
          <li key={color} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 flex">
              <Lamp color={color} />
            </span>
            <span className="text-fg-2">
              <span className="font-semibold text-fg">{SEMAFORO[color].etiqueta}.</span> {SEMAFORO[color].significado}.
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
