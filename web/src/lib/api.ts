// Cliente de la API de Jornada Lista. Si el backend no responde, cae a los mocks (demo_data: true).
import type { ColorSemaforo, EstadoDocumento } from "./ui/dominio";
import { JORNADAS_DEMO } from "../mocks/jornadas";

export type Version = {
  id: number;
  documento_id: number;
  n: number;
  archivo_nombre: string;
  archivo_sha256?: string;
  subido_por?: string;
  creado_en: string;
};

export type Documento = {
  id: number;
  jornada_id: number;
  tipo: string;
  nombre: string;
  obligatorio: number | boolean;
  estado: EstadoDocumento;
  comentario: string | null;
  fecha_limite: string | null;
  actualizado_en: string | null;
  versiones: Version[];
  dias_restantes: number;
  semaforo: ColorSemaforo;
};

export type Jornada = {
  id: number;
  municipio_id: number;
  sede: string;
  fecha: string;
  servicios?: string | null;
  responsables?: string | null;
  municipio: { id: number; nombre: string; contacto_email?: string | null } | null;
  documentos: Documento[];
  dias_restantes: number;
  semaforo: ColorSemaforo;
  sin_aprobar: number;
  total_documentos: number;
  demo_data?: boolean;
};

export type Evento = { tipo?: string; [k: string]: unknown };

const BASE = "/api";

async function pedir<T>(ruta: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${ruta}`, init);
  const cuerpo = await res.json().catch(() => ({}));
  if (!res.ok) throw new ErrorApi(res.status, (cuerpo as { error?: string }).error ?? `HTTP ${res.status}`);
  return cuerpo as T;
}

export class ErrorApi extends Error {
  status: number;
  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.status = status;
  }
}

const sinRed = (e: unknown) => !(e instanceof ErrorApi);

export async function listarJornadas(): Promise<Jornada[]> {
  try {
    return (await pedir<{ jornadas: Jornada[] }>("/jornadas")).jornadas;
  } catch (e) {
    if (sinRed(e)) return JORNADAS_DEMO;
    throw e;
  }
}

export async function obtenerJornada(id: number): Promise<Jornada> {
  try {
    return await pedir<Jornada>(`/jornadas/${id}`);
  } catch (e) {
    const demo = JORNADAS_DEMO.find((j) => j.id === id);
    if (sinRed(e) && demo) return demo;
    throw e;
  }
}

export async function consumirToken(token: string): Promise<number> {
  const r = await pedir<{ jornada_id: number }>("/magic/consumir", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return r.jornada_id;
}

export async function subirArchivo(documentoId: number, archivo: File): Promise<Documento> {
  const datos = new FormData();
  datos.append("archivo", archivo);
  const r = await pedir<{ documento: Documento }>(`/documentos/${documentoId}/archivo`, { method: "POST", body: datos });
  return r.documento;
}

/** Escucha el SSE de una jornada. Devuelve la función para cerrar. */
export function suscribir(jornadaId: number, alEvento: (e: Evento) => void, alEstado?: (vivo: boolean) => void) {
  if (typeof EventSource === "undefined") return () => {};
  const fuente = new EventSource(`${BASE}/jornadas/${jornadaId}/stream`);
  fuente.onopen = () => alEstado?.(true);
  fuente.onerror = () => alEstado?.(false);
  fuente.onmessage = (m) => {
    let dato: Evento;
    try {
      dato = JSON.parse(m.data) as Evento;
    } catch {
      dato = { tipo: String(m.data) };
    }
    alEvento(dato);
  };
  return () => fuente.close();
}
