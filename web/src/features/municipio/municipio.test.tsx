import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, expect, test, vi } from "vitest";
import { JORNADAS_DEMO } from "../../mocks/jornadas";
import Municipio from "./index";

afterEach(() => vi.unstubAllGlobals());

const jornada = JORNADAS_DEMO[0];
const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status });

function montar() {
  render(
    <MemoryRouter initialEntries={["/m/1"]}>
      <Routes>
        <Route path="/m/:jornada" element={<Municipio />} />
      </Routes>
    </MemoryRouter>,
  );
}

test("municipio_ve_motivo_de_observacion", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => json(jornada)));
  montar();
  expect(await screen.findByText("“Falta foto de la sede”")).toBeInTheDocument();
  expect(screen.getByText("Eira pidió un cambio en Fotografías")).toBeInTheDocument();
});

test("subir_archivo_marca_recibido", async () => {
  const pendiente = jornada.documentos.find((d) => d.estado === "pendiente")!;
  const fetchFalso = vi.fn(async (_url: string, init?: RequestInit) => {
    if (init?.method === "POST") return json({ documento: { ...pendiente, estado: "recibido" } }, 201);
    return json(jornada);
  });
  vi.stubGlobal("fetch", fetchFalso);
  montar();
  const entrada = await screen.findByLabelText(`Subir archivo ${pendiente.nombre}`);
  await userEvent.upload(entrada, new File(["x"], "convocatoria.pdf", { type: "application/pdf" }));
  const fila = await screen.findByTestId(`documento-${pendiente.id}`);
  expect(await within(fila).findByText("Recibido")).toBeInTheDocument();
  const post = fetchFalso.mock.calls.find(([, i]) => i?.method === "POST")!;
  expect(post[0]).toBe(`/api/documentos/${pendiente.id}/archivo`);
  expect((post[1]!.body as FormData).get("archivo")).toBeInstanceOf(File);
});
