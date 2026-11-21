import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import { ErrorApi, type Campos, type CartaApi } from "./api";
import { Carta } from "./Carta";

const CLAUSULAS = [
  "El municipio garantiza la sede, mobiliario y servicios básicos durante la jornada.",
  "Eira coordina al personal de salud y no realiza cobros a la población atendida.",
];

function fakeApi({ rechazar = false } = {}) {
  const guardadas: { campos: Campos; clausulas: string[] }[] = [];
  const api: CartaApi = {
    plantilla: async () => ({
      campos: {
        municipio: "Villa Ejemplo",
        sede: "Casa de la Cultura de Villa Ejemplo",
        fecha: "2026-12-03",
        servicios: ["mastografía", "exploración clínica"],
        responsables: ["Jorge Ramírez"],
      },
      clausulas: [...CLAUSULAS],
      clausulas_hash: "9f2ca41b",
    }),
    guardar: async (_jornadaId, campos, clausulas) => {
      if (rechazar) throw new ErrorApi("las cláusulas protegidas no se pueden modificar", 422);
      guardadas.push({ campos, clausulas });
      return { id: guardadas.length, generada_en: "2026-11-21T19:40:00.000Z" };
    },
    historial: async () =>
      guardadas.map((_, i) => ({ id: i + 1, actor: "municipio", accion: "carta_generada", creado_en: "2026-11-21T19:40:00.000Z" })),
  };
  return { api, guardadas };
}

function montar(api: CartaApi) {
  render(
    <MemoryRouter>
      <Carta jornadaId="7" api={api} />
    </MemoryRouter>,
  );
  return userEvent.setup();
}

describe("carta compromiso", () => {
  it("clausula_protegida_es_solo_lectura", async () => {
    const { api, guardadas } = fakeApi();
    const usuario = montar(api);
    await waitFor(() => expect(screen.queryAllByText(CLAUSULAS[0])).toHaveLength(1));
    const editables = screen.queryAllByRole("textbox").map((campo) => (campo as HTMLInputElement).value);
    expect(editables.some((valor) => valor.includes("garantiza la sede"))).toBe(false);
    expect(screen.queryAllByText("Cláusulas fijas")).toHaveLength(1);
    await usuario.click(screen.getByRole("button", { name: "Guardar carta" }));
    await waitFor(() => expect(guardadas).toHaveLength(1));
    expect(guardadas[0].clausulas).toEqual(CLAUSULAS);
  });

  it("error_422_muestra_aviso", async () => {
    const { api } = fakeApi({ rechazar: true });
    const usuario = montar(api);
    await waitFor(() => expect(screen.queryAllByRole("button", { name: "Guardar carta" })).toHaveLength(1));
    await usuario.click(screen.getByRole("button", { name: "Guardar carta" }));
    await waitFor(() => expect(screen.queryAllByText("Esta cláusula no se puede modificar")).toHaveLength(1));
  });

  it("guardar_crea_nueva_version", async () => {
    const { api, guardadas } = fakeApi();
    const usuario = montar(api);
    await waitFor(() => expect(screen.queryAllByLabelText("Sede")).toHaveLength(1));
    const sede = screen.getByLabelText("Sede");
    await usuario.clear(sede);
    await usuario.type(sede, "Plaza principal de Villa Ejemplo");
    await usuario.click(screen.getByRole("button", { name: "Guardar carta" }));
    await waitFor(() => expect(guardadas.map((g) => g.campos.sede)).toEqual(["Plaza principal de Villa Ejemplo"]));
    await waitFor(() => expect(screen.queryAllByText("Versión 1")).toHaveLength(1));
    await usuario.click(screen.getByRole("button", { name: "Guardar carta" }));
    await waitFor(() => expect(screen.queryAllByText("Versión 2")).toHaveLength(1));
    expect(screen.queryAllByText("Versión 1")).toHaveLength(1);
  });
});
