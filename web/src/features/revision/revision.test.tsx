import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { Documento, Jornada, RevisionApi, Version } from "./api";
import { Revision } from "./Revision";

function version(n: number, sha: string, creado_en: string): Version {
  return { id: n, documento_id: 2, n, archivo_nombre: `fotos-v${n}.zip`, archivo_sha256: sha, subido_por: "municipio", creado_en };
}

function jornadaDemo(): Jornada {
  return {
    id: 7,
    sede: "Casa de la Cultura de Villa Ejemplo",
    fecha: "2026-12-03",
    municipio: { nombre: "Villa Ejemplo" },
    dias_restantes: 12,
    semaforo: "ambar",
    documentos: [
      { id: 1, tipo: "carta_compromiso", nombre: "Carta compromiso", estado: "aprobado", comentario: null, versiones: [] },
      {
        id: 2,
        tipo: "fotografias",
        nombre: "Fotografías",
        estado: "recibido",
        comentario: null,
        versiones: [
          version(1, "c0ffee11deadbeef00001111", "2026-11-21T17:42:00.000Z"),
          version(2, "9f2ca41b7e55001122334455", "2026-11-21T19:10:00.000Z"),
        ],
      },
      { id: 3, tipo: "logotipos", nombre: "Logotipos", estado: "pendiente", comentario: null, versiones: [] },
    ],
  };
}

function fakeApi(jornada: Jornada = jornadaDemo()) {
  const revisiones: { id: number; estado: string; motivo?: string }[] = [];
  const api: RevisionApi = {
    jornada: async () => structuredClone(jornada),
    revisar: async (id, estado, motivo) => {
      revisiones.push({ id, estado, motivo });
      const documento = jornada.documentos.find((d) => d.id === id) as Documento;
      documento.estado = estado;
      documento.comentario = motivo ?? null;
      return structuredClone(documento);
    },
    suscribir: () => () => {},
    urlArchivo: (id, n) => `/api/documentos/${id}/versiones/${n}/archivo`,
  };
  return { api, revisiones };
}

function montar(api: RevisionApi) {
  render(
    <MemoryRouter>
      <Revision jornadaId="7" api={api} />
    </MemoryRouter>,
  );
  return userEvent.setup();
}

describe("revisión de Eira", () => {
  it("observar_sin_motivo_no_envia", async () => {
    const { api, revisiones } = fakeApi();
    const usuario = montar(api);
    await waitFor(() => expect(screen.queryAllByRole("button", { name: "Observar" })).toHaveLength(1));
    await usuario.click(screen.getByRole("button", { name: "Observar" }));
    await usuario.click(screen.getByRole("button", { name: "Enviar observación" }));
    expect(revisiones).toEqual([]);
    expect(screen.queryAllByText("Escribe el motivo para que el municipio sepa qué corregir.")).toHaveLength(1);
    await usuario.type(screen.getByLabelText("Motivo de la observación"), "Falta foto de la sede");
    await usuario.click(screen.getByRole("button", { name: "Enviar observación" }));
    await waitFor(() => expect(revisiones).toEqual([{ id: 2, estado: "observado", motivo: "Falta foto de la sede" }]));
  });

  it("aprobar_marca_aprobado", async () => {
    const { api, revisiones } = fakeApi();
    const usuario = montar(api);
    await waitFor(() => expect(screen.queryAllByRole("button", { name: "Aprobar" })).toHaveLength(1));
    await usuario.click(screen.getByRole("button", { name: "Aprobar" }));
    await waitFor(() => expect(revisiones).toEqual([{ id: 2, estado: "aprobado", motivo: undefined }]));
    const resumen = screen.getByRole("list", { name: "Requisitos de la jornada" });
    const fila = within(resumen).getByText("Fotografías").closest("li") as HTMLElement;
    expect(within(fila).queryAllByText("Aprobado")).toHaveLength(1);
    expect(screen.queryAllByRole("button", { name: "Aprobar" })).toHaveLength(0);
  });

  it("muestra_versiones_del_archivo", async () => {
    const { api } = fakeApi();
    montar(api);
    await waitFor(() => expect(screen.queryAllByText("v2")).toHaveLength(1));
    expect(screen.queryAllByText("v1")).toHaveLength(1);
    expect(screen.queryAllByText(/9f2ca41b/)).toHaveLength(1);
    expect(screen.queryAllByText(/c0ffee11/)).toHaveLength(1);
    expect(screen.queryAllByText(/21 nov/).length).toBeGreaterThan(0);
  });
});
