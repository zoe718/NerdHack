import { CalendarCheckIcon, IconContext, LockKeyIcon } from "./icons";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";

export type Vista = { to: string; etiqueta: string };
export type Persona = { nombre: string; detalle: string };

const ICONOS = { size: 20, weight: "regular" } as const;
const VISTAS_EIRA: Vista[] = [{ to: "/panel", etiqueta: "Panorama" }];

export function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-md bg-accent text-accent-ink">
        <CalendarCheckIcon size={22} weight="fill" aria-hidden />
      </span>
      <span className="font-display text-lg leading-none font-bold text-fg">Jornada Lista</span>
    </span>
  );
}

type NavBarProps = { vistas?: Vista[]; inicio?: string; children?: ReactNode };

export function NavBar({ vistas = [], inicio = "/", children }: NavBarProps) {
  const pill = ({ isActive }: { isActive: boolean }) =>
    `inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-150 ${
      isActive ? "bg-surface text-fg shadow-raise" : "text-fg-2 hover:text-fg"
    }`;
  const tab = ({ isActive }: { isActive: boolean }) =>
    `flex h-11 flex-1 items-center justify-center text-sm font-semibold ${isActive ? "text-fg" : "text-fg-2"}`;
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface shadow-raise">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-4 px-4 sm:px-6">
        <Link to={inicio} aria-label="Jornada Lista, ir al inicio" className="rounded-md">
          <BrandMark />
        </Link>
        {vistas.length > 0 ? (
          <nav aria-label="Vistas" className="hidden items-center gap-1 rounded-full bg-surface-2 p-1 sm:flex">
            {vistas.map((vista) => (
              <NavLink key={vista.to} to={vista.to} className={pill}>
                {vista.etiqueta}
              </NavLink>
            ))}
          </nav>
        ) : null}
        <div className="ml-auto flex min-w-0 items-center gap-3">{children}</div>
      </div>
      {vistas.length > 1 ? (
        <nav aria-label="Vistas" className="flex border-t border-line sm:hidden">
          {vistas.map((vista) => (
            <NavLink key={vista.to} to={vista.to} className={tab}>
              {vista.etiqueta}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

type AppShellProps = {
  rol: "eira" | "municipio";
  persona?: Persona;
  vistas?: Vista[];
  children: ReactNode;
};

export function AppShell({ rol, persona, vistas, children }: AppShellProps) {
  const eira = rol === "eira";
  return (
    <IconContext.Provider value={ICONOS}>
      <div className="flex min-h-dvh flex-col bg-bg text-fg">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-20 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:font-semibold"
        >
          Saltar al contenido
        </a>
        <NavBar vistas={vistas ?? (eira ? VISTAS_EIRA : [])} inicio={eira ? "/panel" : "."}>
          {eira && persona ? (
            <span className="flex items-center gap-3">
              <span className="hidden text-right leading-tight sm:block">
                <span className="block text-sm font-semibold text-fg">{persona.nombre}</span>
                <span className="block text-xs text-fg-2">{persona.detalle}</span>
              </span>
              <span aria-hidden className="grid size-9 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-fg">
                {iniciales(persona.nombre)}
              </span>
            </span>
          ) : null}
          {eira ? null : (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-fg-2">
              <LockKeyIcon aria-hidden />
              <span className="hidden sm:inline">Acceso con enlace de un solo uso</span>
              <span className="sm:hidden">Acceso seguro</span>
            </span>
          )}
        </NavBar>
        <main id="contenido" className="flex-1">
          {children}
        </main>
      </div>
    </IconContext.Provider>
  );
}
