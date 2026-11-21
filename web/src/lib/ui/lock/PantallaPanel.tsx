import { PlusIcon } from "../icons";

import { Button } from "../Button";
import type { ColorSemaforo } from "../dominio";
import { PageHeader, PageLayout, SectionHeader } from "../Page";
import { Row, RowList } from "../Row";
import { Lamp, Legend } from "../Semaforo";
import { Stat } from "../Stat";
import { Surface } from "../Surface";
import { JORNADAS } from "./datos";

export function PantallaPanel() {
  const cuenta = (color: ColorSemaforo) => JORNADAS.filter((jornada) => jornada.semaforo === color).length;
  const criticos = JORNADAS.filter((jornada) => jornada.semaforo !== "verde").reduce(
    (suma, jornada) => suma + jornada.total - jornada.aprobados,
    0,
  );
  const rojas = cuenta("rojo");
  return (
    <PageLayout
      recipe="dashboard"
      header={
        <PageHeader
          demo
          title="Panorama de jornadas"
          lead="Qué jornadas necesitan atención y qué las bloquea."
          actions={<Button icon={<PlusIcon aria-hidden />}>Crear jornada</Button>}
        />
      }
    >
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
              Fuente: expedientes de las {JORNADAS.length} jornadas activas. Un pendiente crítico es un requisito sin
              aprobar en una jornada en rojo o ámbar.
            </p>
          </div>
          <Legend />
        </div>
      </Surface>
      <Surface>
        <SectionHeader title="Jornadas por riesgo" description="Primero las que necesitan atención." />
        <RowList label="Jornadas por riesgo">
          {JORNADAS.map((jornada) => (
            <Row
              key={jornada.id}
              leading={<Lamp color={jornada.semaforo} size="lg" />}
              title={jornada.municipio}
              meta={`${jornada.sede}, ${jornada.fecha}`}
              trailing={
                <>
                  <span className="text-sm text-fg-2">{jornada.bloqueo}</span>
                  <span className="text-sm font-semibold text-fg tabular-nums">
                    {jornada.aprobados} de {jornada.total} aprobados
                  </span>
                  <span className="w-28 text-right text-base font-semibold text-fg tabular-nums">
                    Faltan {jornada.faltanDias} días
                  </span>
                  <Button variant="secondary" size="sm">
                    Abrir expediente
                  </Button>
                </>
              }
            />
          ))}
        </RowList>
      </Surface>
    </PageLayout>
  );
}
