'use strict';
// demo_data: true — municipios ficticios.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../app');

const HOY = new Date('2026-11-21T12:00:00Z');
const enDias = (n) => new Date(HOY.getTime() + n * 86400000).toISOString().slice(0, 10);

async function levantar() {
  const { app, close } = createApp({ dbPath: ':memory:', useValkey: false, now: () => HOY, uploadDir: fs.mkdtempSync(path.join(os.tmpdir(), 'jl-req-')) });
  const server = await new Promise((r) => { const s = app.listen(0, () => r(s)); });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  return { base, stop: () => { server.close(); close(); } };
}

const post = (url, body) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  .then(async (r) => ({ status: r.status, body: await r.json() }));

const jornada = (base, municipio, dias, requisitos) => post(`${base}/jornadas`, {
  municipio: { nombre: municipio }, sede: 'Sede Ficticia', fecha: enDias(dias), requisitos,
});

test('catalogo_default_trae_cuatro_requisitos', async () => {
  const { base, stop } = await levantar();
  try {
    const r = await fetch(`${base}/requisitos`);
    assert.equal(r.status, 200);
    const { requisitos } = await r.json();
    assert.deepEqual(requisitos.map((x) => x.tipo), ['carta_compromiso', 'fotografias', 'logotipos', 'persona_enlace']);
    const nuevo = await post(`${base}/requisitos`, { tipo: 'croquis', nombre: 'Croquis de la sede', obligatorio: false });
    assert.equal(nuevo.status, 201);
    assert.equal(nuevo.body.requisito.tipo, 'croquis');
    assert.equal((await post(`${base}/requisitos`, { tipo: 'croquis', nombre: 'otra' })).status, 409);
    assert.equal((await post(`${base}/requisitos`, { nombre: 'sin tipo' })).status, 400);
    const despues = await (await fetch(`${base}/requisitos`)).json();
    assert.equal(despues.requisitos.length, 5);
  } finally { stop(); }
});

test('jornada_usa_solo_requisitos_elegidos', async () => {
  const { base, stop } = await levantar();
  try {
    const r = await jornada(base, 'Villa Ejemplo', 30, ['carta_compromiso', 'logotipos']);
    assert.equal(r.status, 201);
    assert.deepEqual(r.body.documentos.map((d) => d.tipo).sort(), ['carta_compromiso', 'logotipos']);
    const porTipo = await jornada(base, 'Villa Ejemplo', 40, ['fotografias']);
    assert.deepEqual(porTipo.body.documentos.map((d) => d.tipo), ['fotografias']);
    assert.equal((await jornada(base, 'Villa Ejemplo', 50, ['no_existe'])).status, 400);
  } finally { stop(); }
});

test('pendientes_agrupa_por_municipio', async () => {
  const { base, stop } = await levantar();
  try {
    await jornada(base, 'Villa Norte', 30, ['carta_compromiso', 'logotipos']);
    await jornada(base, 'Villa Norte', 5, ['fotografias']);
    await jornada(base, 'Villa Sur', 20, ['persona_enlace']);
    const r = await fetch(`${base}/pendientes`);
    assert.equal(r.status, 200);
    const { municipios } = await r.json();
    assert.deepEqual(municipios.map((m) => m.municipio), ['Villa Norte', 'Villa Sur']);
    assert.equal(municipios[0].pendientes, 3);
    assert.equal(municipios[0].mas_urgente.tipo, 'fotografias');
    assert.equal(municipios[0].mas_urgente.dias_restantes, 5);
    assert.equal(municipios[1].pendientes, 1);
    assert.equal(municipios[1].mas_urgente.tipo, 'persona_enlace');
  } finally { stop(); }
});
