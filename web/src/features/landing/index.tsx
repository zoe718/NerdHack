import { Link } from "react-router";

import { BrandMark, buttonClass, Lamp, Stat } from "../../lib/ui";
import pasoMunicipio from "./img/paso-municipio.png";
import pasoPanel from "./img/paso-panel.png";
import pasoRevision from "./img/paso-revision.png";
import wowMovil from "./img/wow-movil.png";
import wow from "./img/wow.png";

const REPO = "https://github.com/zoe718/NerdHack";

const PASOS = [
  {
    titulo: "El municipio sube lo que le toca",
    texto: "Entra con un enlace de un solo uso, sin contraseña ni cuenta nueva. Ve su lista de requisitos y sube cada archivo.",
    imagen: pasoMunicipio,
    alt: "Vista del municipio: lista de requisitos de la jornada con el estado de cada uno y el botón para subir archivo.",
  },
  {
    titulo: "Eira aprueba o pide un cambio",
    texto: "Cada archivo llega con su versión y su huella. Para observar hay que escribir el motivo, y el municipio lo ve al instante.",
    imagen: pasoRevision,
    alt: "Pantalla de revisión de Eira: el archivo recibido con los botones Aprobar y Observar y la lista de versiones.",
  },
  {
    titulo: "El semáforo dice qué jornada atender",
    texto: "Rojo si faltan 7 días o menos sin aprobar, ámbar si faltan 14. El panorama ordena las jornadas por riesgo.",
    imagen: pasoPanel,
    alt: "Panorama de jornadas: conteo en rojo, ámbar y verde y la lista de jornadas ordenada por riesgo.",
  },
];

const CUIDADOS = [
  "No guarda datos clínicos: solo documentos de coordinación entre Eira y el municipio.",
  "El municipio entra con un enlace de un solo uso que vence en 15 minutos. El segundo intento falla.",
  "Cada archivo queda con versión y huella sha256. Una versión nueva nunca borra la anterior.",
  "Las cláusulas de la carta están protegidas: si alguien las altera, el servidor rechaza la carta.",
  "Una bitácora registra quién hizo qué y cuándo.",
];

const PERSONAS = [
  { quien: "Coordinadora de Eira", necesita: "Saber qué falta, quién lo debe y qué bloquea cada jornada." },
  { quien: "Enlace municipal", necesita: "Entrar fácil, sin cuenta nueva, y saber qué le falta por entregar." },
  { quien: "Dirección de Eira", necesita: "Ver de un vistazo los pendientes críticos por municipio." },
];

const REAL = [
  "Expediente por jornada con su lista de requisitos",
  "Estados pendiente, recibido, observado y aprobado, con motivo",
  "Carta desde plantilla con cláusulas protegidas",
  "Versiones con sha256 y bitácora",
  "Enlace de un solo uso y pantallas que se actualizan en vivo",
  "Semáforo y panorama de pendientes",
];

const SIMULADO = [
  "Envío de correo: el enlace y los recordatorios no salen por correo, quedan en la bitácora",
  "Paso del tiempo: un reloj de demo adelanta los días",
  "Firma de la carta: guardar no es firmar ni aprobar",
  "Sesiones y roles: el enlace de un solo uso funciona, pero la demo todavía no exige sesión para abrir una pantalla",
];

