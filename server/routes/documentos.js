'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const multer = require('multer');

const subida = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
// Revisión solo desde "recibido": pendiente→recibido es por subida; observado vuelve a recibido con una nueva versión.
const REVISABLES = new Set(['observado', 'aprobado']);

module.exports = (ctx) => {
  const r = express.Router();

  r.get('/documentos/:id', (req, res) => {
    const doc = ctx.repo.documento(Number(req.params.id));
    if (!doc) return res.status(404).json({ error: 'documento no encontrado' });
    res.json({ documento: doc });
  });

  r.post('/documentos/:id/archivo', subida.single('archivo'), (req, res) => {
    const id = Number(req.params.id);
    const doc = ctx.repo.documento(id);
    if (!doc) return res.status(404).json({ error: 'documento no encontrado' });
    if (!req.file) return res.status(400).json({ error: 'falta el campo archivo' });
    if (doc.estado === 'aprobado') return res.status(409).json({ error: 'el documento ya está aprobado' });

    const sha256 = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    const ext = path.extname(req.file.originalname || '').replace(/[^.\w]/g, '').slice(0, 10);
    const n = ctx.repo.q.maxN.get(id).n + 1;
    const ruta = path.join(ctx.uploadDir, `${id}-v${n}-${sha256.slice(0, 12)}${ext}`);
    fs.writeFileSync(ruta, req.file.buffer, { flag: 'wx' });
    ctx.repo.agregarVersion(id, { ruta, nombre: req.file.originalname || null, sha256 }, req.get('x-actor') || 'municipio', ctx.ts());
    ctx.publicar(doc.jornada_id, 'version_subida');
    const actualizado = ctx.repo.documento(id);
    res.status(201).json({ version: actualizado.versiones.find((v) => v.n === n), documento: actualizado });
  });

  r.get('/documentos/:id/versiones/:n/archivo', (req, res) => {
    const v = ctx.repo.version(Number(req.params.id), Number(req.params.n));
    if (!v) return res.status(404).json({ error: 'versión no encontrada' });
    res.download(v.archivo_ruta, v.archivo_nombre || path.basename(v.archivo_ruta));
  });

  r.post('/documentos/:id/revision', (req, res) => {
    const id = Number(req.params.id);
    const { estado, motivo } = req.body || {};
    if (!REVISABLES.has(estado)) return res.status(400).json({ error: 'estado debe ser observado o aprobado' });
    const motivoLimpio = typeof motivo === 'string' ? motivo.trim() : '';
    if (estado === 'observado' && !motivoLimpio) return res.status(400).json({ error: 'observado requiere motivo' });
    const doc = ctx.repo.documento(id);
    if (!doc) return res.status(404).json({ error: 'documento no encontrado' });
    if (doc.estado !== 'recibido') return res.status(409).json({ error: `no se puede revisar un documento ${doc.estado}` });
    ctx.repo.revisar(id, estado, motivoLimpio || null, req.get('x-actor') || 'coordinacion', ctx.ts());
    ctx.publicar(doc.jornada_id, `documento_${estado}`);
    res.json({ documento: ctx.repo.documento(id) });
  });

  return r;
};
