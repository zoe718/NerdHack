'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createApp } = require('./app');
const { sembrarDemo } = require('./db');

const PORT = Number(process.env.PORT || process.env.UAK_PORT || 3000);
const DB_PATH = process.env.DB_PATH || path.join('data', 'jornada.db');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join('data', 'uploads');

if (DB_PATH !== ':memory:') fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const { app, ctx, close } = createApp({ dbPath: DB_PATH, uploadDir: UPLOAD_DIR, useValkey: process.env.USE_VALKEY === 'true' });

if (process.env.SEED_DEMO === 'true') console.log(`seed demo: ${sembrarDemo(ctx.db, new Date())} jornadas ficticias`);

// Despachador de recordatorios T-21/T-14: cada minuto, solo envía en horario hábil y con tope semanal.
const tick = () => ctx.despacharRecordatorios().catch((e) => console.error('recordatorios:', e.message));
const despachador = setInterval(tick, 60 * 1000);
despachador.unref();

const server = app.listen(PORT, () => console.log(`jornada-lista escuchando en :${PORT}`));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { clearInterval(despachador); server.close(); close(); process.exit(0); });
