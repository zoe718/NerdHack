import type { ColorSemaforo, EstadoDocumento } from "../dominio";

export const demo_data = true;

export type TipoRequisito = "carta" | "fotografias" | "logotipos" | "enlace" | "convocatoria";

export type RequisitoDemo = { tipo: TipoRequisito; titulo: string; estado: EstadoDocumento; detalle: string };

const REQUISITOS: RequisitoDemo[] = [
  { tipo: "carta", titulo: "Carta compromiso", estado: "aprobado", detalle: "Versión 1, aprobada ayer" },
  { tipo: "fotografias", titulo: "Fotografías", estado: "observado", detalle: "Versión 1, 3 archivos" },
  { tipo: "logotipos", titulo: "Logotipos", estado: "recibido", detalle: "Versión 1, en revisión de Eira" },
  { tipo: "enlace", titulo: "Persona enlace", estado: "aprobado", detalle: "Jorge Ramírez, aprobado el lunes" },
  { tipo: "convocatoria", titulo: "Apoyo a convocatoria", estado: "pendiente", detalle: "Fecha límite: 26 de noviembre" },
];

export const JORNADA = {
  demo_data,
  id: "villa-ejemplo",
  municipio: "Villa Ejemplo",
  sede: "Casa de la Cultura de Villa Ejemplo",
  fecha: "jueves 3 de diciembre de 2026",
  fechaIso: "2026-12-03",
  faltanDias: 12,
  semaforo: "ambar" as ColorSemaforo,
  servicios: "Estudios de detección y pláticas informativas",
  coordinadora: "Laura Méndez",
  observacion: {
    requisito: "Fotografías",
    motivo: "Falta foto de la sede",
    autora: "Laura Méndez, Coordinación Eira",
    cuando: "hace un momento",
  },
  requisitos: REQUISITOS,
  historial: [
    { que: "Eira observó Fotografías", cuando: "hace un momento" },
    { que: "Subiste Fotografías, versión 1", cuando: "hoy, 11:42" },
    { que: "Eira aprobó Carta compromiso", cuando: "ayer, 17:05" },
  ],
};

export const CLAUSULAS = [
  "El municipio facilita la sede y apoya la difusión de la jornada.",
  "Eira presta los servicios de la jornada sin costo para la población.",
  "Ninguna de las partes comparte datos personales de quienes asisten.",
];

export const HUELLA_CLAUSULAS = "9f2c…a41b";

export type JornadaResumen = {
  id: string;
  municipio: string;
  sede: string;
  fecha: string;
  faltanDias: number;
  aprobados: number;
  total: number;
  semaforo: ColorSemaforo;
  bloqueo: string;
};

export const JORNADAS: JornadaResumen[] = [
  { id: "san-ejemplo-del-rio", municipio: "San Ejemplo del Río", sede: "Auditorio municipal", fecha: "26 de noviembre", faltanDias: 5, aprobados: 3, total: 5, semaforo: "rojo", bloqueo: "Carta compromiso pendiente" },
  { id: "puerto-ficticio", municipio: "Puerto Ficticio", sede: "Centro comunitario", fecha: "30 de noviembre", faltanDias: 9, aprobados: 4, total: 5, semaforo: "ambar", bloqueo: "Logotipos en revisión" },
  { id: "villa-ejemplo", municipio: "Villa Ejemplo", sede: "Casa de la Cultura", fecha: "3 de diciembre", faltanDias: 12, aprobados: 2, total: 5, semaforo: "ambar", bloqueo: "Fotografías observadas" },
  { id: "valle-simulado", municipio: "Valle Simulado", sede: "Plaza principal", fecha: "24 de noviembre", faltanDias: 3, aprobados: 5, total: 5, semaforo: "verde", bloqueo: "Nada pendiente" },
  { id: "santa-muestra", municipio: "Santa Muestra", sede: "Salón ejidal", fecha: "17 de diciembre", faltanDias: 26, aprobados: 1, total: 5, semaforo: "verde", bloqueo: "Faltan más de 14 días" },
  { id: "lomas-de-prueba", municipio: "Lomas de Prueba", sede: "Escuela primaria", fecha: "24 de diciembre", faltanDias: 33, aprobados: 0, total: 5, semaforo: "verde", bloqueo: "Faltan más de 14 días" },
];
