import { Button } from "../Button";
import { ProtectedBlock, TextAreaField, TextField } from "../Field";
import { PageHeader, PageLayout, SectionHeader, Steps } from "../Page";
import { Surface } from "../Surface";
import { CLAUSULAS, HUELLA_CLAUSULAS, JORNADA } from "./datos";

const PASOS = ["Datos de la jornada", "Responsables", "Revisar y enviar"];

export function PantallaCarta() {
  return (
    <PageLayout
      recipe="flow"
      header={
        <>
          <PageHeader
            demo
            title="Carta compromiso"
            lead="Llena los datos de tu municipio. Las cláusulas vienen de la plantilla de Eira y no se pueden cambiar."
          />
          <Steps steps={PASOS} current={0} />
        </>
      }
      footer={
        <>
          <Button>Guardar y continuar</Button>
          <Button variant="ghost">Volver a la jornada</Button>
          <p className="basis-full text-sm text-fg-2">
            Guardar la carta no es firma ni aprobación legal. Eira la valida al final.
          </p>
        </>
      }
    >
      <Surface>
        <form className="flex flex-col gap-6" onSubmit={(event) => event.preventDefault()}>
          <SectionHeader title="Datos de la jornada" description="Paso 1 de 3" />
          <TextField label="Municipio" defaultValue={JORNADA.municipio} disabled hint="Lo define Eira al crear la jornada." />
          <TextField label="Sede" defaultValue={JORNADA.sede} />
          <TextField label="Fecha de la jornada" type="date" defaultValue={JORNADA.fechaIso} />
          <TextAreaField label="Servicios" defaultValue={JORNADA.servicios} hint="Lo que Eira ofrecerá ese día." />
          <ProtectedBlock
            title="Cláusulas fijas"
            note="Vienen de la plantilla de Eira. Si necesitas un cambio, escríbele a tu contacto."
            footer={`Huella de integridad: ${HUELLA_CLAUSULAS}. Si el texto cambia, el sistema rechaza la carta.`}
          >
            <ol className="flex list-decimal flex-col gap-2 pl-5">
              {CLAUSULAS.map((clausula) => (
                <li key={clausula}>{clausula}</li>
              ))}
            </ol>
          </ProtectedBlock>
        </form>
      </Surface>
    </PageLayout>
  );
}
