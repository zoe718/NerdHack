'use strict';
const express = require('express');
const { evaluarJornada } = require('../semaforo');
const { programar } = require('../reminders');

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

module.exports = (ctx) => {
  const r = express.Router();

  r.post('/jornadas', async (req, res) => {
    const b = req.body || {};
    const municipioOk = b.municipio_id || (b.municipio && typeof b.municipio.nombre === 'string' && b.municipio.nombre.trim());
    if (!municipioOk) return res.status(400).json({ error: 'municipio.nombre o municipio_id es obligatorio' });
    if (!b.sede || typeof b.sede !== 'string') return res.status(400).json({ error: 'sede es obligatoria' });
    if (!b.fecha || !FECHA.test(b.fecha)) return res.status(400).json({ error: 'fecha debe ser YYYY-MM-DD' });

    const catalogo = ctx.repo.requisitos();
    let requisitos = catalogo;
    if (Array.isArray(b.requisitos) && b.requisitos.length) {
      const tipos = new Set(b.requisitos);
      requisitos = catalogo.filter((c) => tipos.has(c.tipo));
      if (requisitos.length !== tipos.size) return res.status(400).json({ error: 'requisito desconocido' });
    }
    const id = ctx.repo.crearJornada({
      municipio_id: b.municipio_id,
      municipio: b.municipio && { nombre: b.municipio.nombre.trim(), contacto_email: b.municipio.contacto_email },
      sede: b.sede, fecha: b.fecha, servicios: b.servicios, responsables: b.responsables,
      requisitos: requisitos.map((c) => ({ ...c, fecha_limite: null })),
      actor: req.get('x-actor') || 'coordinacion',
    }, ctx.ts());
    ctx.publicar(id, 'jornada_creada');
    await programar(ctx.kv, id, b.fecha).catch(() => {});
    res.status(201).json(evaluarJornada(ctx.repo.jornada(id), ctx.hoy()));
  });

  r.get('/jornadas', (_req, res) => {
    const hoy = ctx.hoy();
    res.json({ jornadas: ctx.repo.jornadaIds().map((id) => evaluarJornada(ctx.repo.jornada(id), hoy)) });
  });

  r.get('/jornadas/:id', (req, res) => {
    const j = ctx.repo.jornada(Number(req.params.id));
    if (!j) return res.status(404).json({ error: 'jornada no encontrada' });
    res.json(evaluarJornada(j, ctx.hoy()));
  });

  r.get('/jornadas/:id/auditoria', (req, res) => {
    const id = Number(req.params.id);
    if (!ctx.repo.jornada(id)) return res.status(404).json({ error: 'jornada no encontrada' });
    res.json({ eventos: ctx.repo.auditoria(id).map((e) => ({ ...e, detalle: e.detalle ? JSON.parse(e.detalle) : null })) });
  });

  return r;
};
