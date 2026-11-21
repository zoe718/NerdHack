// Datos de demostración con la forma de GET /api/jornadas. No son datos reales.
import type { Documento, Jornada } from "../lib/api";

export const demo_data = true;

const doc = (id: number, jornada_id: number, d: Partial<Documento> & Pick<Documento, "tipo" | "nombre" | "estado">): Documento => ({
  id,
  jornada_id,
  obligatorio: 1,
  comentario: null,
  fecha_limite: null,
  actualizado_en: null,
  versiones: [],
  dias_restantes: 0,
  semaforo: "verde",
  ...d,
});

export const JORNADAS_DEMO: Jornada[] = [
  {
    demo_data,
    id: 1,
    municipio_id: 1,
    sede: "Casa de la Cultura de Villa Ejemplo",
    fecha: "2026-12-03",
    municipio: { id: 1, nombre: "Villa Ejemplo" },
    dias_restantes: 7,
    semaforo: "rojo",
    sin_aprobar: 3,
    total_documentos: 5,
    documentos: [
      doc(1, 1, { tipo: "carta", nombre: "Carta compromiso", estado: "aprobado", semaforo: "verde", dias_restantes: 7 }),
      doc(2, 1, {
        tipo: "fotografias",
        nombre: "Fotografías",
        estado: "observado",
        comentario: "Falta foto de la sede",
        semaforo: "rojo",
        dias_restantes: 7,
      }),
      doc(3, 1, { tipo: "logotipos", nombre: "Logotipos", estado: "recibido", semaforo: "rojo", dias_restantes: 7 }),
      doc(4, 1, { tipo: "enlace", nombre: "Persona enlace", estado: "aprobado", semaforo: "verde", dias_restantes: 7 }),
      doc(5, 1, { tipo: "convocatoria", nombre: "Apoyo a convocatoria", estado: "pendiente", semaforo: "rojo", dias_restantes: 7 }),
    ],
  },
  {
    demo_data,
    id: 2,
    municipio_id: 2,
    sede: "Auditorio Municipal de San Demo",
    fecha: "2026-12-04",
    municipio: { id: 2, nombre: "San Demo" },
    dias_restantes: 13,
    semaforo: "ambar",
    sin_aprobar: 2,
    total_documentos: 5,
    documentos: [
      doc(6, 2, { tipo: "carta", nombre: "Carta compromiso", estado: "pendiente", semaforo: "ambar", dias_restantes: 13 }),
      doc(7, 2, { tipo: "fotografias", nombre: "Fotografías", estado: "recibido", semaforo: "ambar", dias_restantes: 13 }),
      doc(8, 2, { tipo: "logotipos", nombre: "Logotipos", estado: "aprobado" }),
      doc(9, 2, { tipo: "enlace", nombre: "Persona enlace", estado: "aprobado" }),
      doc(10, 2, { tipo: "convocatoria", nombre: "Apoyo a convocatoria", estado: "aprobado" }),
    ],
  },
  {
    demo_data,
    id: 3,
    municipio_id: 3,
    sede: "Centro Comunitario de Lomas Prueba",
    fecha: "2026-12-21",
    municipio: { id: 3, nombre: "Lomas Prueba" },
    dias_restantes: 30,
    semaforo: "verde",
    sin_aprobar: 0,
    total_documentos: 5,
    documentos: ["carta", "fotografias", "logotipos", "enlace", "convocatoria"].map((tipo, i) =>
      doc(11 + i, 3, { tipo, nombre: tipo, estado: "aprobado" }),
    ),
  },
];
