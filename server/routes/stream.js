'use strict';
// SSE por jornada: reenvía lo que ctx.publicar() manda a `jornada:{id}`.
const express = require('express');

module.exports = (ctx) => {
  const r = express.Router();
  r.get('/jornadas/:id/stream', async (req, res) => {
    const jid = Number(req.params.id);
    if (!ctx.repo.jornada(jid)) return res.status(404).json({ error: 'jornada no existe' });
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
    res.flushHeaders();
    let cerrado = false;
    let unsub = null;
    const latido = setInterval(() => res.write(': latido\n\n'), 25000);
    req.on('close', () => {
      cerrado = true;
      clearInterval(latido);
      if (unsub) Promise.resolve(unsub()).catch(() => {});
    });
    unsub = await ctx.kv.subscribe(`jornada:${jid}`, (msg) => { if (!cerrado) res.write(`data: ${msg}\n\n`); });
    if (cerrado) return Promise.resolve(unsub()).catch(() => {});
    res.write(': conectado\n\n');
  });
  return r;
};
