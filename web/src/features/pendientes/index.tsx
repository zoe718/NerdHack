import { apiHttp } from "./api";
import { Pendientes } from "./Pendientes";

export const ruta = { path: "/pendientes", rol: "eira" as const };
export const vista = { etiqueta: "Pendientes", orden: 20 };

export default function PendientesPagina() {
  return <Pendientes api={apiHttp} />;
}
