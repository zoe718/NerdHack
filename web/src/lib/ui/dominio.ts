export type EstadoDocumento = "pendiente" | "recibido" | "observado" | "aprobado";
export type ColorSemaforo = "verde" | "ambar" | "rojo";
export type Tone = "neutral" | "info" | "ok" | "warn" | "bad" | "accent";

export const ESTADOS: Record<EstadoDocumento, { etiqueta: string; tone: Tone }> = {
  pendiente: { etiqueta: "Pendiente", tone: "neutral" },
  recibido: { etiqueta: "Recibido", tone: "info" },
  observado: { etiqueta: "Observado", tone: "warn" },
  aprobado: { etiqueta: "Aprobado", tone: "ok" },
};

export const SEMAFORO: Record<ColorSemaforo, { etiqueta: string; significado: string }> = {
  rojo: { etiqueta: "En rojo", significado: "Faltan 7 días o menos sin aprobar, o ya venció" },
  ambar: { etiqueta: "En ámbar", significado: "Faltan 14 días o menos y hay pendientes u observados" },
  verde: { etiqueta: "En verde", significado: "Todo aprobado, o faltan más de 14 días" },
};

export const ORDEN_SEMAFORO: ColorSemaforo[] = ["rojo", "ambar", "verde"];
