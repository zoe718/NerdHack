import { rutasDeFeatures, vistasDeEira, type FeatureModule } from "./rutas";

const Vacio = () => null;

describe("rutas de features", () => {
  it("feature_con_export_ruta_queda_en_su_path", () => {
    const rutas = rutasDeFeatures({
      "./features/revision/index.tsx": { default: Vacio, ruta: { path: "/panel/:jornada/revision", rol: "eira" } },
    });
    expect(rutas).toEqual([
      { nombre: "revision", path: "/panel/:jornada/revision", rol: "eira", Componente: Vacio, vista: undefined },
    ]);
  });

  it("panel_municipio_y_landing_usan_su_ruta_por_defecto", () => {
    const modulos: Record<string, FeatureModule> = {
      "./features/panel/index.tsx": { default: Vacio },
      "./features/municipio/index.tsx": { default: Vacio },
      "./features/landing/index.tsx": { default: Vacio },
    };
    expect(rutasDeFeatures(modulos).map(({ path, rol }) => [path, rol])).toEqual([
      ["/panel", "eira"],
      ["/m/:jornada", "municipio"],
      ["/", "publico"],
    ]);
  });

  it("feature_sin_ruta_ni_nombre_conocido_no_se_registra", () => {
    const rutas = rutasDeFeatures({
      "./features/suelta/index.tsx": { default: Vacio },
      "./features/panel/index.tsx": { default: Vacio },
    });
    expect(rutas.map((ruta) => ruta.nombre)).toEqual(["panel"]);
  });

  it("vistas_de_eira_salen_de_las_features_en_orden_y_panorama_siempre_esta", () => {
    const rutas = rutasDeFeatures({
      "./features/pendientes/index.tsx": {
        default: Vacio,
        ruta: { path: "/pendientes", rol: "eira" },
        vista: { etiqueta: "Pendientes", orden: 20 },
      },
      "./features/revision/index.tsx": {
        default: Vacio,
        ruta: { path: "/panel/:jornada/revision", rol: "eira" },
        vista: { etiqueta: "Revisión" },
      },
    });
    expect(vistasDeEira(rutas)).toEqual([
      { to: "/panel", etiqueta: "Panorama" },
      { to: "/pendientes", etiqueta: "Pendientes" },
    ]);
  });
});
