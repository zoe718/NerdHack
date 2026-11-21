'use strict';
// Carta compromiso: campos editables + cláusulas protegidas. Si alguien altera una cláusula, 422 y queda en bitácora.
const crypto = require('node:crypto');
const express = require('express');
const { registrar } = require('../audit');

const CLAUSULAS = Object.freeze([
  'El municipio garantiza la sede, mobiliario y servicios básicos durante la jornada.',
  'Eira coordina al personal de salud y no realiza cobros a la población atendida.',
  'Los datos personales de las personas atendidas se tratan conforme a la ley aplicable y no se comparten con terceros.',
  'Cualquier cambio de fecha o sede se notifica con al menos 7 días naturales de anticipación.',
]);
const hash = (c) => crypto.createHash('sha256').update(JSON.stringify(c)).digest('hex');
const HASH = hash(CLAUSULAS);

function camposDe(j) {
  return {
    municipio: j.municipio ? j.municipio.nombre : '',
    sede: j.sede,
    fecha: j.fecha,
    servicios: j.servicios,
    responsables: j.responsables,
  };
}

module.exports = (ctx) => {
  const r = express.Router();

  r.get('/jornadas/:id/carta', (req, res) => {
    const j = ctx.repo.jornada(Number(req.params.id));
    if (!j) return res.status(404).json({ error: 'jornada no existe' });
    res.json({ campos: camposDe(j), clausulas: CLAUSULAS, clausulas_hash: HASH });
  });

  r.post('/jornadas/:id/carta', (req, res) => {
    const jid = Number(req.params.id);
    if (!ctx.repo.jornada(jid)) return res.status(404).json({ error: 'jornada no existe' });
    const { campos, clausulas } = req.body || {};
    if (!campos || typeof campos !== 'object') return res.status(400).json({ error: 'faltan campos' });
    if (!Array.isArray(clausulas) || hash(clausulas) !== HASH) {
      registrar(ctx, jid, 'municipio', 'carta_rechazada', { motivo: 'clausula_protegida_alterada' });
      return res.status(422).json({ error: 'las cláusulas protegidas no se pueden modificar' });
    }
    const ts = ctx.ts();
    const id = ctx.db.prepare('INSERT INTO cartas (jornada_id, campos_json, clausulas_hash, generada_en) VALUES (?, ?, ?, ?)')
      .run(jid, JSON.stringify(campos), HASH, ts).lastInsertRowid;
    registrar(ctx, jid, 'municipio', 'carta_generada', { carta_id: Number(id) });
    ctx.publicar(jid, 'carta_generada');
    res.status(201).json({ carta: { id: Number(id), jornada_id: jid, campos, clausulas: CLAUSULAS, clausulas_hash: HASH, generada_en: ts } });
  });

  return r;
};
