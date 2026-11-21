'use strict';
// Vista de coordinación: documentos sin aprobar agrupados por municipio, con el más urgente de cada uno.
const express = require('express');
const { evaluarJornada } = require('../semaforo');

module.exports = (ctx) => {
  const r = express.Router();

  r.get('/pendientes', (_req, res) => {
    const hoy = ctx.hoy();
    const grupos = new Map();
    for (const id of ctx.repo.jornadaIds()) {
      const j = evaluarJornada(ctx.repo.jornada(id), hoy);
      const nombre = j.municipio ? j.municipio.nombre : 'Sin municipio';
      for (const d of j.documentos || []) {
        if (d.estado === 'aprobado') continue;
        const g = grupos.get(nombre) || { municipio: nombre, pendientes: 0, mas_urgente: null };
        g.pendientes += 1;
        if (!g.mas_urgente || d.dias_restantes < g.mas_urgente.dias_restantes) {
          g.mas_urgente = { jornada_id: j.id, documento_id: d.id, tipo: d.tipo, nombre: d.nombre, estado: d.estado, dias_restantes: d.dias_restantes, semaforo: d.semaforo };
        }
        grupos.set(nombre, g);
      }
    }
    const municipios = [...grupos.values()].sort((a, b) => a.mas_urgente.dias_restantes - b.mas_urgente.dias_restantes || b.pendientes - a.pendientes);
    res.json({ municipios });
  });

  return r;
};
