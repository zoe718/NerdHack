import {
  CheckCircleIcon,
  CircleDashedIcon,
  FlaskIcon,
  TrayArrowDownIcon,
  WarningCircleIcon,
  type Icon,
} from "./icons";
import type { ReactNode } from "react";

import { ESTADOS, type EstadoDocumento, type Tone } from "./dominio";

type ChipSize = "sm" | "md";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-fg-2",
  info: "bg-info-soft text-info-soft-ink",
  ok: "bg-ok-soft text-ok-soft-ink",
  warn: "bg-warn-soft text-warn-soft-ink",
  bad: "bg-bad-soft text-bad-soft-ink",
  accent: "bg-accent-soft text-accent-soft-ink",
};

const SIZES: Record<ChipSize, string> = {
  sm: "h-7 px-2.5 text-xs",
  md: "h-8 px-3 text-sm",
};

type ChipProps = { tone?: Tone; size?: ChipSize; icon?: ReactNode; children: ReactNode };

export function Chip({ tone = "neutral", size = "md", icon, children }: ChipProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${TONES[tone]} ${SIZES[size]}`}
    >
      {icon}
      {children}
    </span>
  );
}

const ICONOS: Record<EstadoDocumento, Icon> = {
  pendiente: CircleDashedIcon,
  recibido: TrayArrowDownIcon,
  observado: WarningCircleIcon,
  aprobado: CheckCircleIcon,
};

export function EstadoChip({ estado, size = "md" }: { estado: EstadoDocumento; size?: ChipSize }) {
  const Icono = ICONOS[estado];
  return (
    <Chip tone={ESTADOS[estado].tone} size={size} icon={<Icono size={16} aria-hidden />}>
      {ESTADOS[estado].etiqueta}
    </Chip>
  );
}

export function DemoBadge() {
  return (
    <span data-demo-data="true">
      <Chip size="sm" icon={<FlaskIcon size={16} aria-hidden />}>
        Datos de ejemplo
      </Chip>
    </span>
  );
}
