'use strict';
// Semáforo calculado, nunca guardado. Bordes: 14 → ámbar, 7 → rojo, 0 o vencido → rojo.
const DIA_MS = 86400000;
const RANGO = { rojo: 0, ambar: 1, verde: 2 };

function offsetDias() {
  const n = Number(process.env.DEMO_CLOCK_OFFSET_DAYS || 0);
  return Number.isFinite(n) ? n : 0;
}

// Fecha "hoy" en YYYY-MM-DD, desplazada por DEMO_CLOCK_OFFSET_DAYS.
function hoyISO(now = new Date()) {
  return new Date(now.getTime() + offsetDias() * DIA_MS).toISOString().slice(0, 10);
}

function diasEntre(desdeISO, hastaISO) {
  return Math.round((Date.parse(hastaISO.slice(0, 10)) - Date.parse(desdeISO.slice(0, 10))) / DIA_MS);
}

function semaforoDocumento(doc, dias) {
  if (doc.estado === 'aprobado') return 'verde';
  if (dias <= 7) return 'rojo';
  if (dias <= 14) return 'ambar';
  return 'verde';
}

// Enriquecer una jornada (de repo.jornada) con días y semáforo por documento y global.
function evaluarJornada(j, hoy) {
  const documentos = j.documentos.map((d) => {
    const dias = diasEntre(hoy, d.fecha_limite || j.fecha);
    return { ...d, dias_restantes: dias, semaforo: semaforoDocumento(d, dias) };
  });
  const semaforo = documentos.reduce((peor, d) => (RANGO[d.semaforo] < RANGO[peor] ? d.semaforo : peor), 'verde');
  const sin_aprobar = documentos.filter((d) => d.estado !== 'aprobado').length;
  return { ...j, documentos, dias_restantes: diasEntre(hoy, j.fecha), semaforo, sin_aprobar, total_documentos: documentos.length };
}

function ordenarPorRiesgo(jornadas) {
  return [...jornadas].sort((a, b) =>
    RANGO[a.semaforo] - RANGO[b.semaforo] || a.dias_restantes - b.dias_restantes || b.sin_aprobar - a.sin_aprobar || a.id - b.id);
}

module.exports = { semaforoDocumento, evaluarJornada, ordenarPorRiesgo, hoyISO, diasEntre, RANGO };
