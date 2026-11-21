import type { EventoBitacora } from "./api";

// Más reciente primero; con la misma hora, el de id mayor (se registró después).
export function ordenarRecientes(eventos: EventoBitacora[]): EventoBitacora[] {
  return [...eventos].sort(
    (a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime() || b.id - a.id,
  );
}
