'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createApp } = require('./app');

const PORT = Number(process.env.PORT || process.env.UAK_PORT || 3000);
const DB_PATH = process.env.DB_PATH || path.join('data', 'jornada.db');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join('data', 'uploads');

if (DB_PATH !== ':memory:') fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const { app, close } = createApp({ dbPath: DB_PATH, uploadDir: UPLOAD_DIR, useValkey: process.env.USE_VALKEY === 'true' });

const server = app.listen(PORT, () => console.log(`jornada-lista escuchando en :${PORT}`));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { server.close(); close(); process.exit(0); });
