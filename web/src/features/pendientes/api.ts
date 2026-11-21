import type { ColorSemaforo, EstadoDocumento } from "../../lib/ui";

export type DocumentoResumen = {
  id: number;
  tipo: string;
  nombre: string;
  estado: EstadoDocumento;
  dias_restantes: number;
  semaforo: ColorSemaforo;
};

export type JornadaResumen = {
  id: number;
  sede: string;
  fecha: string;
  municipio: { nombre: string };
  documentos: DocumentoResumen[];
};

export type PendientesApi = { jornadas(): Promise<JornadaResumen[]> };

async function pedir<T>(ruta: string): Promise<T> {
  const respuesta = await fetch(`/api${ruta}`);
  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
  return (await respuesta.json()) as T;
}

export const apiHttp: PendientesApi = {
  jornadas: async () => (await pedir<{ jornadas: JornadaResumen[] }>("/jornadas")).jornadas,
};
