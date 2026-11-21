'use strict';
const express = require('express');
const { evaluarJornada, ordenarPorRiesgo } = require('../semaforo');

module.exports = (ctx) => {
  const r = express.Router();
  r.get('/panorama', (_req, res) => {
    const hoy = ctx.hoy();
    const jornadas = ordenarPorRiesgo(ctx.repo.jornadaIds().map((id) => evaluarJornada(ctx.repo.jornada(id), hoy)));
    const conteo = { rojo: 0, ambar: 0, verde: 0 };
    for (const j of jornadas) conteo[j.semaforo] += 1;
    res.json({ hoy, conteo, jornadas });
  });
  return r;
};
