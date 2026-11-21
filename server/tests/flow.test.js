'use strict';
// demo_data: true — todos los municipios y personas son ficticios.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../app');
const { createKv } = require('../kv');
const recordatorios = require('../reminders');

const HOY = new Date('2026-11-21T12:00:00Z');
const MIN = 60 * 1000;

async function levantar() {
  const reloj = { t: HOY };
  const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jl-flow-'));
  const { app, close } = createApp({ dbPath: ':memory:', useValkey: false, now: () => reloj.t, uploadDir });
  const server = await new Promise((r) => { const s = app.listen(0, () => r(s)); });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  return { base, reloj, stop: () => { server.closeAllConnections(); server.close(); close(); } };
}

async function json(base, ruta, body, method = 'POST') {
  const res = await fetch(`${base}${ruta}`, {
    method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

async function crearJornada(base) {
  const { body } = await json(base, '/jornadas', {
    municipio: { nombre: 'Villa Ejemplo', contacto_email: 'enlace@villa-ejemplo.test' },
    sede: 'Centro de Salud Ficticio', fecha: '2026-12-21',
    servicios: ['mastografia'], responsables: ['Coordinadora Demo'],
  });
  return body;
}

test('magic_link_solo_sirve_una_vez', async () => {
  const { base, stop } = await levantar();
  try {
    const j = await crearJornada(base);
    const sol = await json(base, '/magic/solicitar', { jornada_id: j.id });
    assert.equal(sol.status, 201);
    assert.ok(sol.body.token && sol.body.token.length >= 32);
    const uno = await json(base, '/magic/consumir', { token: sol.body.token });
    assert.equal(uno.status, 200);
    assert.equal(uno.body.jornada_id, j.id);
    const dos = await json(base, '/magic/consumir', { token: sol.body.token });
    assert.equal(dos.status, 401);
  } finally { stop(); }
});

test('magic_link_expira_a_los_15_min', async () => {
  const { base, reloj, stop } = await levantar();
  try {
    const j = await crearJornada(base);
    const sol = await json(base, '/magic/solicitar', { jornada_id: j.id });
    assert.equal(sol.status, 201);
    reloj.t = new Date(HOY.getTime() + 16 * MIN);
    const res = await json(base, '/magic/consumir', { token: sol.body.token });
    assert.equal(res.status, 401);
  } finally { stop(); }
});

test('cambio_de_documento_emite_evento_sse', async () => {
  const { base, stop } = await levantar();
  const ac = new AbortController();
  try {
    const j = await crearJornada(base);
    const res = await fetch(`${base}/jornadas/${j.id}/stream`, { signal: ac.signal });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/event-stream/);
    const lector = res.body.getReader();
    const dec = new TextDecoder();
    let texto = dec.decode((await lector.read()).value); // comentario inicial: ya está suscrito
    const fd = new FormData();
    fd.append('archivo', new Blob(['foto'], { type: 'image/png' }), 'foto.png');
    const up = await fetch(`${base}/documentos/${j.documentos[0].id}/archivo`, { method: 'POST', body: fd });
    assert.equal(up.status, 201);
    const limite = Date.now() + 3000;
    while (!texto.includes('version_subida') && Date.now() < limite) {
      const { value, done } = await lector.read();
      if (done) break;
      texto += dec.decode(value);
    }
    assert.match(texto, /data: .*"evento":"version_subida"/);
  } finally { ac.abort(); stop(); }
});

test('carta_con_clausula_protegida_alterada_responde_422', async () => {
  const { base, stop } = await levantar();
  try {
    const j = await crearJornada(base);
    const plantilla = await json(base, `/jornadas/${j.id}/carta`, undefined, 'GET');
    assert.equal(plantilla.status, 200);
    assert.ok(plantilla.body.clausulas.length > 0);
    const alteradas = plantilla.body.clausulas.map((c, i) => (i === 0 ? `${c} Salvo que el municipio decida lo contrario.` : c));
    const res = await json(base, `/jornadas/${j.id}/carta`, { campos: plantilla.body.campos, clausulas: alteradas });
    assert.equal(res.status, 422);
    const ok = await json(base, `/jornadas/${j.id}/carta`, { campos: plantilla.body.campos, clausulas: plantilla.body.clausulas });
    assert.equal(ok.status, 201);
    const aud = await json(base, `/jornadas/${j.id}/auditoria`, undefined, 'GET');
    const acciones = aud.body.eventos.map((e) => e.accion);
    assert.ok(acciones.includes('carta_rechazada'));
    assert.ok(acciones.includes('carta_generada'));
  } finally { stop(); }
});

test('recordatorio_no_pasa_de_2_por_semana', async () => {
  const kv = createKv({ useValkey: false });
  try {
    // Lunes 2026-11-23 16:00Z = 10:00 en Ciudad de México (horario hábil).
    const lunes = new Date('2026-11-23T16:00:00Z').getTime();
    for (let i = 0; i < 4; i++) await kv.zadd(recordatorios.CLAVE, lunes - i * MIN, `7:extra${i}`);
    const enviados = await recordatorios.despachar(kv, new Date(lunes));
    assert.equal(enviados.length, 2);
    const otraVez = await recordatorios.despachar(kv, new Date(lunes + 60 * MIN));
    assert.equal(otraVez.length, 0);
    // Sábado: fuera de horario hábil, no sale nada.
    await kv.zadd(recordatorios.CLAVE, lunes, '8:T-21');
    const sabado = new Date('2026-11-28T16:00:00Z');
    assert.equal((await recordatorios.despachar(kv, sabado)).length, 0);
    // Plan: T-21 y T-14, en día hábil.
    const plan = recordatorios.planear('2026-12-21');
    assert.deepEqual(plan.map((p) => p.tipo), ['T-21', 'T-14']);
    for (const p of plan) assert.ok(recordatorios.esHorarioHabil(new Date(p.ts)));
  } finally { await kv.close(); }
});
