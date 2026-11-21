// Agrupa los requisitos sin aprobar por municipio y los ordena por urgencia.
import { ORDEN_SEMAFORO, type ColorSemaforo } from "../../lib/ui";
import type { DocumentoResumen, JornadaResumen } from "./api";

export type GrupoMunicipio = {
  municipio: string;
  pendientes: number;
  mas_urgente: DocumentoResumen & { jornada_id: number };
  semaforo: ColorSemaforo;
};

const peor = (a: ColorSemaforo, b: ColorSemaforo) =>
  ORDEN_SEMAFORO.indexOf(a) <= ORDEN_SEMAFORO.indexOf(b) ? a : b;

export function agruparPendientes(jornadas: JornadaResumen[]): GrupoMunicipio[] {
  const grupos = new Map<string, GrupoMunicipio>();
  for (const j of jornadas) {
    const municipio = j.municipio?.nombre ?? `Jornada ${j.id}`;
    for (const d of j.documentos) {
      if (d.estado === "aprobado") continue;
      const doc = { ...d, jornada_id: j.id };
      const g = grupos.get(municipio);
      if (!g) {
        grupos.set(municipio, { municipio, pendientes: 1, mas_urgente: doc, semaforo: d.semaforo });
        continue;
      }
      g.pendientes += 1;
      g.semaforo = peor(g.semaforo, d.semaforo);
      if (d.dias_restantes < g.mas_urgente.dias_restantes) g.mas_urgente = doc;
    }
  }
  return [...grupos.values()].sort(
    (a, b) => a.mas_urgente.dias_restantes - b.mas_urgente.dias_restantes || b.pendientes - a.pendientes,
  );
}
