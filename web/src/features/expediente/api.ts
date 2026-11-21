import type { ColorSemaforo, EstadoDocumento } from "../../lib/ui";

export type DocumentoExpediente = {
  id: number;
  tipo: string;
  nombre: string;
  estado: EstadoDocumento;
  comentario: string | null;
  dias_restantes: number;
  semaforo: ColorSemaforo;
};

export type ExpedienteJornada = {
  id: number;
  sede: string;
  fecha: string;
  dias_restantes: number;
  semaforo: ColorSemaforo;
  servicios: string[];
  responsables: string[];
  municipio: { nombre: string; contacto_email?: string | null } | null;
  documentos: DocumentoExpediente[];
  demo_data?: boolean;
};

export type ExpedienteApi = { jornada(id: string): Promise<ExpedienteJornada> };

async function pedir<T>(ruta: string): Promise<T> {
  const respuesta = await fetch(`/api${ruta}`);
  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
  return (await respuesta.json()) as T;
}

export const apiHttp: ExpedienteApi = {
  jornada: (id) => pedir<ExpedienteJornada>(`/jornadas/${encodeURIComponent(id)}`),
};
