'use strict';
// demo_data: true — todos los municipios y personas son ficticios.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../app');
const { semaforoDocumento } = require('../semaforo');

const HOY = new Date('2026-11-21T12:00:00Z');

function enDias(n) {
  const d = new Date(HOY);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

async function levantar() {
  const { app, close } = createApp({ dbPath: ':memory:', useValkey: false, now: () => HOY, uploadDir: require('node:os').tmpdir() });
  const server = await new Promise((r) => { const s = app.listen(0, () => r(s)); });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  return { base, stop: () => { server.close(); close(); } };
}

async function crearJornada(base, { municipio = 'Villa Ejemplo', fecha = enDias(30) } = {}) {
  const res = await fetch(`${base}/jornadas`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      municipio: { nombre: municipio, contacto_email: 'enlace@villa-ejemplo.test' },
      sede: 'Centro de Salud Ficticio',
      fecha,
      servicios: ['mastografía', 'exploración clínica'],
      responsables: ['Coordinadora Demo'],
    }),
  });
  return { status: res.status, body: await res.json() };
}

async function subir(base, docId, contenido) {
  const fd = new FormData();
  fd.append('archivo', new Blob([contenido], { type: 'image/png' }), 'foto.png');
  const res = await fetch(`${base}/documentos/${docId}/archivo`, { method: 'POST', body: fd });
  return { status: res.status, body: await res.json() };
}

test('crea_jornada_con_documentos_pendientes', async () => {
  const { base, stop } = await levantar();
  try {
    const { status, body } = await crearJornada(base);
    assert.equal(status, 201);
    assert.equal(body.municipio.nombre, 'Villa Ejemplo');
    assert.ok(body.documentos.length >= 4);
    assert.ok(body.documentos.every((d) => d.estado === 'pendiente'));
  } finally { stop(); }
});

test('cada_subida_crea_version_con_sha256', async () => {
  const { base, stop } = await levantar();
  try {
    const { body: j } = await crearJornada(base);
    const doc = j.documentos.find((d) => d.tipo === 'fotografias');
    const v1 = await subir(base, doc.id, 'foto-uno');
    const v2 = await subir(base, doc.id, 'foto-dos');
    assert.equal(v1.status, 201);
    assert.equal(v1.body.version.n, 1);
    assert.equal(v2.body.version.n, 2);
    assert.match(v1.body.version.archivo_sha256, /^[0-9a-f]{64}$/);
    assert.notEqual(v1.body.version.archivo_sha256, v2.body.version.archivo_sha256);
    assert.equal(v2.body.documento.estado, 'recibido');
    assert.equal(v2.body.documento.versiones.length, 2);
  } finally { stop(); }
});

test('observado_sin_motivo_responde_400', async () => {
  const { base, stop } = await levantar();
  try {
    const { body: j } = await crearJornada(base);
    const doc = j.documentos[0];
    await subir(base, doc.id, 'algo');
    const res = await fetch(`${base}/documentos/${doc.id}/revision`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ estado: 'observado' }),
    });
    assert.equal(res.status, 400);
    const ok = await fetch(`${base}/documentos/${doc.id}/revision`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ estado: 'observado', motivo: 'falta foto de la sede' }),
    });
    assert.equal(ok.status, 200);
    assert.equal((await ok.json()).documento.comentario, 'falta foto de la sede');
  } finally { stop(); }
});

test('semaforo_rojo_a_7_dias_sin_aprobar', () => {
  assert.equal(semaforoDocumento({ estado: 'recibido' }, 7), 'rojo');
  assert.equal(semaforoDocumento({ estado: 'pendiente' }, 0), 'rojo');
  assert.equal(semaforoDocumento({ estado: 'pendiente' }, -2), 'rojo');
  assert.equal(semaforoDocumento({ estado: 'aprobado' }, 3), 'verde');
  assert.equal(semaforoDocumento({ estado: 'pendiente' }, 14), 'ambar');
  assert.equal(semaforoDocumento({ estado: 'observado' }, 8), 'ambar');
  assert.equal(semaforoDocumento({ estado: 'pendiente' }, 15), 'verde');
});

test('panorama_ordena_por_riesgo', async () => {
  const { base, stop } = await levantar();
  try {
    await crearJornada(base, { municipio: 'Villa Tranquila', fecha: enDias(40) });
    await crearJornada(base, { municipio: 'Villa Urgente', fecha: enDias(5) });
    await crearJornada(base, { municipio: 'Villa Media', fecha: enDias(12) });
    const res = await fetch(`${base}/panorama`);
    assert.equal(res.status, 200);
    const { jornadas } = await res.json();
    assert.deepEqual(jornadas.map((j) => j.municipio.nombre), ['Villa Urgente', 'Villa Media', 'Villa Tranquila']);
    assert.deepEqual(jornadas.map((j) => j.semaforo), ['rojo', 'ambar', 'verde']);
  } finally { stop(); }
});
