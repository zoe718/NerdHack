import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

function fetchPorRuta(rutas: Record<string, (init?: RequestInit) => unknown>) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const clave = `${init?.method ?? "GET"} ${url}`;
    const r = rutas[clave];
    if (!r) return new Response(JSON.stringify({ jornadas: [JORNADAS_DEMO[0]] }), { status: 200 });
    return new Response(JSON.stringify(r(init)), { status: init?.method === "POST" ? 201 : 200 });
  });
}

test("panel_crea_jornada_con_municipio_sede_y_fecha", async () => {
  const nueva = { ...JORNADAS_DEMO[0], id: 99, sede: "Casa de cultura", municipio: { nombre: "Tepetlán" } };
  const fetchFalso = fetchPorRuta({ "POST /api/jornadas": () => nueva });
  vi.stubGlobal("fetch", fetchFalso);
  render(
    <MemoryRouter>
      <Panel />
    </MemoryRouter>,
  );
  await screen.findByText("Villa Ejemplo");
  await userEvent.click(screen.getByRole("button", { name: "Nueva jornada" }));
  await userEvent.type(screen.getByLabelText("Municipio"), "Tepetlán");
  await userEvent.type(screen.getByLabelText("Sede"), "Casa de cultura");
  await userEvent.type(screen.getByLabelText("Fecha"), "2026-12-15");
  await userEvent.click(screen.getByRole("button", { name: "Crear jornada" }));
  expect(await screen.findByText("Tepetlán")).toBeInTheDocument();
  const post = fetchFalso.mock.calls.find(([u, i]) => u === "/api/jornadas" && i?.method === "POST")!;
  expect(JSON.parse(String(post[1]!.body))).toEqual({
    municipio: { nombre: "Tepetlán" },
    sede: "Casa de cultura",
    fecha: "2026-12-15",
  });
});

test("panel_muestra_enlace_de_acceso_demo", async () => {
  vi.stubGlobal("fetch", fetchPorRuta({ "POST /api/magic/solicitar": () => ({ token: "abc", expira: "2026-12-01" }) }));
  render(
    <MemoryRouter>
      <Panel />
    </MemoryRouter>,
  );
  await screen.findByText("Villa Ejemplo");
  await userEvent.click(screen.getByRole("button", { name: "Enviar acceso a Villa Ejemplo" }));
  const enlace = await screen.findByRole("link", { name: /\/m\/1#t=abc/ });
  expect(enlace).toHaveAttribute("href", "/m/1#t=abc");
  expect(screen.getByText(/solo demo/i)).toBeInTheDocument();
});
