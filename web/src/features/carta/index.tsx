import { useParams } from "react-router";

import { apiHttp } from "./api";
import { Carta } from "./Carta";

export const ruta = { path: "/m/:jornada/carta", rol: "municipio" as const };

export default function CartaPagina() {
  const { jornada = "" } = useParams();
  return <Carta key={jornada} jornadaId={jornada} api={apiHttp} />;
}
