import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, expect, test, vi } from "vitest";
import { JORNADAS_DEMO } from "../../mocks/jornadas";
import Panel from "./index";

afterEach(() => vi.unstubAllGlobals());

test("panel_muestra_rojo_para_jornada_a_7_dias", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ jornadas: [JORNADAS_DEMO[0]] }), { status: 200 })),
  );
  render(
    <MemoryRouter>
      <Panel />
    </MemoryRouter>,
  );
  expect(await screen.findByText("Faltan 7 días")).toBeInTheDocument();
  expect(screen.getByText("Villa Ejemplo")).toBeInTheDocument();
  expect(screen.getByText(/1 jornada en rojo/i)).toBeInTheDocument();
});
