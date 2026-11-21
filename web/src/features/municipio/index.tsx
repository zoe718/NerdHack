// Vista del municipio: qué falta para su jornada, observaciones de Eira y subida de archivos. En vivo por SSE.
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import {
  consumirToken,
  obtenerJornada,
  subirArchivo,
  suscribir,
  type Documento,
  type Jornada,
} from "../../lib/api";
import {
  Button,
  CalendarBlankIcon,
  CameraIcon,
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
  UploadSimpleIcon,
  UserCircleIcon,
  WarningCircleIcon,
  type Icon,
} from "../../lib/ui";

const ICONOS: Record<string, Icon> = {
  carta: FileTextIcon,
  fotografias: CameraIcon,
  logotipos: ShapesIcon,
  enlace: UserCircleIcon,
  convocatoria: MegaphoneIcon,
};

const TEXTO_SEMAFORO = {
  rojo: "En rojo: la fecha está cerca y faltan requisitos",
  ambar: "En ámbar: hay requisitos sin aprobar",
  verde: "En verde: vas a tiempo",
} as const;

const fechaLarga = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

function SubirArchivo({ doc, etiqueta, alSubir }: { doc: Documento; etiqueta: string; alSubir: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        className="sr-only"
        aria-label={`Subir archivo ${doc.nombre}`}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) alSubir(f);
          e.target.value = "";
        }}
      />
      <Button variant="secondary" size="sm" icon={<UploadSimpleIcon aria-hidden />} onClick={() => ref.current?.click()}>
        {etiqueta}
      </Button>
    </>
  );
}

export default function Municipio() {
  const { jornada: param } = useParams();
  const [id, setId] = useState<number | null>(null);
  const [j, setJ] = useState<Jornada | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [vivo, setVivo] = useState<"conectado" | "reconectando">("reconectando");

  // Magic link: #t=TOKEN se canjea una vez y se borra de la URL.
  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("t");
    if (!token) return setId(Number(param));
    history.replaceState(null, "", window.location.pathname);
    consumirToken(token)
      .then(setId)
      .catch(() => setError("Tu enlace venció o ya se usó. Pide uno nuevo a tu contacto en Eira."));
  }, [param]);

  useEffect(() => {
    if (id == null) return;
    let activo = true;
    const cargar = () =>
      obtenerJornada(id)
        .then((x) => activo && setJ(x))
        .catch((e: Error) => activo && setError(e.message));
    cargar();
    const baja = suscribir(id, cargar, (ok) => {
      if (activo) setVivo(ok ? "conectado" : "reconectando");
    });
    return () => {
      activo = false;
      baja();
    };
  }, [id]);

  const subir = (doc: Documento) => (archivo: File) => {
    setAviso(null);
    subirArchivo(doc.id, archivo)
      .then((nuevo) => setJ((x) => x && { ...x, documentos: x.documentos.map((d) => (d.id === nuevo.id ? nuevo : d)) }))
      .catch((e: Error) => setAviso(`No se pudo subir ${doc.nombre}: ${e.message}`));
  };

  if (error) return <ErrorState title="No pudimos abrir tu jornada" fix={error} />;
  if (!j)
    return (
      <Surface>
        <Skeleton className="h-24 w-full" />
      </Surface>
    );

  const docs = j.documentos;
  const aprobados = docs.filter((d) => d.estado === "aprobado").length;
  const observado = docs.find((d) => d.estado === "observado");
  const municipio = j.municipio?.nombre ?? `Jornada ${j.id}`;

  return (
    <PageLayout
      recipe="detail"
      header={
        <PageHeader
          demo={Boolean(j.demo_data)}
          title={`Jornada en ${municipio}`}
          lead="Aquí ves qué falta para tu jornada y lo que Eira ya revisó."
          actions={
            <Link
              to={`/m/${j.id}/carta`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-fg-2 hover:text-fg"
            >
              <FileTextIcon aria-hidden />
              Carta compromiso
            </Link>
          }
          meta={
            <>
              <MetaItem icon={<MapPinIcon aria-hidden />}>{j.sede}</MetaItem>
              <MetaItem icon={<CalendarBlankIcon aria-hidden />}>{fechaLarga(j.fecha)}</MetaItem>
              <EnVivo estado={vivo} />
            </>
          }
        />
      }
      aside={
        <Surface as="div">
          <Stat
            label="Para tu jornada faltan"
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
          <p className="text-sm font-semibold text-fg">Tu contacto en Eira</p>
          <p className="mt-1 text-sm text-fg-2">Coordinación de jornadas. Todo lo que subes queda con versión y registro.</p>
        </Surface>
      }
    >
      <Surface>
        {observado ? (
          <div role="status" className="flex flex-wrap items-center gap-4 rounded-md bg-warn-soft p-4 text-warn-soft-ink">
            <div className="flex min-w-0 flex-1 basis-64 items-start gap-3">
              <WarningCircleIcon size={28} aria-hidden className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="font-display text-lg font-bold">Eira pidió un cambio en {observado.nombre}</p>
                {observado.comentario ? <p className="text-base">“{observado.comentario}”</p> : null}
              </div>
            </div>
            <SubirArchivo doc={observado} etiqueta="Subir nueva versión" alSubir={subir(observado)} />
          </div>
        ) : null}
        {aviso ? (
          <p role="alert" className="mt-4 text-sm font-semibold text-danger">
            {aviso}
          </p>
        ) : null}
        <div className={observado ? "mt-6" : ""}>
          <SectionHeader
            title="Requisitos de la jornada"
            description={`${aprobados} de ${docs.length} aprobados. Sube lo que falta y Eira lo revisa.`}
          />
          <RowList label="Requisitos de la jornada">
            {docs.map((d) => {
              const Icono = ICONOS[d.tipo] ?? FileTextIcon;
              return (
                <Row
                  key={d.id}
                  leading={<Icono aria-hidden />}
                  title={d.nombre}
                  meta={d.comentario && d.estado === "observado" ? `Observación: ${d.comentario}` : undefined}
                  trailing={
                    <span data-testid={`documento-${d.id}`} className="flex items-center gap-3">
                      <EstadoChip estado={d.estado} />
                      {d.estado === "pendiente" ? (
                        <SubirArchivo doc={d} etiqueta="Subir archivo" alSubir={subir(d)} />
                      ) : null}
                    </span>
                  }
                />
              );
            })}
          </RowList>
        </div>
      </Surface>
    </PageLayout>
  );
}
