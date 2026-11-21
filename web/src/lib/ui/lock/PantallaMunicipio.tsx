import {
  CalendarBlankIcon,
  CameraIcon,
  FileTextIcon,
  MapPinIcon,
  MegaphoneIcon,
  ShapesIcon,
  UploadSimpleIcon,
  UserCircleIcon,
  WarningCircleIcon,
  type Icon,
} from "../icons";

import { Button } from "../Button";
import { EstadoChip } from "../Chip";
import { EnVivo } from "../Feedback";
import { MetaItem, PageHeader, PageLayout, SectionHeader } from "../Page";
import { Row, RowList } from "../Row";
import { Semaforo } from "../Semaforo";
import { Stat } from "../Stat";
import { Surface } from "../Surface";
import { JORNADA, type TipoRequisito } from "./datos";

const ICONOS: Record<TipoRequisito, Icon> = {
  carta: FileTextIcon,
  fotografias: CameraIcon,
  logotipos: ShapesIcon,
  enlace: UserCircleIcon,
  convocatoria: MegaphoneIcon,
};

export function PantallaMunicipio() {
  const { observacion, requisitos, historial } = JORNADA;
  const aprobados = requisitos.filter((requisito) => requisito.estado === "aprobado").length;
  return (
    <PageLayout
      recipe="detail"
      header={
        <PageHeader
          demo
          title={`Jornada en ${JORNADA.municipio}`}
          lead="Aquí ves qué falta para tu jornada y lo que Eira ya revisó."
          meta={
            <>
              <MetaItem icon={<MapPinIcon aria-hidden />}>{JORNADA.sede}</MetaItem>
              <MetaItem icon={<CalendarBlankIcon aria-hidden />}>{JORNADA.fecha}</MetaItem>
              <EnVivo />
            </>
          }
        />
      }
      aside={
        <Surface as="div">
          <Stat
            label="Para tu jornada faltan"
            value={JORNADA.faltanDias}
            unit="días"
            fuente={`fecha de la jornada, ${JORNADA.fecha}`}
          />
          <div className="mt-3">
            <Semaforo color={JORNADA.semaforo} size="sm">
              En ámbar: hay requisitos sin aprobar
            </Semaforo>
          </div>
          <hr className="my-6 border-line" />
          <SectionHeader title="Movimientos recientes" />
          <ol className="mt-3 flex flex-col gap-3">
            {historial.map((movimiento) => (
              <li key={movimiento.que}>
                <p className="text-sm font-semibold text-fg">{movimiento.que}</p>
                <p className="text-xs text-fg-2">{movimiento.cuando}</p>
              </li>
            ))}
          </ol>
          <hr className="my-6 border-line" />
          <p className="text-sm font-semibold text-fg">Tu contacto en Eira</p>
          <p className="mt-1 text-sm text-fg-2">
            {JORNADA.coordinadora}, coordinación. Todo lo que subes queda con versión y registro.
          </p>
        </Surface>
      }
    >
      <Surface>
        <div role="status" className="flex flex-wrap items-center gap-4 rounded-md bg-warn-soft p-4 text-warn-soft-ink">
          <div className="flex min-w-0 flex-1 basis-64 items-start gap-3">
            <WarningCircleIcon size={28} aria-hidden className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-display text-lg font-bold">Eira pidió un cambio en {observacion.requisito}</p>
              <p className="text-base">“{observacion.motivo}”</p>
              <p className="mt-1 text-sm">
                {observacion.autora}, {observacion.cuando}
              </p>
            </div>
          </div>
          <Button icon={<UploadSimpleIcon aria-hidden />}>Subir nueva versión</Button>
        </div>
        <div className="mt-6">
          <SectionHeader
            title="Requisitos de la jornada"
            description={`${aprobados} de ${requisitos.length} aprobados. Sube lo que falta y Eira lo revisa.`}
          />
          <RowList label="Requisitos de la jornada">
            {requisitos.map((requisito) => {
              const Icono = ICONOS[requisito.tipo];
              return (
                <Row
                  key={requisito.tipo}
                  leading={<Icono aria-hidden />}
                  title={requisito.titulo}
                  meta={requisito.detalle}
                  trailing={
                    <>
                      <EstadoChip estado={requisito.estado} />
                      {requisito.estado === "pendiente" ? (
                        <Button variant="secondary" size="sm">
                          Subir archivo
                        </Button>
                      ) : null}
                    </>
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
