import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { ExpedienteApi, ExpedienteJornada } from "./api";
import { Expediente } from "./Expediente";

const jornada: ExpedienteJornada = {
  id: 7,
  sede: "Auditorio Demo",
  fecha: "2026-12-12",
  dias_restantes: 21,
  semaforo: "ambar",
  servicios: ["mastografía", "papanicolaou"],
  responsables: ["Coordinadora Demo A", "Enfermera Demo B"],
  municipio: { nombre: "Villa Prueba", contacto_email: "salud@villa-prueba.test" },
  documentos: [
    { id: 1, tipo: "carta", nombre: "Carta compromiso", estado: "aprobado", comentario: null, dias_restantes: 21, semaforo: "verde" },
    { id: 2, tipo: "fotografias", nombre: "Fotografías de la sede", estado: "observado", comentario: "Falta la entrada", dias_restantes: 14, semaforo: "ambar" },
  ],
};

describe("expediente", () => {
  it("expediente_muestra_servicios_y_responsables", async () => {
    const api: ExpedienteApi = { jornada: async () => jornada };
    render(
      <MemoryRouter>
        <Expediente jornadaId="7" api={api} />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { level: 1, name: /Villa Prueba/ })).toBeInTheDocument();
    const servicios = screen.getByRole("list", { name: "Servicios" });
    expect(within(servicios).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["mastografía", "papanicolaou"]);
    const responsables = screen.getByRole("list", { name: "Responsables" });
    expect(within(responsables).getByText("Enfermera Demo B")).toBeInTheDocument();
    expect(screen.getByText("salud@villa-prueba.test")).toBeInTheDocument();
    expect(screen.getByText("Auditorio Demo")).toBeInTheDocument();
    const docs = screen.getByRole("list", { name: "Requisitos de la jornada" });
    expect(within(docs).getAllByRole("listitem")).toHaveLength(2);
    expect(within(docs).getByText(/Falta la entrada/)).toBeInTheDocument();
  });
});
