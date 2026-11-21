import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import {
  AppShell,
  EmptyState,
  MagnifyingGlassIcon,
  rutasDeFeatures,
  vistasDeEira,
  type FeatureModule,
  type Persona,
  type RutaFeature,
} from "./lib/ui";
import { PantallaCarta, PantallaMunicipio, PantallaPanel } from "./lib/ui/lock";

const rutas = rutasDeFeatures(import.meta.glob<FeatureModule>("./features/*/index.tsx", { eager: true }));
const vistas = vistasDeEira(rutas);
const tiene = (path: string) => rutas.some((ruta) => ruta.path === path);

const COORDINADORA: Persona = { nombre: "Laura Méndez", detalle: "Coordinación Eira" };

function Eira({ children }: { children: ReactNode }) {
  return (
    <AppShell rol="eira" persona={COORDINADORA} vistas={vistas}>
      {children}
    </AppShell>
  );
}

function Municipio({ children }: { children: ReactNode }) {
  return <AppShell rol="municipio">{children}</AppShell>;
}

function pagina({ rol, Componente }: RutaFeature) {
  if (rol === "eira") {
    return (
      <Eira>
        <Componente />
      </Eira>
    );
  }
  if (rol === "municipio") {
    return (
      <Municipio>
        <Componente />
      </Municipio>
    );
  }
  return <Componente />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {rutas.map((ruta) => (
          <Route key={ruta.path} path={ruta.path} element={pagina(ruta)} />
        ))}
        {tiene("/") ? null : <Route path="/" element={<Navigate to="/panel" replace />} />}
        {tiene("/panel") ? null : <Route path="/panel" element={<Eira><PantallaPanel /></Eira>} />}
        {tiene("/m/:jornada") ? null : (
          <Route path="/m/:jornada" element={<Municipio><PantallaMunicipio /></Municipio>} />
        )}
        <Route path="/design-lock/panel" element={<Eira><PantallaPanel /></Eira>} />
        <Route path="/design-lock/municipio" element={<Municipio><PantallaMunicipio /></Municipio>} />
        <Route path="/design-lock/carta" element={<Municipio><PantallaCarta /></Municipio>} />
        <Route
          path="*"
          element={
            <Municipio>
              <EmptyState
                icon={<MagnifyingGlassIcon aria-hidden />}
                title="Esta página no existe. Revisa el enlace que te compartió Eira."
              />
            </Municipio>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
