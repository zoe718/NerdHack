// Expediente completo de una jornada: servicios, responsables, contacto y requisitos con su estado.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  EnvelopeSimpleIcon,
  ErrorState,
  EstadoChip,
  FileTextIcon,
  MapPinIcon,
  MetaItem,
  PageHeader,
  PageLayout,
  Row,
  RowList,
  SectionHeader,
  Semaforo,
  Skeleton,
  Stat,
  Surface,
} from "../../lib/ui";
import type { ExpedienteApi, ExpedienteJornada } from "./api";

const TEXTO_SEMAFORO = {
  rojo: "En rojo: la fecha está cerca y faltan requisitos",
  ambar: "En ámbar: hay requisitos sin aprobar",
  verde: "En verde: va a tiempo",
} as const;

const fechaLarga = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

function Lista({ label, items, vacio }: { label: string; items: string[]; vacio: string }) {
  if (items.length === 0) return <p className="text-sm text-fg-2">{vacio}</p>;
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((x) => (
        <li key={x} className="rounded-md bg-surface-2 px-3 py-1 text-sm text-fg">
          {x}
        </li>
      ))}
    </ul>
  );
}

export function Expediente({ jornadaId, api }: { jornadaId: string; api: ExpedienteApi }) {
  const [j, setJ] = useState<ExpedienteJornada | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    api
      .jornada(jornadaId)
      .then((x) => activo && setJ(x))
      .catch((e: Error) => activo && setError(e.message));
    return () => {
      activo = false;
    };
  }, [api, jornadaId]);

  if (error) return <ErrorState title="No pudimos abrir el expediente" fix={error} />;
  if (!j)
    return (
      <Surface>
        <Skeleton className="h-24 w-full" />
      </Surface>
    );

  const municipio = j.municipio?.nombre ?? `Jornada ${j.id}`;
  const aprobados = j.documentos.filter((d) => d.estado === "aprobado").length;

  return (
    <PageLayout
      recipe="detail"
      header={
        <PageHeader
          demo={Boolean(j.demo_data)}
          title={`Jornada en ${municipio}`}
          lead="Expediente completo: servicios, responsables y el estado de cada requisito."
          meta={
            <>
              <MetaItem icon={<MapPinIcon aria-hidden />}>{j.sede}</MetaItem>
              <MetaItem icon={<CalendarBlankIcon aria-hidden />}>{fechaLarga(j.fecha)}</MetaItem>
            </>
          }
          actions={
            <Link to="/pendientes" className="inline-flex items-center gap-2 text-sm font-semibold text-fg-2 hover:text-fg">
              <ArrowLeftIcon aria-hidden />
              Pendientes
            </Link>
          }
        />
      }
      aside={
        <Surface as="div">
          <Stat
            label="Para la jornada faltan"
            value={Math.max(0, j.dias_restantes)}
            unit="días"
            fuente={`fecha de la jornada, ${fechaLarga(j.fecha)}`}
          />
          <div className="mt-3">
            <Semaforo color={j.semaforo} size="sm">
              {TEXTO_SEMAFORO[j.semaforo]}
            </Semaforo>
          </div>
          <hr className="my-6 border-line" />
          <p className="text-sm font-semibold text-fg">Contacto del municipio</p>
          {j.municipio?.contacto_email ? (
            <a
              href={`mailto:${j.municipio.contacto_email}`}
              className="mt-1 inline-flex items-center gap-2 text-sm text-fg-2 hover:text-fg"
            >
              <EnvelopeSimpleIcon aria-hidden />
              {j.municipio.contacto_email}
            </a>
          ) : (
            <p className="mt-1 text-sm text-fg-2">Sin correo registrado.</p>
          )}
        </Surface>
      }
    >
      <Surface>
        <SectionHeader title="Servicios" />
        <Lista label="Servicios" items={j.servicios} vacio="Sin servicios registrados." />
        <div className="mt-6">
          <SectionHeader title="Responsables y persona enlace" />
          <Lista label="Responsables" items={j.responsables} vacio="Aún no hay responsables." />
        </div>
      </Surface>
      <Surface className="mt-6">
        <SectionHeader title="Requisitos de la jornada" description={`${aprobados} de ${j.documentos.length} aprobados.`} />
        <RowList label="Requisitos de la jornada">
          {j.documentos.map((d) => (
            <Row
              key={d.id}
              leading={<FileTextIcon aria-hidden />}
              title={d.nombre}
              meta={d.comentario ? `Observación: ${d.comentario}` : undefined}
              trailing={<EstadoChip estado={d.estado} />}
            />
          ))}
        </RowList>
      </Surface>
    </PageLayout>
  );
}
