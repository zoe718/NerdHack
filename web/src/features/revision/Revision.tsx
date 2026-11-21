import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";

import {
  ArrowLeftIcon,
  Button,
  buttonClass,
  CalendarBlankIcon,
  CameraIcon,
  ChatTextIcon,
  CheckCircleIcon,
  CheckIcon,
  DownloadSimpleIcon,
  EmptyState,
  EnVivo,
  ErrorState,
  EstadoChip,
  FileTextIcon,
  MapPinIcon,
  MegaphoneIcon,
  MetaItem,
  PageHeader,
  PageLayout,
  Row,
  RowList,
  SectionHeader,
  Semaforo,
  ShapesIcon,
  Skeleton,
  Stat,
  Surface,
  TextAreaField,
  UserCircleIcon,
  type Icon,
} from "../../lib/ui";
import type { Documento, Jornada, RevisionApi, Veredicto } from "./api";

const SIN_MOTIVO = "Escribe el motivo para que el municipio sepa qué corregir.";
const FECHA_HORA = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const FECHA = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const ICONOS: [RegExp, Icon][] = [
  [/foto/, CameraIcon],
  [/logo/, ShapesIcon],
  [/enlace/, UserCircleIcon],
  [/convocatoria/, MegaphoneIcon],
];

function iconoDe(tipo: string): Icon {
  return ICONOS.find(([patron]) => patron.test(tipo))?.[1] ?? FileTextIcon;
}

function conDocumento(jornada: Jornada, documento: Documento): Jornada {
  return { ...jornada, documentos: jornada.documentos.map((d) => (d.id === documento.id ? documento : d)) };
}

type RevisionProps = { jornadaId: string; api: RevisionApi };

