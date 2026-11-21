import { useParams } from "react-router";

import { apiHttp } from "./api";
import { Expediente } from "./Expediente";

export const ruta = { path: "/panel/:jornada", rol: "eira" as const };

export default function ExpedientePagina() {
  const { jornada = "" } = useParams();
  return <Expediente key={jornada} jornadaId={jornada} api={apiHttp} />;
}
