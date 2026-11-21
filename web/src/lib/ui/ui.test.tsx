import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { AppShell, EstadoChip, Semaforo } from "./index";

describe("UI kit", () => {
  it("EstadoChip nombra el estado con texto, no solo con color", () => {
    render(<EstadoChip estado="observado" />);
    expect(screen.getByText("Observado")).toBeInTheDocument();
  });

  it("Semaforo dice su color con palabras", () => {
    render(<Semaforo color="rojo" />);
    expect(screen.getByText("En rojo")).toBeInTheDocument();
  });

  it("el municipio no ve navegación hacia el panel de Eira", () => {
    render(
      <MemoryRouter initialEntries={["/m/villa-ejemplo"]}>
        <AppShell rol="municipio">
          <p>Checklist</p>
        </AppShell>
      </MemoryRouter>,
    );
    expect(screen.queryByRole("link", { name: "Panorama" })).not.toBeInTheDocument();
    expect(screen.getByText("Checklist")).toBeInTheDocument();
  });

  it("Eira ve la vista Panorama en la navegación", () => {
    render(
      <MemoryRouter initialEntries={["/panel"]}>
        <AppShell rol="eira" persona={{ nombre: "Laura Méndez", detalle: "Coordinación Eira" }}>
          <p>Panel</p>
        </AppShell>
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Panorama" })).toBeInTheDocument();
  });
});
