import { useParams } from "react-router";

import { apiHttp } from "./api";
import { Revision } from "./Revision";

export const ruta = { path: "/panel/:jornada/revision", rol: "eira" as const };

export default function RevisionPagina() {
  const { jornada = "" } = useParams();
  return <Revision key={jornada} jornadaId={jornada} api={apiHttp} />;
}
