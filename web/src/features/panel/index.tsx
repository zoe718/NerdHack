// Panel de Eira: jornadas por riesgo con semáforo de días restantes. Se refresca en vivo por SSE.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { listarJornadas, suscribir, type Jornada } from "../../lib/api";
import {
  Button,
  EmptyState,
  ErrorState,
  Lamp,
  Legend,
  ORDEN_SEMAFORO,
  PageHeader,
  PageLayout,
  Row,
  RowList,
  SectionHeader,
  Skeleton,
  Stat,
  Surface,
  type ColorSemaforo,
} from "../../lib/ui";

const fechaCorta = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

function bloqueo(j: Jornada) {
  const observado = j.documentos.find((d) => d.estado === "observado");
  if (observado) return `Observado: ${observado.nombre}`;
  const pendiente = j.documentos.find((d) => d.estado === "pendiente");
  if (pendiente) return `Falta: ${pendiente.nombre}`;
  const recibido = j.documentos.find((d) => d.estado === "recibido");
  if (recibido) return `Por revisar: ${recibido.nombre}`;
  return "Sin bloqueos";
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

export default function Panel() {
  const [jornadas, setJornadas] = useState<Jornada[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navegar = useNavigate();

  useEffect(() => {
    let vivo = true;
    const cargar = () =>
      listarJornadas()
        .then((js) => vivo && setJornadas(js))
        .catch((e: Error) => vivo && setError(e.message));
    cargar();
    const ids = new Set<number>();
    const bajas: Array<() => void> = [];
    // Una suscripción por jornada cargada: cualquier evento recarga el panorama.
    listarJornadas()
      .then((js) => js.forEach((j) => !ids.has(j.id) && (ids.add(j.id), bajas.push(suscribir(j.id, cargar)))))
      .catch(() => {});
    return () => {
      vivo = false;
      bajas.forEach((b) => b());
    };
  }, []);

  const lista = [...(jornadas ?? [])].sort(
    (a, b) => ORDEN_SEMAFORO.indexOf(a.semaforo) - ORDEN_SEMAFORO.indexOf(b.semaforo) || a.dias_restantes - b.dias_restantes,
  );
  const cuenta = (c: ColorSemaforo) => lista.filter((j) => j.semaforo === c).length;
  const rojas = cuenta("rojo");
  const criticos = lista.filter((j) => j.semaforo !== "verde").reduce((s, j) => s + j.sin_aprobar, 0);
  const demo = lista.some((j) => j.demo_data);

  return (
    <PageLayout
      recipe="dashboard"
      header={
        <PageHeader
          demo={demo}
          title="Panorama de jornadas"
          lead={
            jornadas
              ? `${plural(rojas, "jornada", "jornadas")} en rojo. Qué necesita atención y qué la bloquea.`
              : "Qué jornadas necesitan atención y qué las bloquea."
          }
        />
      }
    >
      {error ? (
        <ErrorState title="No pudimos cargar las jornadas" fix={`Revisa que la API esté arriba. Detalle: ${error}`} />
      ) : !jornadas ? (
        <Surface>
          <Skeleton className="h-24 w-full" />
        </Surface>
      ) : (
        <>
          <Surface>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center">
              <div className="flex flex-wrap items-end gap-x-10 gap-y-6">
                <Stat
                  size="hero"
                  label="En rojo"
                  value={rojas}
                  unit={rojas === 1 ? "jornada" : "jornadas"}
                  leading={<Lamp color="rojo" size="lg" />}
                />
                <Stat label="En ámbar" value={cuenta("ambar")} leading={<Lamp color="ambar" />} />
                <Stat label="En verde" value={cuenta("verde")} leading={<Lamp color="verde" />} />
                <Stat label="Pendientes críticos" value={criticos} />
                <p className="basis-full text-xs text-fg-2">
                  Fuente: expedientes de las {lista.length} jornadas activas. Un pendiente crítico es un requisito sin
                  aprobar en una jornada en rojo o ámbar.
                </p>
              </div>
              <Legend />
            </div>
          </Surface>
          <Surface>
            <SectionHeader title="Jornadas por riesgo" description="Primero las que necesitan atención." />
            {lista.length === 0 ? (
              <EmptyState title="Todavía no hay jornadas activas" />
            ) : (
              <RowList label="Jornadas por riesgo">
                {lista.map((j) => (
                  <Row
                    key={j.id}
                    leading={<Lamp color={j.semaforo} size="lg" />}
                    title={j.municipio?.nombre ?? `Jornada ${j.id}`}
                    meta={`${j.sede}, ${fechaCorta(j.fecha)}`}
                    trailing={
                      <>
                        <span className="text-sm text-fg-2">{bloqueo(j)}</span>
                        <span className="text-sm font-semibold text-fg tabular-nums">
                          {j.total_documentos - j.sin_aprobar} de {j.total_documentos} aprobados
                        </span>
                        <span className="w-28 text-right text-base font-semibold text-fg tabular-nums">
                          {j.dias_restantes < 0 ? "Ya pasó" : `Faltan ${j.dias_restantes} días`}
                        </span>
                        <Button variant="secondary" size="sm" onClick={() => navegar(`/panel/${j.id}/revision`)}>
                          Abrir expediente
                        </Button>
                      </>
                    }
                  />
                ))}
              </RowList>
            )}
          </Surface>
        </>
      )}
    </PageLayout>
  );
}
