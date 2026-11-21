'use strict';
// createApp: arma Express con db, kv y reloj inyectables. Monta solo cada archivo de server/routes/ bajo /api:
// cada uno exporta (ctx) => express.Router(). Agregar una ruta = agregar un archivo, sin tocar este.
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const { createDb, repo } = require('./db');
const { createKv } = require('./kv');
const { hoyISO } = require('./semaforo');
const { despachar } = require('./reminders');
const { registrar } = require('./audit');

const RUTAS_DIR = path.join(__dirname, 'routes');

function createApp({
  dbPath = process.env.DB_PATH || ':memory:',
  db = null,
  kv = null,
  useValkey,
  now = () => new Date(),
  uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'data', 'uploads'),
} = {}) {
  const base = db || createDb(dbPath);
  const store = kv || createKv(useValkey === undefined ? {} : { useValkey });
  fs.mkdirSync(uploadDir, { recursive: true });

  const ctx = {
    db: base,
    repo: repo(base),
    kv: store,
    now,
    hoy: () => hoyISO(now()),
    ts: () => now().toISOString(),
    uploadDir,
    // Avisa a quien escuche la jornada (SSE en HACK-003). Nunca tumba la petición si el KV falla.
    publicar(jornadaId, evento = 'cambio') {
      Promise.resolve(store.publish(`jornada:${jornadaId}`, JSON.stringify({ evento, jornada_id: jornadaId })))
        .catch(() => {});
    },
    // Envía lo vencido (T-21/T-14) y lo deja en bitácora. index.js lo llama cada minuto.
    despacharRecordatorios: () => despachar(store, now(), async (m) => {
      const [jid, tipo] = String(m).split(':');
      const id = Number(jid);
      if (!ctx.repo.jornada(id)) return;
      registrar(ctx, id, 'sistema', 'recordatorio_enviado', { tipo });
      ctx.publicar(id, 'recordatorio');
    }),
  };

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true, kv: store.tipo, hoy: ctx.hoy() }));

  const rutas = fs.readdirSync(RUTAS_DIR).filter((f) => f.endsWith('.js')).sort();
  for (const f of rutas) app.use('/api', require(path.join(RUTAS_DIR, f))(ctx));
  app.locals.rutas = rutas;

  const web = path.join(__dirname, '..', 'web', 'dist');
  if (fs.existsSync(web)) {
    app.use(express.static(web));
    app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(web, 'index.html')));
  }

  app.use('/api', (_req, res) => res.status(404).json({ error: 'no_encontrado' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.status || (err.type === 'entity.parse.failed' ? 400 : err.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? 'error_interno' : err.message });
  });

  return { app, ctx, close() { base.close(); Promise.resolve(store.close()).catch(() => {}); } };
}

module.exports = { createApp };