export function Revision({ jornadaId, api }: RevisionProps) {
  const [jornada, setJornada] = useState<Jornada | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activoId, setActivoId] = useState<number | null>(null);
  const [observando, setObservando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setJornada(await api.jornada(jornadaId));
      setError(null);
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo cargar la jornada");
    }
  }, [api, jornadaId]);

  useEffect(() => {
    void cargar();
    return api.suscribir(jornadaId, () => void cargar());
  }, [api, cargar, jornadaId]);

  async function revisar(documento: Documento, estado: Veredicto, texto?: string) {
    if (!jornada) return;
    const previa = jornada;
    setEnviando(true);
    setError(null);
    setJornada(conDocumento(jornada, { ...documento, estado, comentario: texto ?? null }));
    try {
      const actualizado = await api.revisar(documento.id, estado, texto);
      setJornada((actual) => actual && conDocumento(actual, actualizado));
      setAviso(
        estado === "aprobado"
          ? `${documento.nombre} quedó aprobado.`
          : `Observación enviada. El municipio ya la ve en su pantalla.`,
      );
      setObservando(false);
      setMotivo("");
    } catch (causa) {
      setJornada(previa);
      setError(causa instanceof Error ? causa.message : "No se pudo guardar la revisión");
    } finally {
      setEnviando(false);
    }
  }

  function enviarObservacion(documento: Documento) {
    const texto = motivo.trim();
    if (!texto) {
      setErrorMotivo(SIN_MOTIVO);
      return;
    }
    setErrorMotivo(null);
    void revisar(documento, "observado", texto);
  }

  const porRevisar = jornada?.documentos.filter((d) => d.estado === "recibido") ?? [];
  const activo = porRevisar.find((d) => d.id === activoId) ?? porRevisar[0];
  const enCola = porRevisar.filter((d) => d.id !== activo?.id);
  const versiones = activo ? [...activo.versiones].sort((a, b) => b.n - a.n) : [];
  const ultima = versiones[0];
  const IconoActivo = activo ? iconoDe(activo.tipo) : FileTextIcon;

  return (
    <PageLayout
      recipe="detail"
      header={
        <PageHeader
          demo
          title="Revisión de requisitos"
          lead={jornada ? `Jornada en ${jornada.municipio.nombre}` : "Cargando la jornada"}
          meta={
            jornada ? (
              <>
                <MetaItem icon={<MapPinIcon aria-hidden />}>{jornada.sede}</MetaItem>
                <MetaItem icon={<CalendarBlankIcon aria-hidden />}>
                  {FECHA.format(new Date(`${jornada.fecha}T00:00:00Z`))}
                </MetaItem>
                <EnVivo />
              </>
            ) : null
          }
          actions={
            <Link to="/panel" className={buttonClass("ghost", "sm")}>
              <ArrowLeftIcon aria-hidden />
              Volver al panorama
            </Link>
          }
        />
      }
      aside={
        jornada ? (
          <Surface as="div">
            <Stat
              label="Para la jornada faltan"
              value={jornada.dias_restantes}
              unit={jornada.dias_restantes === 1 ? "día" : "días"}
              fuente="fecha de la jornada"
            />
            <div className="mt-3">
              <Semaforo color={jornada.semaforo} size="sm" />
            </div>
            <hr className="my-6 border-line" />
            <SectionHeader title="Requisitos de la jornada" />
            <RowList label="Requisitos de la jornada">
              {jornada.documentos.map((documento) => (
                <Row
                  key={documento.id}
                  title={documento.nombre}
                  meta={documento.estado === "observado" ? documento.comentario : null}
                  trailing={<EstadoChip estado={documento.estado} size="sm" />}
                />
              ))}
            </RowList>
          </Surface>
        ) : undefined
      }
    >
      {error ? (
        <ErrorState
          title={error}
          fix="Vuelve a intentarlo. Si sigue igual, recarga la página."
          action={
            <Button variant="secondary" size="sm" onClick={() => void cargar()}>
              Reintentar
            </Button>
          }
        />
      ) : null}
      {aviso ? (
        <p role="status" className="flex items-center gap-2 rounded-md bg-ok-soft p-4 text-base text-ok-soft-ink">
          <CheckCircleIcon aria-hidden className="shrink-0" />
          {aviso}
        </p>
      ) : null}
      <Surface>
        {!jornada ? (
          <div className="flex flex-col gap-4" aria-busy="true">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        ) : activo && ultima ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-md bg-surface-2 text-fg-2">
                  <IconoActivo size={24} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold text-fg">{activo.nombre}</h2>
                  <p className="text-sm text-fg-2">
                    Versión {ultima.n}, subida el {FECHA_HORA.format(new Date(ultima.creado_en))}
                  </p>
                </div>
              </div>
              <EstadoChip estado={activo.estado} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-md bg-surface-2 p-4">
              <p className="min-w-0 text-base font-semibold break-words text-fg">
                {ultima.archivo_nombre ?? `Archivo de la versión ${ultima.n}`}
              </p>
              <a href={api.urlArchivo(activo.id, ultima.n)} className={buttonClass("secondary", "sm")}>
                <DownloadSimpleIcon aria-hidden />
                Abrir archivo
              </a>
            </div>
            {observando ? (
              <form
                className="flex flex-col gap-4"
                onSubmit={(evento) => {
                  evento.preventDefault();
                  enviarObservacion(activo);
                }}
              >
                <TextAreaField
                  label="Motivo de la observación"
                  hint="El municipio lo verá al instante en su pantalla."
                  error={errorMotivo ?? undefined}
                  value={motivo}
                  onChange={(evento) => setMotivo(evento.target.value)}
                  autoFocus
                />
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={enviando}>
                    Enviar observación
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setObservando(false);
                      setErrorMotivo(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button icon={<CheckIcon aria-hidden />} disabled={enviando} onClick={() => void revisar(activo, "aprobado")}>
                  Aprobar
                </Button>
                <Button variant="secondary" icon={<ChatTextIcon aria-hidden />} disabled={enviando} onClick={() => setObservando(true)}>
                  Observar
                </Button>
              </div>
            )}
            <div>
              <SectionHeader title="Versiones del archivo" description="Cada subida se guarda; ninguna se sobrescribe." />
              <ol aria-label="Versiones del archivo" className="mt-2 divide-y divide-line">
                {versiones.map((v) => (
                  <li key={v.n} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                    <span className="w-8 font-semibold text-fg tabular-nums">v{v.n}</span>
                    <span className="text-fg">{FECHA_HORA.format(new Date(v.creado_en))}</span>
                    <span className="text-fg-2">sha256 {v.archivo_sha256.slice(0, 8)}</span>
                    <a href={api.urlArchivo(activo.id, v.n)} className="ml-auto font-semibold text-accent-soft-ink underline">
                      Abrir
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<CheckCircleIcon aria-hidden />}
            title="No hay archivos por revisar. Cuando el municipio suba algo, aparece aquí solo."
            action={
              <Link to="/panel" className={buttonClass("secondary", "sm")}>
                Volver al panorama
              </Link>
            }
          />
        )}
      </Surface>
      {enCola.length > 0 ? (
        <Surface>
          <SectionHeader title="También esperan revisión" />
          <RowList label="También esperan revisión">
            {enCola.map((documento) => {
              const Icono = iconoDe(documento.tipo);
              return (
                <Row
                  key={documento.id}
                  leading={<Icono aria-hidden />}
                  title={documento.nombre}
                  meta={`Versión ${documento.versiones.length}`}
                  trailing={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActivoId(documento.id);
                        setObservando(false);
                      }}
                    >
                      Revisar
                    </Button>
                  }
                />
              );
            })}
          </RowList>
        </Surface>
      ) : null}
    </PageLayout>
  );
}
