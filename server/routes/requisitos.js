'use strict';
// Catálogo editable de requisitos: lo que coordinación puede pedir a un municipio al crear una jornada.
const express = require('express');

const TIPO = /^[a-z][a-z0-9_]{1,40}$/;

module.exports = (ctx) => {
  const r = express.Router();

  r.get('/requisitos', (_req, res) => res.json({ requisitos: ctx.repo.requisitos() }));

  r.post('/requisitos', (req, res) => {
    const { tipo, nombre, obligatorio } = req.body || {};
    if (typeof tipo !== 'string' || !TIPO.test(tipo)) return res.status(400).json({ error: 'tipo debe ser snake_case' });
    if (typeof nombre !== 'string' || !nombre.trim()) return res.status(400).json({ error: 'nombre es obligatorio' });
    if (ctx.db.prepare('SELECT 1 FROM requisitos WHERE tipo = ?').get(tipo)) return res.status(409).json({ error: 'ese tipo ya existe' });
    const id = ctx.db.prepare('INSERT INTO requisitos (tipo, nombre, obligatorio) VALUES (?, ?, ?)')
      .run(tipo, nombre.trim(), obligatorio === false ? 0 : 1).lastInsertRowid;
    res.status(201).json({ requisito: ctx.db.prepare('SELECT * FROM requisitos WHERE id = ?').get(id) });
  });

  return r;
};