export default function Landing() {
  return (
    <div className="bg-bg text-fg">
      <section className="bg-shell text-shell-ink [&_:focus-visible]:outline-shell-ink">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 pt-5 sm:px-6">
          <header className="flex items-center justify-between gap-4">
            <BrandMark />
            <a href={REPO} className="text-sm font-semibold text-shell-ink-2 underline hover:text-shell-ink">
              Código en GitHub
            </a>
          </header>
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <div className="min-w-0 flex-1 basis-96">
              <h1 className="font-display text-xl font-bold sm:text-hero">Cada jornada, lista a tiempo.</h1>
              <p className="mt-4 max-w-[52ch] text-base text-shell-ink-2 sm:text-lg">
                Un expediente por jornada. El municipio sube sus documentos sin contraseña y Eira ve en un semáforo qué
                falta y qué bloquea.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/panel" className={buttonClass("primary")}>
                Ver el panel de Eira
              </Link>
              <Link to="/m/1" className={buttonClass("secondary")}>
                Ver la vista del municipio
              </Link>
            </div>
          </div>
          <picture>
            <source media="(min-width: 640px)" srcSet={wow} width={1920} height={1020} />
            <img
              src={wowMovil}
              width={780}
              height={1240}
              alt="Pantallas reales de la demo. Eira envió una observación y el municipio ve el aviso Eira pidió un cambio en Fotografías del espacio, con el motivo Falta foto de la sede."
              className="block h-auto w-full rounded-t-lg"
            />
          </picture>
        </div>
      </section>
      <p className="mx-auto w-full max-w-[1200px] px-4 pt-3 text-sm text-fg-2 sm:px-6">
        Captura real de la demo, con datos de ejemplo: Eira pide un cambio y el municipio lo ve en su pantalla sin
        recargar la página.
      </p>

      <section className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Stat
          size="hero"
          label="Personas beneficiadas por Eira"
          value="Más de 51,000"
          fuente="guía oficial del Vibeathon. Es un acumulado a septiembre de 2026, no pacientes únicos."
        />
        <p className="max-w-[60ch] text-lg text-fg">
          Detrás de cada jornada hay una carta compromiso, fotografías y logotipos que el municipio tiene que entregar a
          tiempo. Hoy eso se coordina en hojas de cálculo, y el mayor problema son los retrasos.
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4 pb-16 sm:px-6">
        <h2 className="font-display text-xl font-bold text-fg">Cómo funciona</h2>
        <ol className="mt-8 flex flex-col gap-12">
          {PASOS.map((paso, indice) => (
            <li key={paso.titulo} className="grid gap-6 lg:grid-cols-12 lg:items-center">
              <div className={`lg:col-span-4 ${indice % 2 === 1 ? "lg:order-2" : ""}`}>
                <p className="font-display text-xl font-bold text-accent-soft-ink tabular-nums">{indice + 1}</p>
                <h3 className="mt-1 font-display text-lg font-bold text-fg">{paso.titulo}</h3>
                <p className="mt-2 text-base text-fg-2">{paso.texto}</p>
              </div>
              <img
                src={paso.imagen}
                width={1280}
                height={720}
                loading="lazy"
                alt={paso.alt}
                className="block h-auto w-full rounded-lg border border-line lg:col-span-8"
              />
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-bold text-fg">Cómo cuidamos los datos</h2>
            <ul className="mt-6 flex flex-col gap-4">
              {CUIDADOS.map((cuidado) => (
                <li key={cuidado} className="flex items-start gap-3 text-base text-fg">
                  <span className="mt-1.5 flex">
                    <Lamp color="verde" size="sm" />
                  </span>
                  {cuidado}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-fg">Para quién es</h2>
            <dl className="mt-6 flex flex-col gap-5">
              {PERSONAS.map((persona) => (
                <div key={persona.quien}>
                  <dt className="text-base font-semibold text-fg">{persona.quien}</dt>
                  <dd className="text-base text-fg-2">{persona.necesita}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6">
        <h2 className="font-display text-xl font-bold text-fg">Qué es real y qué está simulado</h2>
        <p className="mt-2 max-w-[65ch] text-base text-fg-2">
          Es un prototipo de hackathon con datos ficticios. Esto es lo que ya funciona y lo que todavía no.
        </p>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-lg font-bold text-fg">Funciona en la demo</h3>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-base text-fg">
              {REAL.map((linea) => (
                <li key={linea}>{linea}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-fg">Simulado</h3>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-base text-fg">
              {SIMULADO.map((linea) => (
                <li key={linea}>{linea}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Link to="/panel" className={buttonClass("primary")}>
            Ver el panel de Eira
          </Link>
          <a href={REPO} className={buttonClass("secondary")}>
            Ver el código
          </a>
        </div>
      </section>

      <footer className="border-t border-line">
        <p className="mx-auto w-full max-w-[1200px] px-4 py-6 text-sm text-fg-2 sm:px-6">
          Jornada Lista, equipo NerdHack. Eira y Nerdearla Vibeathon México 2026, Reto 2. Municipios, sedes y personas
          de la demo son ficticios.
        </p>
      </footer>
    </div>
  );
}
