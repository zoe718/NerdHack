export type Campos = {
  municipio: string;
  sede: string;
  fecha: string;
  servicios: string[];
  responsables: string[];
};

export type Plantilla = { campos: Campos; clausulas: string[]; clausulas_hash: string };
export type CartaGuardada = { id: number; generada_en: string };
export type EventoCarta = { id: number; actor: string; accion: string; creado_en: string };

export class ErrorApi extends Error {
  status: number;

  constructor(mensaje: string, status: number) {
    super(mensaje);
    this.status = status;
  }
}

export type CartaApi = {
  plantilla(jornadaId: string): Promise<Plantilla>;
  guardar(jornadaId: string, campos: Campos, clausulas: string[]): Promise<CartaGuardada>;
  historial(jornadaId: string): Promise<EventoCarta[]>;
};

async function pedir<T>(ruta: string, init?: RequestInit): Promise<T> {
  const respuesta = await fetch(`/api${ruta}`, { headers: { "Content-Type": "application/json" }, ...init });
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { error?: string } | null;
    throw new ErrorApi(cuerpo?.error ?? `El servidor respondió ${respuesta.status}`, respuesta.status);
  }
  return (await respuesta.json()) as T;
}

export const apiHttp: CartaApi = {
  plantilla: (jornadaId) => pedir<Plantilla>(`/jornadas/${jornadaId}/carta`),
  guardar: async (jornadaId, campos, clausulas) => {
    const { carta } = await pedir<{ carta: CartaGuardada }>(`/jornadas/${jornadaId}/carta`, {
      method: "POST",
      body: JSON.stringify({ campos, clausulas }),
    });
    return carta;
  },
  historial: async (jornadaId) => {
    const { eventos } = await pedir<{ eventos: EventoCarta[] }>(`/jornadas/${jornadaId}/auditoria`);
    return eventos.filter((evento) => evento.accion === "carta_generada");
  },
};
