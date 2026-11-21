export type EventoBitacora = {
  id: number;
  jornada_id: number | null;
  actor: string;
  accion: string;
  detalle: Record<string, unknown> | null;
  creado_en: string;
};

export type BitacoraApi = { eventos(jornadaId: string): Promise<EventoBitacora[]> };

export const apiHttp: BitacoraApi = {
  eventos: async (id) => {
    const respuesta = await fetch(`/api/jornadas/${encodeURIComponent(id)}/auditoria`);
    if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
    const cuerpo = (await respuesta.json()) as { eventos: EventoBitacora[] };
    return cuerpo.eventos;
  },
};
