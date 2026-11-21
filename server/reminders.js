'use strict';
// Recordatorios T-21 y T-14 en sorted set (score = ms). Máximo 2 por semana por jornada, solo en horario hábil
// (lun-vie 9:00-18:00, Ciudad de México, UTC-6 sin horario de verano).
const CLAVE = 'reminders';
const DIA = 24 * 60 * 60 * 1000;
const SEMANA = 7 * DIA;
const OFFSET = -6 * 60 * 60 * 1000;
const TOPE = 2;

function local(d) { return new Date(new Date(d).getTime() + OFFSET); }

function esHorarioHabil(d) {
  const l = local(d);
  const dia = l.getUTCDay();
  const h = l.getUTCHours();
  return dia >= 1 && dia <= 5 && h >= 9 && h < 18;
}

// fecha 'YYYY-MM-DD' → [{tipo, ts}] a las 10:00 locales (16:00Z), recorrido al siguiente día hábil.
function planear(fecha) {
  const base = new Date(`${fecha}T16:00:00Z`).getTime();
  return [['T-21', 21], ['T-14', 14]].map(([tipo, dias]) => {
    let ts = base - dias * DIA;
    while (!esHorarioHabil(ts)) ts += DIA;
    return { tipo, ts };
  });
}

async function programar(kv, jornadaId, fecha) {
  const plan = planear(fecha);
  for (const p of plan) await kv.zadd(CLAVE, p.ts, `${jornadaId}:${p.tipo}`);
  return plan;
}

// Envía lo vencido respetando el tope semanal; lo que excede queda pendiente para la próxima ventana.
async function despachar(kv, ahora, enviar = async () => {}) {
  if (!esHorarioHabil(ahora)) return [];
  const t = new Date(ahora).getTime();
  const pendientes = await kv.zrangebyscore(CLAVE, '-inf', t);
  const enviados = [];
  for (const m of pendientes) {
    const jid = String(m).split(':')[0];
    const log = `${CLAVE}:enviados:${jid}`;
    const recientes = await kv.zrangebyscore(log, t - SEMANA + 1, t);
    if (recientes.length >= TOPE) continue;
    await enviar(m);
    await kv.zadd(log, t, `${m}@${t}`);
    await kv.zrem(CLAVE, m);
    enviados.push(m);
  }
  return enviados;
}

module.exports = { CLAVE, TOPE, planear, programar, esHorarioHabil, despachar };
