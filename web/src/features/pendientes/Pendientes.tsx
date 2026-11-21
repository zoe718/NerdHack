// Pendientes por municipio: cuántos requisitos faltan, cuál vence primero y su semáforo.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowSquareOutIcon,
  buttonClass,
  CheckCircleIcon,
  EmptyState,
  ErrorState,
  MapPinIcon,
  PageHeader,
  PageLayout,
  Row,
  RowList,
  Semaforo,
  Skeleton,
  Surface,
} from "../../lib/ui";
import { agruparPendientes, type GrupoMunicipio } from "./agrupar";
import type { PendientesApi } from "./api";

const plural = (n: number) => `${n} ${n === 1 ? "pendiente" : "pendientes"}`;
const vence = (n: number) =>
  n < 0 ? `venció hace ${-n} días` : n === 0 ? "vence hoy" : n === 1 ? "vence en 1 día" : `vence en ${n} días`;

export function Pendientes({ api }: { api: PendientesApi }) {
  const [grupos, setGrupos] = useState<GrupoMunicipio[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    api
      .jornadas()
      .then((js) => activo && setGrupos(agruparPendientes(js)))
      .catch((e: Error) => activo && setError(e.message));
    return () => {
      activo = false;
    };
  }, [api]);

  const total = grupos?.reduce((s, g) => s + g.pendientes, 0) ?? 0;

  return (
    <PageLayout
      recipe="list"
      header={
        <PageHeader
          title="Pendientes por municipio"
          lead="Primero el municipio cuyo requisito vence antes. Abre su expediente para revisarlo."
          meta={
            grupos ? (
              <span className="text-sm text-fg-2">
                {plural(total)} en {grupos.length} {grupos.length === 1 ? "municipio" : "municipios"}
              </span>
            ) : null
          }
        />
      }
    >
      <Surface>
        {error ? (
          <ErrorState title="No pudimos cargar los pendientes" fix={error} />
        ) : !grupos ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : grupos.length === 0 ? (
          <EmptyState icon={<CheckCircleIcon aria-hidden />} title="Ningún municipio tiene requisitos pendientes." />
        ) : (
          <RowList label="Municipios con pendientes">
            {grupos.map((g) => (
              <Row
                key={g.municipio}
                leading={<MapPinIcon aria-hidden />}
                title={g.municipio}
                meta={`${plural(g.pendientes)} · más urgente: ${g.mas_urgente.nombre}, ${vence(g.mas_urgente.dias_restantes)}`}
                trailing={
                  <span className="flex items-center gap-3">
                    <Semaforo color={g.semaforo} size="sm" />
                    <Link
                      to={`/panel/${g.mas_urgente.jornada_id}`}
                      className={buttonClass("secondary", "sm")}
                      aria-label={`Abrir expediente de ${g.municipio}`}
                    >
                      <ArrowSquareOutIcon aria-hidden />
                      Expediente
                    </Link>
                  </span>
                }
              />
            ))}
          </RowList>
        )}
      </Surface>
    </PageLayout>
  );
}
