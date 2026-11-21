import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";

import {
  ArrowLeftIcon,
  Button,
  buttonClass,
  CheckCircleIcon,
  ErrorState,
  PageHeader,
  PageLayout,
  ProtectedBlock,
  SectionHeader,
  Skeleton,
  Surface,
  TextAreaField,
  TextField,
} from "../../lib/ui";
import { ErrorApi, type CartaApi, type EventoCarta, type Plantilla } from "./api";

const CLAUSULA_PROTEGIDA = "Esta cláusula no se puede modificar";
const FECHA_HORA = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const ACTORES: Record<string, string> = { municipio: "el municipio", coordinacion: "Eira" };

type Formulario = { municipio: string; sede: string; fecha: string; servicios: string; enlace: string };

function lista(texto: string): string[] {
  return texto
    .split(",")
    .map((parte) => parte.trim())
    .filter(Boolean);
}

type CartaProps = { jornadaId: string; api: CartaApi };

export function Carta({ jornadaId, api }: CartaProps) {
  const [plantilla, setPlantilla] = useState<Plantilla | null>(null);
  const [form, setForm] = useState<Formulario | null>(null);
  const [historial, setHistorial] = useState<EventoCarta[]>([]);
  const [error, setError] = useState<{ titulo: string; arreglo: string } | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [recibida, eventos] = await Promise.all([api.plantilla(jornadaId), api.historial(jornadaId)]);
      setPlantilla(recibida);
      setHistorial(eventos);
      setForm({
        municipio: recibida.campos.municipio,
        sede: recibida.campos.sede,
        fecha: recibida.campos.fecha,
        servicios: recibida.campos.servicios.join(", "),
        enlace: recibida.campos.responsables.join(", "),
      });
      setError(null);
    } catch (causa) {
      setError({
        titulo: causa instanceof Error ? causa.message : "No se pudo cargar la carta",
        arreglo: "Vuelve a intentarlo. Si sigue igual, recarga la página.",
      });
    }
  }, [api, jornadaId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function guardar(evento: FormEvent) {
    evento.preventDefault();
    if (!plantilla || !form) return;
    setGuardando(true);
    setAviso(null);
    try {
      await api.guardar(
        jornadaId,
        { municipio: form.municipio, sede: form.sede, fecha: form.fecha, servicios: lista(form.servicios), responsables: lista(form.enlace) },
        plantilla.clausulas,
      );
      const eventos = await api.historial(jornadaId);
      setHistorial(eventos);
      setAviso(`Carta guardada como versión ${eventos.length}. Eira ya puede revisarla.`);
      setError(null);
    } catch (causa) {
      setError(
        causa instanceof ErrorApi && causa.status === 422
          ? { titulo: CLAUSULA_PROTEGIDA, arreglo: "Las cláusulas fijas vienen de la plantilla de Eira. Recarga la página para recuperar el texto original." }
          : {
              titulo: causa instanceof Error ? causa.message : "No se pudo guardar la carta",
              arreglo: "Revisa los datos y vuelve a intentarlo.",
            },
      );
    } finally {
      setGuardando(false);
    }
  }

  const campo = (clave: keyof Formulario) => ({
    value: form?.[clave] ?? "",
    onChange: (evento: { target: { value: string } }) => setForm((actual) => actual && { ...actual, [clave]: evento.target.value }),
  });

  return (
    <PageLayout
      recipe="flow"
      header={
        <PageHeader
          demo
          title="Carta compromiso"
          lead="Llena los datos de tu municipio. Las cláusulas vienen de la plantilla de Eira y no se pueden cambiar."
          actions={
            <Link to={`/m/${jornadaId}`} className={buttonClass("ghost", "sm")}>
              <ArrowLeftIcon aria-hidden />
              Volver a la jornada
            </Link>
          }
        />
      }
      footer={
        <>
          <Button type="submit" form="carta" disabled={!form || guardando}>
            Guardar carta
          </Button>
          <p className="min-w-0 flex-1 basis-64 text-sm text-fg-2">
            Guardar la carta no es firma ni aprobación legal. Eira la valida al final.
          </p>
        </>
      }
    >
      {error ? <ErrorState title={error.titulo} fix={error.arreglo} /> : null}
      {aviso ? (
        <p role="status" className="flex items-center gap-2 rounded-md bg-ok-soft p-4 text-base text-ok-soft-ink">
          <CheckCircleIcon aria-hidden className="shrink-0" />
          {aviso}
        </p>
      ) : null}
      <Surface>
        {plantilla && form ? (
          <form id="carta" className="flex flex-col gap-6" onSubmit={(evento) => void guardar(evento)}>
            <SectionHeader title="Datos de la jornada" description="Estos campos sí cambian en cada carta." />
            <TextField label="Municipio" required {...campo("municipio")} />
            <TextField label="Sede" required {...campo("sede")} />
            <TextField label="Fecha de la jornada" type="date" required {...campo("fecha")} />
            <TextAreaField label="Servicios" hint="Separa cada servicio con una coma." {...campo("servicios")} />
            <TextField label="Persona enlace" hint="Quien da seguimiento por parte del municipio." {...campo("enlace")} />
            <ProtectedBlock
              title="Cláusulas fijas"
              note="Son iguales en todas las cartas. Si necesitas un cambio, escríbele a tu contacto en Eira."
              footer={`Huella de integridad: ${plantilla.clausulas_hash.slice(0, 8)}. Si el texto cambia, el sistema rechaza la carta.`}
            >
              <ol className="flex list-decimal flex-col gap-2 pl-5">
                {plantilla.clausulas.map((clausula) => (
                  <li key={clausula}>{clausula}</li>
                ))}
              </ol>
            </ProtectedBlock>
          </form>
        ) : error ? null : (
          <div className="flex flex-col gap-4" aria-busy="true">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
      </Surface>
      <Surface>
        <SectionHeader title="Historial de la carta" description="Cada guardado queda como una versión con quién y cuándo." />
        {historial.length > 0 ? (
          <ol aria-label="Historial de la carta" className="mt-2 divide-y divide-line">
            {historial
              .map((evento, indice) => ({ evento, numero: indice + 1 }))
              .reverse()
              .map(({ evento, numero }) => (
                <li key={evento.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
                  <span className="text-base font-semibold text-fg">Versión {numero}</span>
                  <span className="text-sm text-fg-2">
                    Guardada por {ACTORES[evento.actor] ?? evento.actor} el {FECHA_HORA.format(new Date(evento.creado_en))}
                  </span>
                </li>
              ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-fg-2">Todavía no hay versiones guardadas. La primera aparece aquí al guardar.</p>
        )}
      </Surface>
    </PageLayout>
  );
}
