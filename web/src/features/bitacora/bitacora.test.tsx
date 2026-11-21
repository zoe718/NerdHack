import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { BitacoraApi, EventoBitacora } from "./api";
import { Bitacora } from "./Bitacora";
import { ordenarRecientes } from "./ordenar";

const eventos: EventoBitacora[] = [
  { id: 1, jornada_id: 7, actor: "sistema", accion: "jornada_creada", detalle: { requisitos: 5 }, creado_en: "2026-11-20T10:00:00.000Z" },
  { id: 2, jornada_id: 7, actor: "municipio", accion: "version_subida", detalle: { documento_id: 3, tipo: "fotografias", n: 1 }, creado_en: "2026-11-20T12:00:00.000Z" },
  { id: 3, jornada_id: 7, actor: "eira", accion: "documento_observado", detalle: { documento_id: 3, tipo: "fotografias", motivo: "Falta la entrada" }, creado_en: "2026-11-20T12:00:00.000Z" },
  { id: 4, jornada_id: 7, actor: "municipio", accion: "carta_generada", detalle: { carta_id: 1 }, creado_en: "2026-11-21T09:30:00.000Z" },
];

describe("bitacora", () => {
  it("bitacora_ordena_eventos_recientes_primero", async () => {
    expect(ordenarRecientes(eventos).map((e) => e.id)).toEqual([4, 3, 2, 1]);
    const api: BitacoraApi = { eventos: async () => eventos };
    render(
      <MemoryRouter>
        <Bitacora jornadaId="7" api={api} />
      </MemoryRouter>,
    );
    const lista = await screen.findByRole("list", { name: "Cambios de la jornada" });
    const filas = within(lista).getAllByRole("listitem");
    expect(filas).toHaveLength(4);
    expect(filas[0]).toHaveTextContent(/generó la carta/i);
    expect(filas[3]).toHaveTextContent(/creó la jornada/i);
  });

  it("muestra_actor_y_accion", async () => {
    const api: BitacoraApi = { eventos: async () => eventos };
    render(
      <MemoryRouter>
        <Bitacora jornadaId="7" api={api} />
      </MemoryRouter>,
    );
    const lista = await screen.findByRole("list", { name: "Cambios de la jornada" });
    const observado = within(lista).getAllByRole("listitem")[1];
    expect(observado).toHaveTextContent("Eira");
    expect(observado).toHaveTextContent(/observó Fotografías/i);
    expect(observado).toHaveTextContent("Falta la entrada");
    const subida = within(lista).getAllByRole("listitem")[2];
    expect(subida).toHaveTextContent("Municipio");
    expect(subida).toHaveTextContent(/subió la versión 1 de Fotografías/i);
  });
});

describe("bitacora con los actores que emite el servidor", () => {
  it("muestra_nombres_legibles_de_coordinacion_y_seed_demo", async () => {
    const reales: EventoBitacora[] = [
      { id: 1, jornada_id: 7, actor: "seed_demo", accion: "jornada_creada", detalle: { requisitos: 4 }, creado_en: "2026-11-20T10:00:00.000Z" },
      { id: 2, jornada_id: 7, actor: "coordinacion", accion: "documento_aprobado", detalle: { documento_id: 3, tipo: "fotografias" }, creado_en: "2026-11-20T12:00:00.000Z" },
    ];
    const api: BitacoraApi = { eventos: async () => reales };
    render(
      <MemoryRouter>
        <Bitacora jornadaId="7" api={api} />
      </MemoryRouter>,
    );
    const lista = await screen.findByRole("list", { name: "Cambios de la jornada" });
    expect(lista.textContent).not.toContain("coordinacion");
    expect(lista.textContent).not.toContain("seed_demo");
    const filas = within(lista).getAllByRole("listitem");
    expect(filas[0]).toHaveTextContent("Eira aprobó Fotografías");
    expect(filas[1]).toHaveTextContent("Carga de ejemplo creó la jornada");
  });
});
