import type { ColorSemaforo, EstadoDocumento } from "../../lib/ui";

export type Version = {
  id: number;
  documento_id: number;
  n: number;
  archivo_nombre: string | null;
  archivo_sha256: string;
  subido_por: string;
  creado_en: string;
};

export type Documento = {
  id: number;
  tipo: string;
  nombre: string;
  estado: EstadoDocumento;
  comentario: string | null;
  versiones: Version[];
};

export type Jornada = {
  id: number;
  sede: string;
  fecha: string;
  municipio: { nombre: string };
  dias_restantes: number;
  semaforo: ColorSemaforo;
  documentos: Documento[];
};

export type Veredicto = "aprobado" | "observado";

export type RevisionApi = {
  jornada(id: string): Promise<Jornada>;
  revisar(documentoId: number, estado: Veredicto, motivo?: string): Promise<Documento>;
  suscribir(id: string, alCambiar: () => void): () => void;
  urlArchivo(documentoId: number, n: number): string;
};

async function pedir<T>(ruta: string, init?: RequestInit): Promise<T> {
  const respuesta = await fetch(`/api${ruta}`, { headers: { "Content-Type": "application/json" }, ...init });
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { error?: string } | null;
    throw new Error(cuerpo?.error ?? `El servidor respondió ${respuesta.status}`);
  }
  return (await respuesta.json()) as T;
}

export const apiHttp: RevisionApi = {
  jornada: (id) => pedir<Jornada>(`/jornadas/${id}`),
  revisar: async (documentoId, estado, motivo) => {
    const { documento } = await pedir<{ documento: Documento }>(`/documentos/${documentoId}/revision`, {
      method: "POST",
      body: JSON.stringify({ estado, motivo }),
    });
    return documento;
  },
  suscribir: (id, alCambiar) => {
    if (typeof EventSource === "undefined") return () => {};
    const fuente = new EventSource(`/api/jornadas/${id}/stream`);
    fuente.onmessage = alCambiar;
    return () => fuente.close();
  },
  urlArchivo: (documentoId, n) => `/api/documentos/${documentoId}/versiones/${n}/archivo`,
};
