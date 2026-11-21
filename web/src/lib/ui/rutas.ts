import type { ComponentType } from "react";

import type { Vista } from "./AppShell";

export type RolRuta = "eira" | "municipio" | "publico";

export type FeatureModule = {
  default: ComponentType;
  ruta?: { path: string; rol: RolRuta };
  vista?: { etiqueta: string; orden?: number };
};

export type RutaFeature = {
  nombre: string;
  path: string;
  rol: RolRuta;
  Componente: ComponentType;
  vista?: { etiqueta: string; orden?: number };
};

const RUTAS_BASE: Record<string, { path: string; rol: RolRuta }> = {
  panel: { path: "/panel", rol: "eira" },
  municipio: { path: "/m/:jornada", rol: "municipio" },
  landing: { path: "/", rol: "publico" },
};

export function rutasDeFeatures(modulos: Record<string, FeatureModule>): RutaFeature[] {
  return Object.entries(modulos).flatMap(([archivo, modulo]) => {
    const nombre = archivo.split("/").at(-2) ?? archivo;
    const ruta = modulo.ruta ?? RUTAS_BASE[nombre];
    return ruta ? [{ nombre, ...ruta, Componente: modulo.default, vista: modulo.vista }] : [];
  });
}

export function vistasDeEira(rutas: RutaFeature[]): Vista[] {
  const vistas = rutas.flatMap(({ rol, path, vista }) =>
    rol === "eira" && vista && !path.includes(":") ? [{ to: path, etiqueta: vista.etiqueta, orden: vista.orden ?? 100 }] : [],
  );
  if (!vistas.some((vista) => vista.to === "/panel")) vistas.push({ to: "/panel", etiqueta: "Panorama", orden: 10 });
  return vistas.sort((a, b) => a.orden - b.orden).map(({ to, etiqueta }) => ({ to, etiqueta }));
}
