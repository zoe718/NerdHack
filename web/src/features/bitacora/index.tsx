import { useParams } from "react-router";

import { apiHttp } from "./api";
import { Bitacora } from "./Bitacora";

export const ruta = { path: "/panel/:jornada/bitacora", rol: "eira" as const };

export default function BitacoraPagina() {
  const { jornada = "" } = useParams();
  return <Bitacora key={jornada} jornadaId={jornada} api={apiHttp} />;
}
