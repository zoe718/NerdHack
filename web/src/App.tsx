import type { ComponentType } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { AppShell, EmptyState, MagnifyingGlassIcon, type Persona } from "./lib/ui";
import { PantallaCarta, PantallaMunicipio, PantallaPanel } from "./lib/ui/lock";

type FeatureModule = { default: ComponentType };

const features = import.meta.glob<FeatureModule>("./features/*/index.tsx", { eager: true });
const feature = (name: string): ComponentType | undefined => features[`./features/${name}/index.tsx`]?.default;

const Panel = feature("panel") ?? PantallaPanel;
const Municipio = feature("municipio") ?? PantallaMunicipio;
const Landing = feature("landing");

const COORDINADORA: Persona = { nombre: "Laura Méndez", detalle: "Coordinación Eira" };

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={Landing ? <Landing /> : <Navigate to="/panel" replace />} />
        <Route
          path="/panel"
          element={
            <AppShell rol="eira" persona={COORDINADORA}>
              <Panel />
            </AppShell>
          }
        />
        <Route
          path="/m/:jornada"
          element={
            <AppShell rol="municipio">
              <Municipio />
            </AppShell>
          }
        />
        <Route
          path="/design-lock/panel"
          element={
            <AppShell rol="eira" persona={COORDINADORA}>
              <PantallaPanel />
            </AppShell>
          }
        />
        <Route
          path="/design-lock/municipio"
          element={
            <AppShell rol="municipio">
              <PantallaMunicipio />
            </AppShell>
          }
        />
        <Route
          path="/design-lock/carta"
          element={
            <AppShell rol="municipio">
              <PantallaCarta />
            </AppShell>
          }
        />
        <Route
          path="*"
          element={
            <AppShell rol="municipio">
              <EmptyState
                icon={<MagnifyingGlassIcon aria-hidden />}
                title="Esta página no existe. Revisa el enlace que te compartió Eira."
              />
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
