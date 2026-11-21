// Bitácora de una jornada: quién hizo qué y cuándo, lo más reciente arriba.
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  ArrowLeftIcon,
  BellIcon,
  CalendarCheckIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  EmptyState,
  ErrorState,
  EyeIcon,
  FileTextIcon,
  LockKeyIcon,
  PageHeader,
  PageLayout,
  Row,
  RowList,
  ShieldCheckIcon,
  Skeleton,
  Surface,
  TrayArrowDownIcon,
} from "../../lib/ui";
import type { BitacoraApi, EventoBitacora } from "./api";
import { ordenarRecientes } from "./ordenar";

const ACTORES: Record<string, string> = {
  eira: "Eira",
  coordinacion: "Eira",
  municipio: "Municipio",
  sistema: "Sistema",
  seed_demo: "Carga de ejemplo",
};

const TIPOS: Record<string, string> = {
  carta: "Carta compromiso",
  fotografias: "Fotografías",
  logotipos: "Logotipos",
  enlace: "Persona enlace",
  convocatoria: "Convocatoria",
};

const VERBO_ESTADO: Record<string, string> = {
  aprobado: "aprobó",
  observado: "observó",
  pendiente: "regresó a pendiente",
  en_revision: "puso en revisión",
};

const MOTIVOS: Record<string, string> = {
  clausula_protegida_alterada: "Se intentó cambiar una cláusula protegida.",
};

const texto = (v: unknown) => (typeof v === "string" ? v : undefined);
const tipo = (d: EventoBitacora["detalle"]) => TIPOS[texto(d?.tipo) ?? ""] ?? texto(d?.tipo) ?? "un requisito";

function describir(e: EventoBitacora): { accion: string; icono: ReactNode; detalle?: string } {
  const d = e.detalle;
  switch (e.accion) {
    case "jornada_creada":
      return {
        accion: "creó la jornada",
        icono: <CalendarCheckIcon aria-hidden />,
        detalle: typeof d?.requisitos === "number" ? `${d.requisitos} requisitos por reunir.` : undefined,
      };
    case "version_subida":
      return { accion: `subió la versión ${String(d?.n ?? "")} de ${tipo(d)}`.replace("  ", " "), icono: <TrayArrowDownIcon aria-hidden /> };
    case "recordatorio_enviado":
      return { accion: `envió un recordatorio de ${tipo(d)}`, icono: <BellIcon aria-hidden /> };
    case "carta_generada":
      return { accion: "generó la carta compromiso", icono: <FileTextIcon aria-hidden /> };
    case "carta_rechazada":
      return {
        accion: "intentó generar la carta y se rechazó",
        icono: <ShieldCheckIcon aria-hidden />,
        detalle: MOTIVOS[texto(d?.motivo) ?? ""] ?? texto(d?.motivo),
      };
    case "magic_link_emitido":
      return { accion: "emitió un enlace de acceso para el municipio", icono: <LockKeyIcon aria-hidden /> };
    case "magic_link_usado":
      return { accion: "entró con su enlace de acceso", icono: <LockKeyIcon aria-hidden /> };
  }
  if (e.accion.startsWith("documento_")) {
    const estado = e.accion.slice("documento_".length);
    return {
      accion: `${VERBO_ESTADO[estado] ?? `marcó como ${estado.replace("_", " ")}`} ${tipo(d)}`,
      icono: estado === "aprobado" ? <CheckCircleIcon aria-hidden /> : <EyeIcon aria-hidden />,
      detalle: texto(d?.motivo),
    };
  }
  return { accion: e.accion.replace(/_/g, " "), icono: <ClockCounterClockwiseIcon aria-hidden /> };
}

const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function Bitacora({ jornadaId, api }: { jornadaId: string; api: BitacoraApi }) {
  const [eventos, setEventos] = useState<EventoBitacora[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    api
      .eventos(jornadaId)
      .then((x) => activo && setEventos(ordenarRecientes(x)))
      .catch((e: Error) => activo && setError(e.message));
    return () => {
      activo = false;
    };
  }, [api, jornadaId]);

  return (
    <PageLayout
      recipe="list"
      header={
        <PageHeader
          title="Bitácora de la jornada"
          lead="Cada cambio con quién lo hizo y cuándo, lo más reciente primero."
          actions={
            <Link
              to={`/panel/${encodeURIComponent(jornadaId)}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-fg-2 hover:text-fg"
            >
              <ArrowLeftIcon aria-hidden />
              Expediente
            </Link>
          }
        />
      }
    >
      {error ? (
        <ErrorState title="No pudimos cargar la bitácora" fix={error} />
      ) : !eventos ? (
        <Surface>
          <Skeleton className="h-24 w-full" />
        </Surface>
      ) : eventos.length === 0 ? (
        <EmptyState icon={<ClockCounterClockwiseIcon aria-hidden />} title="Todavía no hay cambios en esta jornada." />
      ) : (
        <Surface>
          <RowList label="Cambios de la jornada">
            {eventos.map((e) => {
              const { accion, icono, detalle } = describir(e);
              return (
                <Row
                  key={e.id}
                  leading={icono}
                  title={
                    <>
                      {ACTORES[e.actor] ?? e.actor} <span className="font-normal">{accion}</span>
                    </>
                  }
                  meta={detalle}
                  trailing={
                    <time dateTime={e.creado_en} className="text-sm text-fg-2 tabular-nums">
                      {fechaHora(e.creado_en)}
                    </time>
                  }
                />
              );
            })}
          </RowList>
        </Surface>
      )}
    </PageLayout>
  );
}
