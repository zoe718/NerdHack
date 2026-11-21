import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { agruparPendientes } from "./agrupar";
import type { DocumentoResumen, JornadaResumen, PendientesApi } from "./api";
import { Pendientes } from "./Pendientes";

const doc = (id: number, estado: DocumentoResumen["estado"], dias: number): DocumentoResumen => ({
  id,
  tipo: `t${id}`,
  nombre: `Documento ${id}`,
  estado,
  dias_restantes: dias,
  semaforo: estado === "aprobado" ? "verde" : dias <= 7 ? "rojo" : dias <= 14 ? "ambar" : "verde",
});

const jornada = (id: number, municipio: string, documentos: DocumentoResumen[]): JornadaResumen => ({
  id,
  sede: `Sede ${id}`,
  fecha: "2026-12-10",
  municipio: { nombre: municipio },
  documentos,
});

const demo = () => [
  jornada(1, "Villa Norte", [doc(1, "pendiente", 20), doc(2, "aprobado", 20), doc(3, "observado", 18)]),
  jornada(2, "Puerto Sur", [doc(4, "recibido", 5)]),
  jornada(3, "Villa Norte", [doc(5, "pendiente", 12)]),
  jornada(4, "Cerro Alto", [doc(6, "aprobado", 3)]),
];

describe("pendientes", () => {
  it("agrupa_pendientes_por_municipio", () => {
    const grupos = agruparPendientes(demo());
    const norte = grupos.find((g) => g.municipio === "Villa Norte");
    expect(norte?.pendientes).toBe(3);
    expect(norte?.mas_urgente.id).toBe(5);
    expect(norte?.mas_urgente.jornada_id).toBe(3);
    expect(norte?.semaforo).toBe("ambar");
    expect(grupos.some((g) => g.municipio === "Cerro Alto")).toBe(false);
  });

  it("ordena_municipios_por_urgencia", async () => {
    expect(agruparPendientes(demo()).map((g) => g.municipio)).toEqual(["Puerto Sur", "Villa Norte"]);
    const api: PendientesApi = { jornadas: async () => demo() };
    render(
      <MemoryRouter>
        <Pendientes api={api} />
      </MemoryRouter>,
    );
    const lista = await screen.findByRole("list", { name: "Municipios con pendientes" });
    const filas = within(lista).getAllByRole("listitem");
    expect(filas[0]).toHaveTextContent("Puerto Sur");
    expect(filas[0]).toHaveTextContent("1 pendiente");
    expect(filas[1]).toHaveTextContent("Villa Norte");
    expect(filas[1]).toHaveTextContent("3 pendientes");
  });
});
