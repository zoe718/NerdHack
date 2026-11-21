'use strict';
// Magic link de un solo uso: el token solo vive en la respuesta; en el KV guardamos su sha256 con TTL de 15 min.
const crypto = require('node:crypto');
const express = require('express');
const { registrar } = require('../audit');

const TTL_S = 15 * 60;
const huella = (t) => crypto.createHash('sha256').update(String(t)).digest('hex');

module.exports = (ctx) => {
  const r = express.Router();

  r.post('/magic/solicitar', async (req, res) => {
    const jid = Number(req.body && req.body.jornada_id);
    if (!jid || !ctx.repo.jornada(jid)) return res.status(404).json({ error: 'jornada no existe' });
    const token = crypto.randomBytes(32).toString('hex');
    const exp = ctx.now().getTime() + TTL_S * 1000;
    await ctx.kv.set(`magic:${huella(token)}`, JSON.stringify({ jornada_id: jid, exp }), { nx: true, ex: TTL_S });
    registrar(ctx, jid, 'sistema', 'magic_link_emitido', { expira: new Date(exp).toISOString() });
    res.status(201).json({ token, expira: new Date(exp).toISOString() });
  });

  r.post('/magic/consumir', async (req, res) => {
    const token = req.body && req.body.token;
    if (!token || typeof token !== 'string') return res.status(401).json({ error: 'enlace inválido' });
    const raw = await ctx.kv.getdel(`magic:${huella(token)}`);
    const dato = raw ? JSON.parse(raw) : null;
    if (!dato || dato.exp < ctx.now().getTime()) return res.status(401).json({ error: 'enlace inválido o vencido' });
    registrar(ctx, dato.jornada_id, 'municipio', 'magic_link_usado', null);
    res.json({ jornada_id: dato.jornada_id });
  });

  return r;
};
